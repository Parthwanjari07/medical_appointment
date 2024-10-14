// Simulate users database
let users = [];

// Load users from localStorage on page load
window.onload = function () {
  const storedUsers = localStorage.getItem("users");
  if (storedUsers) {
    users = JSON.parse(storedUsers);
  }
};

// Function to save users to localStorage
function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

// Handle signup
document
  .getElementById("signupForm")
  ?.addEventListener("submit", function (event) {
    event.preventDefault();

    const signupName = document.getElementById("signupFullName").value;
    const signupEmail = document.getElementById("signupEmail").value;
    const signupPassword = document.getElementById("signupPassword").value;

    const newUser = {
      fullName: signupName,
      email: signupEmail,
      password: signupPassword,
    };

    const existingUser = users.find((user) => user.email === signupEmail);
    if (existingUser) {
      displayAlert("User already exists. Please log in.", "error");
      return;
    }

    users.push(newUser);
    saveUsers();
    displayAlert("Signup successful! Redirecting to login...", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  });

// Handle login
document
  .getElementById("loginForm")
  ?.addEventListener("submit", function (event) {
    event.preventDefault();

    const loginEmail = document.getElementById("email").value;
    const loginPassword = document.getElementById("password").value;

    const user = users.find(
      (user) => user.email === loginEmail && user.password === loginPassword
    );
    if (user) {
      localStorage.setItem("fullName", user.fullName);
      localStorage.setItem("email", user.email);
      displayAlert("Login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "main.html";
      }, 1500);
    } else {
      displayAlert("Invalid email or password. Please try again.", "error");
    }
  });

// Show alerts
function displayAlert(message, type) {
  const alertBox = document.createElement("div");
  alertBox.classList.add("alert", type);
  alertBox.textContent = message;

  document.body.appendChild(alertBox);
  setTimeout(() => {
    alertBox.remove();
  }, 3000);
}

// Show selected treatment on appointment page
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const treatment = urlParams.get("treatment");
  const selectedTreatmentElement = document.getElementById("selectedTreatment");
  if (treatment && selectedTreatmentElement) {
    selectedTreatmentElement.textContent = treatment;
  }

  // Retrieve full name and email from localStorage
  const fullName = localStorage.getItem("fullName");
  const email = localStorage.getItem("email");

  // Populate fields on the main page
  const profileFullNameElement = document.getElementById("profileFullName");
  const profileEmailElement = document.getElementById("profileEmail");

  if (email && profileEmailElement) {
    profileEmailElement.textContent = email;
  }
  if (fullName && profileFullNameElement) {
    profileFullNameElement.textContent = fullName;
  }

  // Pre-fill appointment form fields if on the appointment page
  const appointmentNameElement = document.getElementById("appointmentName");
  const appointmentEmailElement = document.getElementById("appointmentEmail");

  if (appointmentNameElement && appointmentEmailElement) {
    appointmentNameElement.value = fullName || ""; // Pre-fill name
    appointmentEmailElement.value = email || ""; // Pre-fill email
  }
});

// Appointment form submission
document
  .getElementById("appointmentForm")
  ?.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = localStorage.getItem("fullName");
    const email = localStorage.getItem("email");
    const phone = document.getElementById("phone").value;
    const date = document.getElementById("date").value;
    const treatment = document.getElementById("selectedTreatment").textContent;

    const confirmationMessage = `Appointment confirmed for ${name}! Treatment: ${treatment} Date: ${date} Email: ${email} Phone: ${phone}`;
    const confirmationMessageElement = document.getElementById(
      "confirmationMessage"
    );
    const confirmationElement = document.getElementById("confirmation");

    if (confirmationMessageElement && confirmationElement) {
      confirmationMessageElement.textContent = confirmationMessage;
      confirmationElement.classList.remove("d-none");
    }

    document.getElementById("appointmentForm").reset();
  });
