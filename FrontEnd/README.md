# Employee Attendance System - Frontend

This is the frontend for the Employee Attendance System, built with React and TypeScript.

## Features

-   Employee and Manager login
-   Employee registration
-   Employee dashboard with check-in/check-out functionality and attendance history
-   Manager dashboard with team attendance summary, work duration charts, and full team history
-   Export attendance data to CSV for both employees and managers

## Getting Started

### Prerequisites

-   Node.js and npm
-   A running instance of the [backend server](<path_to_your_backend_repo>).

### Installation

1.  Clone the repository.
2.  Navigate to the `FrontEnd` directory: `cd FrontEnd`
3.  Install dependencies: `npm install`
4.  Create a `.env` file in the `FrontEnd` directory and add the following, pointing to your backend API:

    ```
    REACT_APP_API_URL=http://localhost:5000/api
    ```

5.  Start the development server: `npm start`

The application will be available at `http://localhost:3000`.
