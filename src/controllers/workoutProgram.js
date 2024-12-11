const pool = require("../db/db");
const { get } = require("../routers/auth");

const getTrainingPreferences = async (userId) => {
    try {
        // get preferences (goals, fitness level, time, day )
        const trainingPreferenceQuery = `
            SELECT training_goal, starting_fitness_level, training_days_per_week, training_time_per_session
            FROM training_preferences
            WHERE user_id = $1
        `;
        const trainingPreferenceQueryResult = await pool.query(
            trainingPreferenceQuery,
            [userId]
        );

        // trainingPreferenceQueryResult returns an object containing different KVP, I want to extract the 'rows' KVP, which contains an array of object

        if (trainingPreferenceQueryResult.rowCount === 0) {
            return { error: "Training preferences not found" };
        }

        // deconstructing the 'rows' KVP to extract specific value
        const {
            training_goal,
            starting_fitness_level,
            training_days_per_week,
            training_time_per_session,
        } = trainingPreferenceQueryResult.rows[0];

        // get gender and age
        const genderAgeQuery = `
            SELECT
                EXTRACT(YEAR FROM age(date_of_birth)) AS age,
                gender
            FROM users
            WHERE id = $1
        `;

        const genderAgeQueryResult = await pool.query(genderAgeQuery, [userId]);

        const { age, gender } = genderAgeQueryResult.rows[0];

        // get latest weight entry
        const weightQuery = `
            SELECT weight
            FROM physical_measurements
            WHERE user_id = $1
            ORDER BY date_time DESC
            LIMIT 1;
        `;
        const weightQueryResult = await pool.query(weightQuery, [userId]);

        const { weight } = weightQueryResult.rows[0];

        return {
            training_goal,
            starting_fitness_level,
            training_days_per_week,
            training_time_per_session,
            age,
            gender,
            weight,
        };
    } catch (error) {
        return { error: error.message };
    }
};

const getAccessibleExercises = async (userId) => {
    // get primary key of exercises that user has access to
    try {
        const query = `
        SELECT DISTINCT ee.exercise_name
        FROM user_equipments ue
        JOIN exercise_equipments ee
        ON ue.equipment_name = ee.equipment_name
        WHERE ue.user_id = $1
    `;
        const result = await pool.query(query, [userId]);
        return result.rows.map((row) => row.exercise_name);
    } catch (error) {
        console.error("Error retrieving accessible exercises: ", error);
        return [];
    }
};

const filterExercisesByGoal = async (accessibleExercises, trainingGoal) => {
    try {
        let exercise_modality = "";
        switch (trainingGoal) {
            case "Build Muscle":
                exercise_modality = "strength training";
                break;
            case "Build Strength":
                exercise_modality = "strength training";
                break;
            case "Prepare for a 10k":
                exercise_modality = "cardiovascular and endurance training";
                break;
            case "General Fitness":
                exercise_modality = "";
                break;
            default:
                exercise_modality = "";
        }
        const filteredExerciseQuery = await pool.query(
            `SELECT * FROM exercises
            WHERE name = ANY($1::text[])
            AND exercise_modalities = $2`,
            [accessibleExercises, exercise_modality]
        );
        return filteredExerciseQuery.rows;
    } catch (error) {
        console.error("Error retrieving exercises: ", error);
        return [];
    }
};

const restructureExerciseData = (filteredExercises) => {
    const restructuredData = {}; // This is where we store the restructured data

    filteredExercises.forEach((exercise) => {
        const { primary_muscle_group, movement_type, name } = exercise;

        // Initialize the muscle group if not present
        if (!restructuredData[primary_muscle_group]) {
            restructuredData[primary_muscle_group] = {};
        }

        // Initialize the movement type if not present
        if (!restructuredData[primary_muscle_group][movement_type]) {
            restructuredData[primary_muscle_group][movement_type] = [];
        }

        // Add the exercise name to the appropriate category
        restructuredData[primary_muscle_group][movement_type].push(name);
    });

    console.log("restructuredData: ", restructuredData);

    return restructuredData; // Return the final categorized structure
};

const createProgramFramework = (
    trainingPreferences,
    restructuredExerciseData
) => {
    if (
        trainingPreferences.training_goal === "Build Muscle" &&
        trainingPreferences.starting_fitness_level === "Beginner"
    ) {
        const workoutProgramFramework = {
            title: "Beginner 5 x 5",
            description:
                "The Strongman 5x5 workout is an excellent training routine for beginners looking to build strength, power, and functional fitness. Inspired by the strength and endurance demands of traditional strongman events, this workout focuses on compound movements that target multiple muscle groups, helping you develop overall body strength, improve stability, and increase athletic performance.",
            workoutProgram: [
                {
                    description: "full body workout A",
                    exercises: [
                        {
                            exercise:
                                restructuredExerciseData["lower body"][
                                    "compound"
                                ][0],
                        },
                        {
                            exercise:
                                restructuredExerciseData["chest"][
                                    "compound"
                                ][0],
                        },
                        {
                            exercise:
                                restructuredExerciseData["upper back"][
                                    "compound"
                                ][0],
                        },
                    ],
                },
                {
                    description: "full body workout B",
                    exercises: [
                        {
                            exercise:
                                restructuredExerciseData["lower body"][
                                    "compound"
                                ][0],
                        },
                        {
                            exercise:
                                restructuredExerciseData["shoulder"][
                                    "compound"
                                ][0],
                        },
                        {
                            exercise:
                                restructuredExerciseData["lower back"][
                                    "compound"
                                ][0],
                        },
                    ],
                },
            ],
        };

        return workoutProgramFramework;
    } else {
        return { error: "No matching training preferences found" };
    }
};

const createProgramSkeleton = (
    workoutProgramFramework,
    trainingDaysPerWeek,
    numWeeks = 2,
    startDate = new Date()
) => {
    const weeklyWorkouts = [];
    let lastWorkout = "A";
    let currentDate = new Date(startDate); // Initialize the current date to the start date

    // Set the current date to the next Monday if it's not already Monday
    const dayOfWeek = currentDate.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 6 : (1 - dayOfWeek + 7) % 7;
    currentDate.setDate(currentDate.getDate() + daysUntilMonday); // Set currentDate to the next Monday
    let sessionNo = 1;

    // Loop through the weeks
    for (let week = 1; week <= numWeeks; week++) {
        // Loop through the days (1 to 7, representing each day of the week)
        for (let day = 1; day <= 7; day++) {
            // Only train on selected days (1, 3, 5 for 3 days a week)
            if (
                trainingDaysPerWeek === 3 &&
                (day === 1 || day === 3 || day === 5)
            ) {
                let currentWorkout;
                let currentWorkoutTitle;
                // Decide which workout to assign
                if (lastWorkout === "A") {
                    currentWorkout =
                        workoutProgramFramework.workoutProgram[1].exercises;
                    currentWorkoutTitle = "Workout B";
                    lastWorkout = "B"; // Switch to workout B for the next workout
                } else {
                    currentWorkout =
                        workoutProgramFramework.workoutProgram[0].exercises;
                    currentWorkoutTitle = "Workout A";
                    lastWorkout = "A"; // Switch to workout A for the next workout
                }

                // Push the workout for the day
                weeklyWorkouts.push({
                    week: week,
                    sessionNo: sessionNo++,
                    dayOfWeek: day,
                    date: new Date(
                        new Date(currentDate).setHours(0, 0, 0, 0) // Reset time to midnight
                    ),
                    title: currentWorkoutTitle,
                    workout: currentWorkout, // Assign the workout based on the alternation
                });
            }
            // Increment to the next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    return { programSkeleton: weeklyWorkouts, numWeeks };
};

const addSetsToWorkouts = (programSkeleton, trainingTimePerSession) => {
    let setsPerExercise;
    if (trainingTimePerSession <= 30) {
        setsPerExercise = 1;
    } else if (trainingTimePerSession <= 45) {
        setsPerExercise = 2;
    } else {
        setsPerExercise = 3;
    }

    const programWithSets = programSkeleton.map((session) => {
        const addSets = session.workout.map((exercise) => {
            return { ...exercise, sets: setsPerExercise };
        });

        return { ...session, workout: addSets };
    });

    return programWithSets;
};

const addRepsToWorkouts = (programWithSets, trainingPreferences) => {
    let repsPerSet;
    if (trainingPreferences.training_goal === "Build Muscle") {
        repsPerSet = 8;
    } else if (trainingPreferences.training_goal === "Build Strength") {
        repsPerSet = 5;
    } else {
        repsPerSet = 12;
    }

    const programWithReps = programWithSets.map((session) => {
        const addReps = session.workout.map((exercise) => {
            return { ...exercise, reps: repsPerSet };
        });
        return { ...session, workout: addReps };
    });
    console.log("program with reps:", programWithReps);

    return programWithReps;
};

const addWeighsToWorkouts = async (programWithReps, trainingPreferences) => {
    let liftingWeights;
    if (
        trainingPreferences.starting_fitness_level === "Beginner" &&
        trainingPreferences.gender === "Male"
    ) {
        liftingWeights = trainingPreferences.weight * 0.5;
    } else if (
        trainingPreferences.starting_fitness_level === "Beginner" &&
        trainingPreferences.gender === "Female"
    ) {
        liftingWeights = trainingPreferences.weight * 0.3;
    }

    return programWithReps.map((session) => {
        const updatedExercises = session.workout.map((exercise) => {
            return { ...exercise, weight: liftingWeights };
        });
        return { ...session, workout: updatedExercises };
    });
};

const insertWorkoutProgram = async (
    userId,
    workoutProgramFramework,
    numWeeks,
    frequency
) => {
    try {
        const query = `
            INSERT INTO workout_programs (user_id, title, description, length, frequency)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;
        const result = await pool.query(query, [
            userId,
            workoutProgramFramework.title,
            workoutProgramFramework.description,
            numWeeks,
            frequency,
        ]);
        const programId = result.rows[0].id; // This is the auto-generated program_id
        return programId;
    } catch (error) {
        console.error("Error inserting workout program: ", error);
        return null;
    }
};

const insertSessions = async (programId, programWithWeight, length) => {
    const programWithSessionId = [];
    try {
        for (const session of programWithWeight) {
            // console.log(`programId: ${programId}, session date: ${session.date}, week of training: ${session.dayOfweek}, session no: ${session.sessionNo}`);

            const query = `
                    INSERT INTO sessions (program_id, session_date, week_of_training, completed, session_no, title, length)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id;
                `;

            const insertSessionResult = await pool.query(query, [
                programId,
                session.date,
                session.week,
                false, // initially not completed
                session.sessionNo,
                session.title,
                length,
            ]);

            const sessionId = insertSessionResult.rows[0].id;
            const updatedSessionWithId = { ...session, sessionId };
            programWithSessionId.push(updatedSessionWithId);
        }

        return programWithSessionId;
    } catch (error) {
        console.error("Error inserting sessions: ", error);
        return [];
    }
};

const insertSessionDetails = async (programWithSessionId) => {
    try {
        for (const session of programWithSessionId) {
            let exerciseNo = 1; // Initialize exercise_no counter for the session
            for (const exercise of session.workout) {
                for (
                    let setNumber = 1;
                    setNumber <= exercise.sets;
                    setNumber++
                ) {
                    const query = `
                        INSERT INTO session_details (session_id, exercise_name, exercise_no, sets, reps, weight)
                        VALUES ($1, $2, $3, $4, $5, $6);
                    `;

                    await pool.query(query, [
                        session.sessionId,
                        exercise.exercise,
                        exerciseNo,
                        setNumber,
                        exercise.reps,
                        exercise.weight,
                    ]);
                }
                exerciseNo++;
            }
        }
    } catch (error) {
        console.error("Error inserting session details: ", error);
    }
};

const generateWorkoutProgram = async (req, res) => {
    const { userId } = req.decoded;

    try {
        // get training goal
        const trainingPreferences = await getTrainingPreferences(userId);
        if (trainingPreferences.error) {
            return res.status(404).json({ error: trainingPreferences.error });
        }
        console.log("training preferences: ", trainingPreferences);

        // get exercise accessible by user
        const accessibleExercises = await getAccessibleExercises(userId);
        if (accessibleExercises.length === 0) {
            return res
                .status(404)
                .json({ error: "No accessible exercises found for user" });
        }

        console.log("accessible exercises: ", accessibleExercises);

        // get exercise filtered by training goal
        const filteredExercises = await filterExercisesByGoal(
            accessibleExercises,
            trainingPreferences.training_goal
        );

        if (filteredExercises.length === 0) {
            return res
                .status(404)
                .json({ error: "No exercises match the training goal" });
        }
        console.log("filtered exercises: ", filteredExercises);

        // restructure exercise data
        const restructuredExerciseData =
            restructureExerciseData(filteredExercises);
        console.log(restructuredExerciseData);

        // create programframework
        const workoutProgramFramework = createProgramFramework(
            trainingPreferences,
            restructuredExerciseData
        );
        console.log("\nworkout program framework: \n");
        console.dir(workoutProgramFramework, { depth: null });

        // create Weekly workouts program
        const programSkeletonOutput = createProgramSkeleton(
            workoutProgramFramework,
            trainingPreferences.training_days_per_week
        );

        const { programSkeleton, numWeeks } = programSkeletonOutput;

        console.log("\nProgram Skeleton:\n");
        console.dir(programSkeleton, { depth: null });

        // add sets to workouts
        const programWithSets = addSetsToWorkouts(
            programSkeleton,
            trainingPreferences.training_time_per_session
        );

        console.log("\ntraining programs with sets:\n");
        console.dir(programWithSets, { depth: null });

        // add reps to workouts
        const programWithReps = addRepsToWorkouts(
            programWithSets,
            trainingPreferences
        );

        console.log("\ntraining programs with reps:\n");
        console.dir(programWithReps, { depth: null });

        // add lifting weights to workouts

        const programWithWeights = await addWeighsToWorkouts(
            programWithReps,
            trainingPreferences
        );

        console.log("\ntraining programs with weights:\n");
        console.dir(programWithWeights, { depth: null });

        const programId = await insertWorkoutProgram(
            userId,
            workoutProgramFramework,
            numWeeks,
            trainingPreferences.training_days_per_week
        );
        if (!programId) {
            return res
                .status(500)
                .json({ error: "Failed to insert workout program." });
        }

        console.log("program id: ", programId);

        const programWithSessionId = await insertSessions(
            programId,
            programWithWeights,
            trainingPreferences.training_time_per_session
        );

        console.log("updated session with id: ");
        console.dir(programWithSessionId, { depth: null });

        await insertSessionDetails(programWithSessionId);

        return res.status(201).json({
            message: "User workout program created successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// const req = {
//     decoded: {
//         userId: 10,
//     },
// };
// const res = {
//     status: (statusCode) => ({
//         json: (response) =>
//             console.log(`Response: ${JSON.stringify(response)}`),
//     }),
// };

// generateWorkoutProgram(req, res);

const getWorkoutProgram = async (req, res) => {
    const { userId } = req.decoded;

    try {
        const programQuery = `
            SELECT id, title, description, length, frequency
            FROM workout_programs
            WHERE user_id = $1
            ORDER by id DESC
            LIMIT 1`;

        const programQueryResult = await pool.query(programQuery, [userId]);
        if (programQueryResult.rowCount === 0) {
            return res
                .status(404)
                .json({ error: "No workout program found for this user" });
        }

        const program = programQueryResult.rows[0];

        const sessionsQuery = `
            SELECT id as session_id, session_date, week_of_training, completed, session_no, title, length
            FROM sessions
            WHERE program_id = $1
            ORDER BY session_date ASC
            `;
        const sessionsResult = await pool.query(sessionsQuery, [program.id]);
        const sessions = sessionsResult.rows;

        const sessionsDetails = await Promise.all(
            sessions.map(async (session) => {
                //.map() returns an array
                const detailsQuery = `
                    SELECT session_id, exercise_name, sets, reps, weight, completed, exercise_no
                    FROM session_details
                    WHERE session_id = $1;
                `;

                const { rows: sessionDetailArray } = await pool.query(
                    detailsQuery,
                    [session.session_id]
                );

                /* 
                    query result returned is an object in this format: 
                        {rows: :[array of rows returned from the query] }
                    the number of elements in the array in the property 'rows' is the corresponding number of session_details entities  that matches query condition 
                    
                    e.g., if session_id X has 2 session details, the 'rows' property will contain an array of 2 objects 
                    [
                        { id: 1, session_id: 1, exercise_name: "Barbell Squats", sets: 3, reps: 8, weight: 100, completed: false },
                        { id: 2, session_id: 1, exercise_name: "Deadlift", sets: 3, reps: 6, weight: 150, completed: false },
                    ]
                    
                    { rows: sessionDetailArray } deconstructs the object and extracts the 'rows' property's value (an array of objects) and assigns it to the variable sessionDetailsArray 
                    sessionDetailsArray is an array of objects, each object represents a session detail entity

                    */

                return sessionDetailArray;
                // each sessionDetailArray is returned as an element in the array returned by .map() and assigned to the variable sessionsWithDetails
            })
        );

        const flattenedSessionsDetails = sessionsDetails.flat(); // Flatten the array to remove the first level of nesting

        // Combine everything into the response
        return res.status(200).json({
            message: "Workout program retrieved successfully",
            program: {
                program: program,
                sessions: sessions,
                sessionDetails: flattenedSessionsDetails,
            },
        });
    } catch (error) {
        console.error("Error retrieving workout program: ", error);
        return res.status(500).json({ error: error.message });
    }
};

const updateSessionDetailsRepsWeight = async (req, res) => {
    const { session_id, exercise_name, sets, reps, weight, completed } = req.body;

    try {
        const result = await pool.query(
            `UPDATE session_details 
             SET reps = $1, weight = $2, completed = $3 
             WHERE session_id = $4 AND exercise_name = $5 AND sets = $6
             RETURNING *`,
            [reps, weight, completed, session_id, exercise_name, sets]
        );

        if (result.rowCount === 0) {
            return res
                .status(404)
                .json({ error: "Session detail not found for update" });
        }

        return res.status(200).json({
            message: "Session detail updated successfully",
            updatedSessionDetail: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating session detail: ", error);
        return res.status(500).json({ error: error.message });
    }
};

const updateSessionDetailsAddSet = async (req, res) => {
    const { session_id, exercise_name, reps, weight } = req.body;
    try {
        // Find the next set number for the exercise
        const maxSetResult = await pool.query(
            `SELECT MAX(sets) AS max_set 
             FROM session_details 
             WHERE session_id = $1 AND exercise_name = $2`,
            [session_id, exercise_name]
        );

        const nextSet = (maxSetResult.rows[0].max_set || 0) + 1;

        // Insert the new set into the database
        const result = await pool.query(
            `INSERT INTO session_details (session_id, exercise_name, sets, reps, weight, completed) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [session_id, exercise_name, nextSet, reps, weight, false]
        );

        // Return the newly added session detail
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error adding new set:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateSessionDetailsDeleteSet = async (req, res) => {
    const { session_id, exercise_name, sets } = req.body;

    try {
        // Delete the specific set for the exercise
        const result = await pool.query(
            `DELETE FROM session_details 
             WHERE session_id = $1 AND exercise_name = $2 AND sets = $3 
             RETURNING *`,
            [session_id, exercise_name, sets]
        );

        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ message: "Session detail not found" });
        }

        // Return the deleted session detail
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error deleting session detail:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    generateWorkoutProgram,
    getWorkoutProgram,
    updateSessionDetailsRepsWeight,
    updateSessionDetailsAddSet,
    updateSessionDetailsDeleteSet,
};
