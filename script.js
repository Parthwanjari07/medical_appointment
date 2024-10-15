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

    const name = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const date = document.getElementById("date").value;
    const notes = document.getElementById("notes").value;

    const apiKey = 'MPPTQF6SH4UPLRI6'; // Replace with your Write API Key

    // Construct the ThingSpeak URL
    const url = `https://api.thingspeak.com/update?api_key=${apiKey}&field1=${encodeURIComponent(name)}&field2=${encodeURIComponent(email)}&field3=${encodeURIComponent(phone)}&field4=${encodeURIComponent(date)}&field5=${encodeURIComponent(notes)}`;

    // Send data to ThingSpeak
    fetch(url, { method: 'POST' })
      .then(response => {
        if (response.ok) {
          displayAlert('Appointment data sent to ThingSpeak successfully!', 'success');
        } else {
          displayAlert('Failed to send data to ThingSpeak.', 'error');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        displayAlert('An error occurred while sending data.', 'error');
      });

    document.getElementById("appointmentForm").reset();
  });

// ... existing code ...
