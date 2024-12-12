CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT now(),
    role VARCHAR
);

CREATE TABLE public.workout_programs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR NOT NULL,
    length INTEGER NOT NULL,
    frequency INTEGER NOT NULL,
    CONSTRAINT workout_programs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.user_equipments (
    user_id INTEGER NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id, equipment_name),
    CONSTRAINT user_equipments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) 
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT user_equipments_equipment_name_fkey FOREIGN KEY (equipment_name) REFERENCES public.equipments(name) 
        ON DELETE CASCADE
);

CREATE TABLE public.training_preferences (
    user_id INTEGER NOT NULL,
    training_goal VARCHAR(255),
    training_days_per_week INTEGER,
    training_time_per_session INTEGER,
    starting_fitness_level VARCHAR(255),
    PRIMARY KEY (user_id),
    CONSTRAINT training_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) 
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE public.sessions (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL,
    session_date DATE NOT NULL,
    week_of_training INTEGER NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    session_no INTEGER NOT NULL,
    title VARCHAR NOT NULL,
    length INTEGER NOT NULL,
    CONSTRAINT sessions_workout_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.workout_programs(id) 
        ON DELETE CASCADE NOT VALID
);

CREATE TABLE public.session_details (
    session_id INTEGER NOT NULL,
    exercise_name VARCHAR(255) NOT NULL,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight NUMERIC(5,1) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    exercise_no INTEGER NOT NULL,
    PRIMARY KEY (session_id, exercise_name, sets),
    CONSTRAINT session_details_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) 
        ON DELETE CASCADE NOT VALID,
    CONSTRAINT session_details_exercise_name_fkey FOREIGN KEY (exercise_name) REFERENCES public.exercises(name)
);

CREATE TABLE public.physical_measurements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    weight NUMERIC(5,2) NOT NULL,
    height INTEGER NOT NULL,
    CONSTRAINT physical_measurements_user_id_date_time UNIQUE (user_id, date_time),
    CONSTRAINT physical_measurements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) 
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE public.exercises (
    name VARCHAR(255) PRIMARY KEY,
    exercise_modalities VARCHAR(255),
    primary_muscle_group VARCHAR(255),
    movement_type VARCHAR(255)
);

CREATE TABLE public.exercise_equipments (
    exercise_name VARCHAR(255) NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (exercise_name, equipment_name),
    CONSTRAINT exercise_equipments_exercise_name_fkey FOREIGN KEY (exercise_name) REFERENCES public.exercises(name) 
        ON DELETE CASCADE,
    CONSTRAINT exercise_equipments_equipment_name_fkey FOREIGN KEY (equipment_name) REFERENCES public.equipments(name) 
        ON DELETE CASCADE
);

INSERT INTO public.exercises (name, exercise_modalities, primary_muscle_group, movement_type)
VALUES
    ('dumbbell bench press', 'strength training', 'chest', 'compound'),
    ('barbell bench press', 'strength training', 'chest', 'compound'),
    ('dumbbell rows', 'strength training', 'upper back', 'compound'),
    ('barbell rows', 'strength training', 'upper back', 'compound'),
    ('deadlift', 'strength training', 'lower back', 'compound'),
    ('lats pull down', 'strength training', 'upper back', 'compound'),
    ('pull up', 'strength training', 'upper back', 'compound'),
    ('barbell shoulder press', 'strength training', 'shoulder', 'compound'),
    ('barbell squats', 'strength training', 'lower body', 'compound'),
    ('pistol squats', 'strength training', 'lower body', 'compound'),
    ('bodyweight squats', 'strength training', 'lower body', 'compound'),
    ('goblet squat', 'strength training', 'lower body', 'compound'),
    ('lunges', 'strength training', 'lower body', 'compound'),
    ('leg press', 'strength training', 'lower body', 'compound'),
    ('dumbbell shoulder press', 'strength training', 'shoulder', 'compound');


INSERT INTO public.exercise_equipments (exercise_name, equipment_name)
VALUES
    ('dumbbell bench press', 'bench'),
    ('dumbbell bench press', 'dumbbell'),
    ('barbell bench press', 'barbell'),
    ('barbell bench press', 'bench'),
    ('dumbbell rows', 'dumbbell'),
    ('barbell rows', 'barbell'),
    ('deadlift', 'barbell'),
    ('lats pull down', 'lat pulldown machine'),
    ('pull up', 'pull up bar'),
    ('dumbbell shoulder press', 'dumbbell'),
    ('barbell shoulder press', 'barbell'),
    ('barbell squats', 'barbell'),
    ('barbell squats', 'squat rack'),
    ('goblet squat', 'dumbbell'),
    ('leg press', 'leg press machine');


CREATE TABLE public.equipments (
    name VARCHAR(255) PRIMARY KEY
);

INSERT INTO public.equipments (name) 
VALUES
    ('leg press machine'),
    ('lat pulldown machine'),
    ('cable crossover machine'),
    ('exercise bike (stationary)'),
    ('elliptical trainer'),
    ('rowing machine'),
    ('bench'),
    ('barbell'),
    ('squat rack'),
    ('pull up bar'),
    ('dumbbell');


CREATE TABLE public.equipment_accesses (
    equipment_name VARCHAR(255) NOT NULL,
    access_category_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (equipment_name, access_category_name),
    CONSTRAINT equipment_accesses_equipment_name_fkey FOREIGN KEY (equipment_name) REFERENCES public.equipments(name) 
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT equipment_accesses_access_category_name_fkey FOREIGN KEY (access_category_name) REFERENCES public.access_categories(name) 
        ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO public.equipment_accesses (equipment_name, access_category_name)
VALUES
    ('leg press machine', 'every equipment'),
    ('leg press machine', 'basic equipment'),
    ('lat pulldown machine', 'every equipment'),
    ('lat pulldown machine', 'basic equipment'),
    ('cable crossover machine', 'every equipment'),
    ('cable crossover machine', 'basic equipment'),
    ('exercise bike (stationary)', 'every equipment'),
    ('exercise bike (stationary)', 'basic equipment'),
    ('elliptical trainer', 'every equipment'),
    ('elliptical trainer', 'basic equipment'),
    ('rowing machine', 'every equipment'),
    ('rowing machine', 'basic equipment'),
    ('dumbbell', 'every equipment'),
    ('dumbbell', 'basic equipment'),
    ('bench', 'every equipment'),
    ('bench', 'basic equipment'),
    ('barbell', 'every equipment'),
    ('barbell', 'basic equipment'),
    ('squat rack', 'every equipment'),
    ('squat rack', 'basic equipment'),
    ('pull up bar', 'every equipment'),
    ('pull up bar', 'basic equipment');

CREATE TABLE public.access_categories (
    name VARCHAR(255) PRIMARY KEY
);

INSERT INTO public.access_categories (name) 
VALUES 
    ('every equipment'),
    ('basic equipment'),
    ('no equipment');
