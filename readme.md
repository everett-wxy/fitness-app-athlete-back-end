

## Overview of Athlete 
Athlete is a full-stack fitness planning app I built to help users generate structured workout programs based on their goals, fitness level, available training days, and equipment access.

## Problem
Many beginners struggle to create structured workout plans that match their goals and available equipment. This app helps users go from onboarding to a generated workout schedule with trackable sessions.

# Table of content
1. Screenshots
2. Key features
3. Technologies used 
4. ERD & planning materials
5. Getting started
6. Future enhancement 
7. Attribution

## Screenshots 
### Login page 
<img width="1702" alt="image" src="https://github.com/user-attachments/assets/a936c48a-0e6f-47f9-adc5-aeb32a8d28bf" />

### Workout program review page 
<img width="1708" alt="image" src="https://github.com/user-attachments/assets/e47ee86f-9c08-496a-863a-7eceba9624b2" />

### Account creation page 
<img width="697" alt="image" src="https://github.com/user-attachments/assets/55583433-b0ac-49c5-b81c-221a352b2b6c" />

### Planner page
<img width="1706" alt="image" src="https://github.com/user-attachments/assets/30d4a7d7-25de-475e-afc7-5a455560b5f2" />

### Exercise page
<img width="396" alt="image" src="https://github.com/user-attachments/assets/3cf9eb99-90ba-4a6c-8be2-5985c641f2b8" />


## Key Features

- User registration and login
- Multi-step onboarding flow
- Training preference collection
- Equipment-based exercise filtering
- Workout program generation
- Weekly planner
- Session and set completion tracking

## Technology Stack
The app was built with React and Vite on the frontend, Express and Node.js on the backend, and PostgreSQL as the database. I also used JWT for authentication, bcrypt for password hashing, React Router for page routing, and React Context API to share workout program state across components.

Frontend: React, Vite, TailwindCSS, React Router, Context API
Backend: Node.js, Express.js
Database: PostgreSQL
Authentication: JWT, bcrypt

## Architecture / dataflow
1. User completes onboarding
2. frontend sends profile/preferences to Express backend
3. backend stores data in PostgreSQL
4. workout generator generate customised program based on user inputs by:
      1. filtering exercises from the database based on the user’s training goal and available equipment
      2. organizing exercises by muscle group and movement type
      3. selecting suitable exercises for each workout session
      4. generating the weekly training structure, including number of sessions per week
      5. assigning sets, reps, and starting weights for each exercise
5. generated program is saved as workout_programs, sessions, and session_details
6. frontend displays program in planner/session views

## Workout Generation Logic
The backend receives the onboarding data through Express routes and stores it in PostgreSQL. The user's details, measurement, training preferences, and equipment access are stored in separate relational tables.

![Database ER diagram (crow's foot)](https://github.com/user-attachments/assets/de3f749e-0df9-4bfb-90e6-2e99fe7b34e1)

The generated program is saved across workout_programs, sessions, and session_details, which keeps the structure clean. One program has many sessions, and each session has many exercise sets. 

The workout generator uses the user's training preferences and equipment access to select suitable exercises from the database. It filters exercises based on the user's goal and available equipment, then organises them by muscle group and movement type. From there, it creates a weeekly training structure with sessions, exercises, sets, reps and starting weights. 

## Limitations and future imporovement 
Current limitations:
- Workout generation is rule-based and supports limited program types
- JWT is stored in localStorage
- Some onboarding API calls can be better sequenced with stronger error handling
- Database setup scripts can be cleaned up

Future improvements:
- Add workout history analytics
- Improve the workout generator to support more program types
- Add progressive overload logic
- Use TanStack Query for server state
- Improve auth with HTTP-only cookies

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v14 or higher)

### Steps
1. Clone both the frontend and backend repository:
   ```bash
   git clone https://github.com/everett-wxy/fitness-app-athlete-back-end.git
   ```
   ```bash
   git clone https://github.com/everett-wxy/fitness-app-athlete-back-end.git)](https://github.com/everett-wxy/fitness-app-athlete-front-end.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   
3. Create a .env file in the backend project directory with the following variables
   ```
   DB_HOST=localhost
   DB_USER='username'
   DB_NAME='database name'
   DB_PORT='DB port' 
   ACCESS_TOKEN_SECRET='randomly generated strings'
   REFRESH_TOKEN_SECRET='randomly generated strings'
   PORT=5001
   ```

4. Create a .env file in the frontend project directory with the following variables
   ```
   VITE_SERVER=http://127.0.0.1:5001
   ```

6. Set up the database:
   - Create a PostgreSQL database.
   - Run the provided SQL scripts in the table.sql file to create the necessary tables and input the necessary data.

7. Start the backend server:
   ```bash
   npm run dev
   ```

8. Start the frontend development server:
   ```bash
   npm run dev
   ```


User goals and stretch goals [trello board](https://trello.com/b/JELkG16e/pt-app)

Link to frontend repo: (https://github.com/everett-wxy/fitness-app-athlete-front-end.git)

## Usage
1. **Generate a Workout Program**: Input your preferences (e.g., available days, fitness goals).
2. **View Sessions**: Navigate through sessions to see scheduled workouts.
3. **Track Progress**: Mark exercises and sessions as completed.
4. **Rest Days**: Enjoy motivational and recovery advice on designated rest days.
5. **Plan Ahead**: Use the planner feature to adjust your training schedule as needed.

## Attributions
- unsplash.com for images illustrating the exercises
- pexels.com for videos on the login page

