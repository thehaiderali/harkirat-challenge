const BASE_URL = "http://localhost:3000"; // Your backend URL
let currentUser = null;
let currentRole = null;
let activeClassId = null; // Used for teacher/student class details view
let currentActiveSession = null; // To track active session state on frontend

// Helper function to get JWT token from local storage
function getToken() {
  return localStorage.getItem("token");
}

// Helper function to set JWT token in local storage
function setToken(token) {
  localStorage.setItem("token", token);
}

// Helper function to remove JWT token from local storage
function removeToken() {
  localStorage.removeItem("token");
}

// Helper for making authenticated API requests
async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(url, { ...options, headers });
  return response;
}

// UI Elements
const signupContainer = document.getElementById("signup-container");
const loginContainer = document.getElementById("login-container");
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const signupMessage = document.getElementById("signup-message");
const loginMessage = document.getElementById("login-message");
const authSection = document.getElementById("auth-section");

const navSignup = document.getElementById("nav-signup");
const navLogin = document.getElementById("nav-login");
const navUsername = document.getElementById("nav-username");
const navLogout = document.getElementById("nav-logout");
const showLoginFormBtn = document.getElementById("show-login-form");
const showSignupFormBtn = document.getElementById("show-signup-form");

const teacherDashboard = document.getElementById("teacher-dashboard");
const createClassForm = document.getElementById("create-class-form");
const createClassMessage = document.getElementById("create-class-message");
const teacherClassesContainer = document.getElementById("teacher-classes");

const teacherClassDetails = document.getElementById("teacher-class-details");
const backToTeacherDashboardBtn = document.getElementById(
  "back-to-teacher-dashboard",
);
const teacherClassName = document.getElementById("teacher-class-name");
const addStudentForm = document.getElementById("add-student-form");
const selectStudentDropdown = document.getElementById("select-student");
const addStudentMessage = document.getElementById("add-student-message");
const enrolledStudentsContainer =
  document.getElementById("enrolled-students");
const startAttendanceBtn = document.getElementById("start-attendance-btn");
const endAttendanceBtn = document.getElementById("end-attendance-btn"); // New button
const attendanceSessionInfo = document.getElementById(
  "attendance-session-info",
);
const activeSessionStatus = document.getElementById("active-session-status");
const activeSessionTime = document.getElementById("active-session-time");
const attendanceSessionMessage = document.getElementById(
  "attendance-session-message",
);

const studentDashboard = document.getElementById("student-dashboard");
const studentClassesContainer = document.getElementById("student-classes");

const studentClassDetails = document.getElementById("student-class-details");
const backToStudentDashboardBtn = document.getElementById(
  "back-to-student-dashboard",
);
const studentClassName = document.getElementById("student-class-name");
const myAttendanceStatus = document.getElementById("my-attendance-status");
const markAttendanceInfo = document.getElementById("mark-attendance-info");
const markPresentBtn = document.getElementById("mark-present-btn");
const markAttendanceMessage = document.getElementById(
  "mark-attendance-message",
);

// --- UI Toggle Functions ---
function showElement(element) {
  element.classList.remove("hidden");
}

function hideElement(element) {
  element.classList.add("hidden");
}

function resetMessages() {
  signupMessage.textContent = "";
  loginMessage.textContent = "";
  createClassMessage.textContent = "";
  addStudentMessage.textContent = "";
  attendanceSessionMessage.textContent = "";
  markAttendanceMessage.textContent = "";
}

function showAuthForms() {
  resetMessages();
  showElement(authSection);
  showElement(signupContainer);
  hideElement(loginContainer);
  hideElement(teacherDashboard);
  hideElement(studentDashboard);
  hideElement(teacherClassDetails);
  hideElement(studentClassDetails);

  // Nav
  showElement(navSignup);
  showElement(navLogin);
  hideElement(navUsername);
  hideElement(navLogout);
}

function showTeacherDashboard() {
  resetMessages();
  hideElement(authSection);
  hideElement(studentDashboard);
  hideElement(teacherClassDetails);
  hideElement(studentClassDetails);
  showElement(teacherDashboard);
  loadTeacherClasses();

  // Nav
  hideElement(navSignup);
  hideElement(navLogin);
  showElement(navUsername);
  showElement(navLogout);
  navUsername.textContent = `Welcome, ${currentUser.name} (Teacher)`;
}

function showStudentDashboard() {
  resetMessages();
  hideElement(authSection);
  hideElement(teacherDashboard);
  hideElement(teacherClassDetails);
  hideElement(studentClassDetails);
  showElement(studentDashboard);
  loadStudentClasses();

  // Nav
  hideElement(navSignup);
  hideElement(navLogin);
  showElement(navUsername);
  showElement(navLogout);
  navUsername.textContent = `Welcome, ${currentUser.name} (Student)`;
}

function showTeacherClassDetails(classId) {
  resetMessages();
  hideElement(teacherDashboard);
  hideElement(studentDashboard);
  hideElement(studentClassDetails);
  showElement(teacherClassDetails);
  activeClassId = classId;
  loadClassDetails(classId);
  loadAllStudents(); // For adding students to the class
  checkActiveAttendanceSession(classId); // Check attendance session status
}

function showStudentClassDetails(classId) {
  resetMessages();
  hideElement(studentDashboard);
  hideElement(teacherDashboard);
  hideElement(teacherClassDetails);
  showElement(studentClassDetails);
  activeClassId = classId;
  loadStudentClassDetails(classId);
  loadMyAttendance(classId);
  checkStudentAttendanceEligibility(classId); // Check if student can mark attendance
}

// --- Auth Related Functions ---
async function fetchMe() {
  const response = await authFetch(`${BASE_URL}/auth/me`);
  if (response.ok) {
    const data = await response.json();
    currentUser = data.data;
    currentRole = currentUser.role;
    if (currentRole === "teacher") {
      showTeacherDashboard();
    } else {
      showStudentDashboard();
    }
  } else {
    // Token might be expired or invalid
    removeToken();
    currentUser = null;
    currentRole = null;
    showAuthForms();
  }
}

async function handleSignup(event) {
  event.preventDefault();
  resetMessages();
  const formData = new FormData(signupForm);
  const data = Object.fromEntries(formData.entries());

  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (response.ok) {
    signupMessage.textContent = "Signup successful! Please log in.";
    signupMessage.classList.add("text-green-500");
    signupForm.reset();
    showElement(loginContainer);
    hideElement(signupContainer);
  } else {
    signupMessage.textContent = result.error || "Signup failed.";
    signupMessage.classList.add("text-red-500");
  }
}

async function handleLogin(event) {
  event.preventDefault();
  resetMessages();
  const formData = new FormData(loginForm);
  const data = Object.fromEntries(formData.entries());

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (response.ok) {
    setToken(result.data.token);
    loginMessage.textContent = "Login successful!";
    loginMessage.classList.add("text-green-500");
    loginForm.reset();
    await fetchMe(); // Fetch user data and navigate to dashboard
  } else {
    loginMessage.textContent = result.error || "Login failed.";
    loginMessage.classList.add("text-red-500");
  }
}

function handleLogout() {
  removeToken();
  currentUser = null;
  currentRole = null;
  currentActiveSession = null;
  showAuthForms();
}

// --- Teacher Specific Functions ---
async function loadTeacherClasses() {
  teacherClassesContainer.innerHTML =
    '<p class="text-center text-gray-500">Loading classes...</p>';
  // Fetch all classes and filter by teacherId, as `auth/me` does not return `createdClasses`
  const response = await authFetch(`${BASE_URL}/class/all-classes-by-teacher`); // A new backend endpoint is needed here
  if (response.ok) {
    const result = await response.json();
    const teachersClasses = result.data; // Assuming this endpoint returns classes created by the current teacher

    if (teachersClasses.length === 0) {
      teacherClassesContainer.innerHTML =
        '<p class="text-center text-gray-500">No classes created yet.</p>';
      return;
    }

    teacherClassesContainer.innerHTML = "";
    teachersClasses.forEach((cls) => {
      const classCard = document.createElement("div");
      classCard.className =
        "bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200 flex justify-between items-center";
      classCard.innerHTML = `
            <div>
                <p class="font-semibold text-lg">${cls.className}</p>
                <p class="text-sm text-gray-600">Students: ${cls.studentIds.length}</p>
            </div>
            <button class="view-class-btn bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600" data-class-id="${cls._id}">View Details</button>
        `;
      teacherClassesContainer.appendChild(classCard);
    });

    teacherClassesContainer
      .querySelectorAll(".view-class-btn")
      .forEach((btn) => {
        btn.addEventListener("click", () =>
          showTeacherClassDetails(btn.dataset.classId),
        );
      });
  } else {
    teacherClassesContainer.innerHTML =
      '<p class="text-center text-red-500">Failed to load classes.</p>';
  }
}

async function handleCreateClass(event) {
  event.preventDefault();
  resetMessages();
  const formData = new FormData(createClassForm);
  const data = Object.fromEntries(formData.entries());

  const response = await authFetch(`${BASE_URL}/class`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (response.ok) {
    createClassMessage.textContent = `Class "${result.data.className}" created successfully!`;
    createClassMessage.classList.add("text-green-500");
    createClassForm.reset();
    loadTeacherClasses();
  } else {
    createClassMessage.textContent = result.error || "Failed to create class.";
    createClassMessage.classList.add("text-red-500");
  }
}

async function loadClassDetails(classId) {
  teacherClassName.textContent = "Loading Class...";
  enrolledStudentsContainer.innerHTML =
    '<p class="text-center text-gray-500">Loading students...</p>';
  addStudentMessage.textContent = "";

  const response = await authFetch(`${BASE_URL}/class/${classId}`);
  if (response.ok) {
    const result = await response.json();
    const classData = result.data;
    teacherClassName.textContent = classData.className;

    if (classData.students && classData.students.length > 0) {
      enrolledStudentsContainer.innerHTML = "";
      classData.students.forEach((student) => {
        const studentItem = document.createElement("div");
        studentItem.className = "bg-gray-50 p-3 rounded-md shadow-sm";
        studentItem.textContent = `${student.name} (${student.email})`;
        enrolledStudentsContainer.appendChild(studentItem);
      });
    } else {
      enrolledStudentsContainer.innerHTML =
        '<p class="text-center text-gray-500">No students enrolled yet.</p>';
    }
  } else {
    teacherClassName.textContent = "Error loading class.";
    enrolledStudentsContainer.innerHTML = `<p class="text-center text-red-500">${result.error || "Failed to load class details."}</p>`;
  }
}

async function loadAllStudents() {
  selectStudentDropdown.innerHTML =
    '<option value="">Loading students...</option>';
  const response = await authFetch(`${BASE_URL}/students`);
  if (response.ok) {
    const result = await response.json();
    const students = result.data;
    selectStudentDropdown.innerHTML =
      '<option value="">Select a student</option>';
    if (students.length > 0) {
      students.forEach((student) => {
        const option = document.createElement("option");
        option.value = student._id;
        option.textContent = `${student.name} (${student.email})`;
        selectStudentDropdown.appendChild(option);
      });
    } else {
      selectStudentDropdown.innerHTML =
        '<option value="">No students available</option>';
    }
  } else {
    selectStudentDropdown.innerHTML =
      '<option value="">Error loading students</option>';
  }
}

async function handleAddStudent(event) {
  event.preventDefault();
  resetMessages();
  const studentId = selectStudentDropdown.value;
  if (!studentId) {
    addStudentMessage.textContent = "Please select a student.";
    addStudentMessage.classList.add("text-red-500");
    return;
  }

  const response = await authFetch(
    `${BASE_URL}/class/${activeClassId}/add-student`,
    {
      method: "POST",
      body: JSON.stringify({ studentId }),
    },
  );

  const result = await response.json();
  if (response.ok) {
    addStudentMessage.textContent = "Student added successfully!";
    addStudentMessage.classList.add("text-green-500");
    loadClassDetails(activeClassId); // Reload class details to show updated student list
  } else {
    addStudentMessage.textContent = result.error || "Failed to add student.";
    addStudentMessage.classList.add("text-red-500");
  }
}

async function checkActiveAttendanceSession(classId) {
  activeSessionStatus.textContent = "Checking active session...";
  activeSessionTime.textContent = "";
  hideElement(startAttendanceBtn);
  hideElement(endAttendanceBtn);
  attendanceSessionMessage.textContent = "";

  const response = await authFetch(
    `${BASE_URL}/attendance/check-active-session/${classId}`,
  ); // New endpoint
  if (response.ok) {
    const result = await response.json();
    currentActiveSession = result.data; // Store session details
    if (result.data && result.data.active) {
      activeSessionStatus.textContent = "Active attendance session in progress.";
      activeSessionTime.textContent = `Started at: ${new Date(result.data.startedAt).toLocaleTimeString()}`;
      hideElement(startAttendanceBtn);
      showElement(endAttendanceBtn);
    } else {
      activeSessionStatus.textContent = "No active attendance session.";
      showElement(startAttendanceBtn);
      hideElement(endAttendanceBtn);
    }
  } else {
    activeSessionStatus.textContent =
      result.error || "Failed to check active session.";
    activeSessionStatus.classList.add("text-red-500");
    showElement(startAttendanceBtn); // Allow teacher to try starting
  }
}

async function handleStartAttendanceSession() {
  resetMessages();
  const response = await authFetch(`${BASE_URL}/attendance/start`, {
    method: "POST",
    body: JSON.stringify({ classId: activeClassId }),
  });

  const result = await response.json();
  if (response.ok) {
    attendanceSessionMessage.textContent = `Attendance session started at ${new Date(result.data.startedAt).toLocaleTimeString()}`;
    attendanceSessionMessage.classList.add("text-green-500");
    checkActiveAttendanceSession(activeClassId); // Refresh status
  } else {
    attendanceSessionMessage.textContent =
      result.error || "Failed to start attendance session.";
    attendanceSessionMessage.classList.add("text-red-500");
  }
}

async function handleEndAttendanceSession() {
  resetMessages();
  const response = await authFetch(`${BASE_URL}/attendance/end`, {
    method: "POST",
    body: JSON.stringify({ classId: activeClassId }),
  });

  const result = await response.json();
  if (response.ok) {
    attendanceSessionMessage.textContent = `Attendance session ended.`;
    attendanceSessionMessage.classList.add("text-green-500");
    checkActiveAttendanceSession(activeClassId); // Refresh status
  } else {
    attendanceSessionMessage.textContent =
      result.error || "Failed to end attendance session.";
    attendanceSessionMessage.classList.add("text-red-500");
  }
}

// --- Student Specific Functions ---
async function loadStudentClasses() {
  studentClassesContainer.innerHTML =
    '<p class="text-center text-gray-500">Loading enrolled classes...</p>';
  // Need a new endpoint to get classes a student is enrolled in
  const response = await authFetch(`${BASE_URL}/class/my-enrolled-classes`); // New endpoint needed
  if (response.ok) {
    const result = await response.json();
    const enrolledClasses = result.data;

    if (enrolledClasses.length === 0) {
      studentClassesContainer.innerHTML =
        '<p class="text-center text-gray-500">You are not enrolled in any classes yet.</p>';
      return;
    }

    studentClassesContainer.innerHTML = "";
    enrolledClasses.forEach((cls) => {
      const classCard = document.createElement("div");
      classCard.className =
        "bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200 flex justify-between items-center";
      classCard.innerHTML = `
            <div>
                <p class="font-semibold text-lg">${cls.className}</p>
                <p class="text-sm text-gray-600">Teacher: ${cls.teacher.name}</p>
            </div>
            <button class="view-student-class-btn bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600" data-class-id="${cls._id}">View Attendance</button>
        `;
      studentClassesContainer.appendChild(classCard);
    });

    studentClassesContainer
      .querySelectorAll(".view-student-class-btn")
      .forEach((btn) => {
        btn.addEventListener("click", () =>
          showStudentClassDetails(btn.dataset.classId),
        );
      });
  } else {
    studentClassesContainer.innerHTML =
      '<p class="text-center text-red-500">Failed to load enrolled classes.</p>';
  }
}

async function loadStudentClassDetails(classId) {
  studentClassName.textContent = "Loading Class...";
  const response = await authFetch(`${BASE_URL}/class/${classId}`);
  if (response.ok) {
    const result = await response.json();
    const classData = result.data;
    studentClassName.textContent = classData.className;
  } else {
    studentClassName.textContent = "Error loading class.";
  }
}

async function loadMyAttendance(classId) {
  myAttendanceStatus.textContent = "Loading your attendance...";
  markAttendanceMessage.textContent = "";

  const response = await authFetch(
    `${BASE_URL}/class/${classId}/my-attendance`,
  );
  if (response.ok) {
    const result = await response.json();
    if (result.data.status) {
      myAttendanceStatus.textContent = `Your attendance: ${result.data.status.toUpperCase()}`;
      myAttendanceStatus.classList.add(
        result.data.status === "present" ? "text-green-600" : "text-red-600",
      );
    } else {
      myAttendanceStatus.textContent = "Your attendance: Not marked yet.";
      myAttendanceStatus.classList.remove("text-green-600", "text-red-600");
    }
  } else {
    myAttendanceStatus.textContent =
      result.error || "Failed to load your attendance.";
    myAttendanceStatus.classList.add("text-red-500");
  }
}

async function checkStudentAttendanceEligibility(classId) {
  markAttendanceInfo.textContent = "Checking attendance eligibility...";
  hideElement(markPresentBtn);

  const response = await authFetch(
    `${BASE_URL}/attendance/check-active-session/${classId}`,
  ); // Reuse teacher's endpoint
  if (response.ok) {
    const sessionResult = await response.json();
    if (sessionResult.data && sessionResult.data.active) {
      // Session is active, now check if student has already marked
      const myAttendanceResponse = await authFetch(
        `${BASE_URL}/class/${classId}/my-attendance`,
      );
      if (myAttendanceResponse.ok) {
        const myAttendanceResult = await myAttendanceResponse.json();
        if (myAttendanceResult.data.status === "present") {
          markAttendanceInfo.textContent =
            "You have already marked attendance for this session.";
        } else {
          markAttendanceInfo.textContent =
            "An attendance session is active! Click to mark present.";
          showElement(markPresentBtn);
        }
      } else {
        markAttendanceInfo.textContent = "Error checking your attendance status.";
      }
    } else {
      markAttendanceInfo.textContent =
        "No active attendance session for this class.";
    }
  } else {
    markAttendanceInfo.textContent =
      sessionResult.error || "Failed to check active attendance session.";
  }
}

async function handleMarkPresent() {
  resetMessages();
  const response = await authFetch(`${BASE_URL}/attendance/mark-present`, {
    method: "POST",
    body: JSON.stringify({ classId: activeClassId, status: "present" }),
  });

  const result = await response.json();
  if (response.ok) {
    markAttendanceMessage.textContent = "Attendance marked as PRESENT!";
    markAttendanceMessage.classList.add("text-green-500");
    hideElement(markPresentBtn); // Can't mark again
    loadMyAttendance(activeClassId); // Refresh attendance status
    checkStudentAttendanceEligibility(activeClassId); // Refresh eligibility
  } else {
    markAttendanceMessage.textContent =
      result.error || "Failed to mark attendance.";
    markAttendanceMessage.classList.add("text-red-500");
  }
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
  // Check if token exists on page load
  if (getToken()) {
    fetchMe();
  } else {
    showAuthForms();
  }
});

navSignup.addEventListener("click", () => {
  hideElement(loginContainer);
  showElement(signupContainer);
  resetMessages();
});
navLogin.addEventListener("click", () => {
  hideElement(signupContainer);
  showElement(loginContainer);
  resetMessages();
});
navLogout.addEventListener("click", handleLogout);
showLoginFormBtn.addEventListener("click", () => {
  hideElement(signupContainer);
  showElement(loginContainer);
  resetMessages();
});
showSignupFormBtn.addEventListener("click", () => {
  hideElement(loginContainer);
  showElement(signupContainer);
  resetMessages();
});

signupForm.addEventListener("submit", handleSignup);
loginForm.addEventListener("submit", handleLogin);
createClassForm.addEventListener("submit", handleCreateClass);
addStudentForm.addEventListener("submit", handleAddStudent);
startAttendanceBtn.addEventListener("click", handleStartAttendanceSession);
endAttendanceBtn.addEventListener("click", handleEndAttendanceSession); // New listener
markPresentBtn.addEventListener("click", handleMarkPresent);

backToTeacherDashboardBtn.addEventListener("click", showTeacherDashboard);
backToStudentDashboardBtn.addEventListener("click", showStudentDashboard);