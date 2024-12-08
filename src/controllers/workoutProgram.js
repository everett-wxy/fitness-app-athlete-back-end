const pool = require("../db/db");

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
            workoutA: {
                lowerBody: {
                    exercise:
                        restructuredExerciseData["lower body"]["compound"][0],
                },
                chest: {
                    exercise: restructuredExerciseData["chest"]["compound"][0],
                },
                upperBack: {
                    exercise:
                        restructuredExerciseData["upper back"]["compound"][0],
                },
            },
            workoutB: {
                lowerBody: {
                    exercise:
                        restructuredExerciseData["lower body"]["compound"][0],
                },
                shoulders: {
                    exercise:
                        restructuredExerciseData["shoulder"]["compound"][0],
                },
                lowerBack: {
                    exercise:
                        restructuredExerciseData["lower back"]["compound"][0],
                },
            },
        };

        return workoutProgramFramework;
    } else {
        return { error: "No matching training preferences found" };
    }
};

const createWeeklyWorkouts = (
    workoutProgramFramework,
    trainingDaysPerWeek,
    numWeeks = 2
) => {
    const weeklyWorkouts = [];
    let lastWorkout = "A";

    // loop through the weeks
    for (let week = 1; week <= numWeeks; week++) {
        const weekWorkouts = [];

        // loop through the days
        for (let day = 1; day <= 7; day++) {
            // If the day is part of the training days (1, 3, 5 for 3 days a week)
            if (
                trainingDaysPerWeek === 3 &&
                (day === 1 || day === 3 || day === 5)
            ) {
                // check if the last workout was A or B
                if (lastWorkout === "A") {
                    if (day === 1 || day === 5) {
                        weekWorkouts.push({
                            day,
                            workout: workoutProgramFramework.workoutA,
                        });
                    } else {
                        weekWorkouts.push({
                            day,
                            workout: workoutProgramFramework.workoutB,
                        });
                    }
                    lastWorkout = "B";
                } else {
                    if (day === 1 || day === 5) {
                        weekWorkouts.push({
                            day,
                            workout: workoutProgramFramework.workoutB,
                        });
                    } else {
                        weekWorkouts.push({
                            day,
                            workout: workoutProgramFramework.workoutA,
                        });
                    }
                    lastWorkout = "A";
                }
            }
        }
        weeklyWorkouts.push({ week, workouts: weekWorkouts });
    }
    return weeklyWorkouts;
};

const addSetsToWorkouts = (weeklyTrainingProgram, trainingTimePerSession) => {
    // Determine sets based on training time
    let setsPerExercise;
    if (trainingTimePerSession <= 30) {
        setsPerExercise = 1;
    } else if (trainingTimePerSession <= 45) {
        setsPerExercise = 2;
    } else {
        setsPerExercise = 3;
    }

    // Add sets to each workout
    return weeklyTrainingProgram.map((week) => {
        const updatedWorkouts = week.workouts.map((workoutDay) => {
            const updatedWorkout = {};

            // Add sets for each muscle group in the workout
            for (const muscleGroup in workoutDay.workout) {
                updatedWorkout[muscleGroup] = {
                    exercise: workoutDay.workout[muscleGroup].exercise,
                    sets: setsPerExercise,
                };
            }

            return { ...workoutDay, workout: updatedWorkout };
        });

        return { ...week, workouts: updatedWorkouts };
    });
};

const addRepsToWorkouts = (trainingProgramWithSets, trainingPreferences) => {
    // Determine reps based on training goal
    let repsPerSet;
    if (trainingPreferences.training_goal === "Build Muscle") {
        repsPerSet = 8;
    } else if (trainingPreferences.training_goal === "Build Strength") {
        repsPerSet = 5;
    } else {
        repsPerSet = 12;
    }

    // Add reps to each workout
    return trainingProgramWithSets.map((week) => {
        const updatedWorkouts = week.workouts.map((workoutDay) => {
            const updatedWorkout = {};

            // Add reps for each muscle group in the workout
            for (const muscleGroup in workoutDay.workout) {
                updatedWorkout[muscleGroup] = {
                    exercise: workoutDay.workout[muscleGroup].exercise,
                    sets: workoutDay.workout[muscleGroup].sets,
                    reps: repsPerSet,
                };
            }
            return { ...workoutDay, workout: updatedWorkout };
        });

        return { ...week, workouts: updatedWorkouts };
    });
};

const addWeighsToWorkouts = async (
    trainingProgramWithReps,
    trainingPreferences
) => {
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

    return trainingProgramWithReps.map((week) => {
        const updatedWorkouts = week.workouts.map((workoutDay) => {
            const updatedWorkout = {};

            // Add reps for each muscle group in the workout
            for (const muscleGroup in workoutDay.workout) {
                updatedWorkout[muscleGroup] = {
                    exercise: workoutDay.workout[muscleGroup].exercise,
                    sets: workoutDay.workout[muscleGroup].sets,
                    reps: workoutDay.workout[muscleGroup].reps,
                    liftingWeights: liftingWeights,
                };
            }
            return { ...workoutDay, workout: updatedWorkout };
        });

        return { ...week, workouts: updatedWorkouts };
    });
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
        console.log("workout program: ", workoutProgramFramework);

        // create Weekly workouts program
        const weeklyTrainingProgram = createWeeklyWorkouts(
            workoutProgramFramework,
            trainingPreferences.training_days_per_week
        );

        console.dir(weeklyTrainingProgram, { depth: null });

        // add sets to workouts
        const trainingProgramWithSets = addSetsToWorkouts(
            weeklyTrainingProgram,
            trainingPreferences.training_time_per_session
        );

        console.log("\ntraining programs with sets:\n");
        console.dir(trainingProgramWithSets, { depth: null });

        // add reps to workouts
        const trainingProgramWithReps = addRepsToWorkouts(
            trainingProgramWithSets,
            trainingPreferences
        );

        console.log("\ntraining programs with reps:\n");
        console.dir(trainingProgramWithReps, { depth: null });

        // add lifting weights to workouts

        const trainingProgramWithWeights = await addWeighsToWorkouts(
            trainingProgramWithReps,
            trainingPreferences
        )

        console.log("\ntraining programs with weights:\n");
        console.dir(trainingProgramWithWeights, { depth: null });

        return res.status(201).json({
            message: "User preference created successfully",
            trainingProgram: trainingProgramWithWeights,
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

module.exports = { generateWorkoutProgram };
