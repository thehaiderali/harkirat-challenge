
# Live Attendance System

This project implements a live attendance system with a RESTful API backend (built with Express.js and MongoDB) and a simple frontend (HTML, CSS, JavaScript with Tailwind CSS). It allows teachers to create classes, add students, start/end attendance sessions, and enables students to mark their presence during an active session.

**Assignment Link:** [Backend WebSocket Live Attendance System](https://brindle-goal-102.notion.site/Backend-WebSocket-Live-Attendance-System-2c646b36b2e980b09b42d7c0240a8170)

## Features

### Backend
*   **User Authentication:** Signup and Login for both teachers and students using JWT for authorization.
*   **Class Management (Teacher):**
    *   Create new classes.
    *   Add existing student users to classes.
    *   View details of their created classes, including enrolled students.
    *   Start and end an attendance session for a class.
*   **Attendance Management:**
    *   Students can view their attendance status for enrolled classes.
    *   Students can mark themselves "present" during an active attendance session for their enrolled class.
    *   **Note:** Initially planned for WebSockets for real-time updates as per the assignment, this implementation uses a RESTful polling approach for attendance session status.
*   **Data Validation:** Utilizes Zod for robust request body validation.

### Frontend
*   **User Interface:** A single-page application built with HTML, vanilla JavaScript, and styled with Tailwind CSS.
*   **Role-Based Dashboards:** Separate dashboards for teachers and students after login.
*   **Teacher Dashboard:**
    *   Form to create new classes.
    *   List of created classes with "View Details" option.
    *   Class detail view to add students (via dropdown of all registered students).
    *   Buttons to "Start Attendance Session" and "End Attendance Session".
*   **Student Dashboard:**
    *   List of enrolled classes with "View Attendance" option.
    *   Class detail view showing individual attendance status.
    *   "Mark Me Present" button, enabled only during an active attendance session for that class.

## Project Structure

```
├───index.js                 // Main application entry point (Express server, DB, routes)
├───package.json             // Project dependencies and scripts
├───.env                     // Environment variables (MONGO_URI, JWT_SECRET)
├───models
│   ├───attendance.model.js  // Mongoose model for Attendance
│   ├───class.model.js       // Mongoose model for Class
│   └───user.model.js        // Mongoose model for User
├───middleware
│   └───auth.js              // Authentication and authorization middleware
├───routes
│   ├───auth.routes.js       // Routes for user authentication (signup, login, /me)
│   └───class.routes.js      // Routes for class and student management (including attendance)
├───zod
│   └───validator.js         // Zod schemas for request validation
└───public                   // Frontend static files
    ├───index.html           // Main HTML page for the frontend
    └───script.js            // Frontend JavaScript logic
└───test.js                  // Puppeteer script for end-to-end testing
```

## How to Run

### 1. Backend Setup

1.  **Ensure you have Node.js and MongoDB installed.**
2.  **Clone the repository (if applicable) or set up the provided files.**
3.  **Navigate to the project's root directory in your terminal.**
4.  **Install backend dependencies:**
    ```bash
    npm install
    ```
5.  **Create a `.env` file** in the root directory and add your MongoDB connection string and a JWT Secret key:
    ```env
    MONGO_URI=mongodb://localhost:27017/attendanceApp # Replace with your MongoDB connection string
    JWT_SECRET=your_strong_and_secret_jwt_key # Use a strong, unique key
    PORT=3000
    ```
6.  **Start the backend server:**
    ```bash
    npm run dev
    # or
    node index.js
    ```
    You should see console messages indicating the server has started and the database is connected.

### 2. Frontend Access

*   Once the backend server is running, open your web browser and navigate to:
    ```
    http://localhost:3000
    ```
*   The `public/index.html` will be served, and the embedded `script.js` will handle all frontend interactions.

### 3. Running the End-to-End Tests (Puppeteer)

1.  **Ensure your backend server is running.**
2.  **Install Puppeteer** (if you haven't already):
    ```bash
    npm install puppeteer
    ```
3.  **Run the test script** from the project's root directory:
    ```bash
    node test.js
    ```
    This will launch a browser (visible by default) and simulate user actions to perform signup, login, class creation, student enrollment, and attendance marking, asserting that functionalities work as expected.

## Reflection on the Development Process

This project was a significant learning curve, pushing me to deepen my understanding of full-stack development. Integrating the frontend with the backend, especially after deciding to pivot from WebSockets to a more conventional REST-based approach for attendance, presented its own set of challenges.

I genuinely struggled during the testing phase, encountering several recurring issues that taught me valuable lessons:

1.  **Typos – The Most Insidious Bugs:** A surprising amount of my debugging time was spent hunting down simple typographical errors. A misplaced character in a variable name, a misspelled route path, or a tiny mismatch in a JSON key between the frontend and backend could cause entire features to fail silently or with cryptic `undefined` errors. This experience drilled into me the importance of meticulous attention to detail and consistent naming conventions.

2.  **HTTP Status Code Consistency:** Initially, my API sometimes returned generic `200 OK` responses even when an operation failed, or `500 Internal Server Error` for what were clearly client-side issues (e.g., invalid input). The Puppeteer tests, in particular, helped highlight these inconsistencies. Learning to correctly use `400 Bad Request` for validation errors, `401 Unauthorized` for missing tokens, `403 Forbidden` for permission issues, and `404 Not Found` for non-existent resources made the API much more predictable and easier for the frontend to handle.

3.  **Handling Null and Undefined Values Gracefully:** A common source of runtime errors was not adequately checking for `null` or `undefined` values, especially when dealing with database query results. For instance, attempting to access `.toString()` on a `null` object returned by `User.findById()` if a user didn't exist. Implementing robust checks (`if (!user) { ... }`) and providing meaningful error messages drastically improved the stability and user experience, preventing unexpected crashes.

While these struggles were frustrating at times, they were incredibly valuable. I learned a lot about defensive programming, the importance of clear API contracts, and the nuances of client-server communication.

### The Role of AI in Debugging

I found myself frequently turning to AI for assistance, particularly when I was stuck on a bug that my own eyes couldn't spot. Providing snippets of my code along with specific error messages or descriptions of unexpected behavior allowed the AI to:

*   **Quickly identify subtle typos or syntactic errors** that I had overlooked after hours of looking at the same code.
*   **Suggest missing error handling or null checks** that I hadn't considered.
*   **Explain discrepancies** in expected data formats or API responses between my frontend and backend logic.
*   **Propose alternative implementations** or best practices that simplified complex parts of the code.

AI became a powerful debugging assistant, offering a fresh perspective and significantly accelerating my ability to identify and resolve issues. This project truly reinforced the continuous learning inherent in software development and the benefits of leveraging available tools to enhance the process.
