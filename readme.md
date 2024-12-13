# Athlete

## Overview
This fitness app is designed to help users plan, track, and complete their workouts efficiently. It provides a personalized workout experience by generating training programs based on user preferences, tracking progress, and offering support for both training and rest days. The app is built with scalability and user engagement in mind, combining a rich frontend with a powerful backend.

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
<img width="1706" alt="image" src="https://github.com/user-attachments/assets/d85f7c8b-c609-4b69-8bed-65d0aa8684a2" />

## Key Features

### 1. **Workout Program Generator**
- Generates customized workout programs tailored to the user's available training days and fitness goals.
- Tracks program length, session frequency, and exercises.

### 2. **Session Management**
- Displays details for each session, including title, week number, session number, and duration.
- Allows users to view exercises grouped by sets and track completion status.
- Supports navigation to detailed session pages for more information or progress updates.

### 3. **Rest Day Support**
- Highlights rest days and provides motivational prompts to recover and recharge.
- Ensures rest days are distinct from training days based on session data.

### 4. **Progress Tracking**
- Marks sessions and exercises as completed or pending.
- Provides an intuitive view of progress through the program.

### 5. **User-Friendly Interface**
- Clean and modern UI using React and TailwindCSS.
- Responsive design ensures compatibility across devices.

### 6. **Backend Support**
- Backend integration using the PERN stack (PostgreSQL, Express, React, Node.js).
- Handles workout program and session data with efficient database design.

## Technology Stack
- **Frontend**: React, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Raw SQL for advanced querying)
- **State Management**: Context API for managing workout program data

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v14 or higher)

### Steps
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd fitness-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3a. Create a .env file in the backend project directory with the following variables 
DB_HOST=localhost
DB_USER='username'
DB_NAME='database name'
DB_PORT='DB port' 
ACCESS_TOKEN_SECRET='randomly generated strings'
REFRESH_TOKEN_SECRET='randomly generated strings'
PORT=5001 

3b. Create a .env file in the frontend project directory with the following variables
VITE_SERVER=http://127.0.0.1:5001

4. Set up the database:
   - Create a PostgreSQL database.
   - Run the provided SQL scripts in the table.sql file to create the necessary tables and input the necessary data.

5. Start the backend server:
   ```bash
   npm run server
   ```

6. Start the frontend development server:
   ```bash
   npm start
   ```

## Usage
1. **Generate a Workout Program**: Input your preferences (e.g., available days, fitness goals).
2. **View Sessions**: Navigate through sessions to see scheduled workouts.
3. **Track Progress**: Mark exercises and sessions as completed.
4. **Rest Days**: Enjoy motivational and recovery advice on designated rest days.
5. **Plan Ahead**: Use the planner feature to adjust your training schedule as needed.


## Future Enhancements
- Add community features like sharing workout plans or progress.
- Enable integration with wearable devices for automatic progress tracking.
- Incorporate AI for smarter workout program recommendations.

## Attributions
- unsplash.com for images illustrating the exercises
- pexels.com for videos on the login page

