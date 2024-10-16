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
document.getElementById("signupForm")?.addEventListener("submit", function () {
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
  const appointmentNameElement = document.getElementById("fullName");
  const appointmentEmailElement = document.getElementById("email");

  if (appointmentNameElement && appointmentEmailElement) {
    appointmentNameElement.value = fullName || ""; // Pre-fill name
    appointmentEmailElement.value = email || ""; // Pre-fill email
  }

  // Retrieve password from localStorage
  const password = localStorage.getItem("password");

  // Populate password field on the profile page
  const profilePasswordElement = document.getElementById("profilePassword");
  if (password && profilePasswordElement) {
    profilePasswordElement.value = password;
  }
});

// Appointment form submission
document
  .getElementById("appointmentForm")
  ?.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form data
    const name = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const date = document.getElementById("date").value;
    const notes = document.getElementById("notes").value;
    const timeSlot = document.getElementById("timeSlot").value; // Get the selected time slot

    // Define ThingSpeak API key
    const apiKey = "MPPTQF6SH4UPLRI6"; // Replace with your Write API Key

    // Construct the ThingSpeak URL
    const thingSpeakUrl = `https://api.thingspeak.com/update?api_key=${apiKey}&field1=${encodeURIComponent(
      name
    )}&field2=${encodeURIComponent(email)}&field3=${encodeURIComponent(
      phone
    )}&field4=${encodeURIComponent(date)}&field5=${encodeURIComponent(notes)}`;

    // Send data to ThingSpeak
    fetch(thingSpeakUrl, { method: "POST" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send data to ThingSpeak");
        }
        return response.text();
      })
      .then(() => {
        // Display alert for successful ThingSpeak upload
        displayAlert(
          "Appointment data sent to ThingSpeak successfully!",
          "success"
        );

        // After ThingSpeak upload is successful, store data in Google Spreadsheet
        return saveToGoogleSheet(name, email, phone, date, notes);
      })
      .then(() => {
        // Update the booked time slot in local storage
        updateBookedSlot(date, timeSlot);

        // After saving to Google Spreadsheet, proceed to payment.html
        window.location.href = "payment.html";
      })
      .catch((error) => {
        console.error("Error:", error);
        displayAlert(
          "An error occurred while processing the appointment.",
          "error"
        );
      });

    // Reset form after submission
    document.getElementById("appointmentForm").reset();
  });

// Function to send data to Google Apps Script
function saveToGoogleSheet(name, email, phone, date, notes) {
  return new Promise((resolve, reject) => {
    // Google Apps Script Web App URL
    const googleScriptUrl =
      "https://script.google.com/macros/s/AKfycbyzou0lG2NdzJhTT2P1H4VJDqdMkM_64QjkiqGmDnrsCAxdCQ0jqPzflV7ftJMx4zYjwA/exec";

    // Construct the form data
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("date", date);
    formData.append("notes", notes);

    // Send data to Google Apps Script
    fetch(googleScriptUrl, { method: "POST", body: formData })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to store data in Google Spreadsheet");
        }
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// Function to update booked time slots in local storage
function updateBookedSlot(date, timeSlot) {
  const bookedSlots = JSON.parse(localStorage.getItem("bookedSlots")) || {};

  // Check if the date exists in localStorage, if not, initialize an empty array
  if (!bookedSlots[date]) {
    bookedSlots[date] = [];
  }

  // Add the selected time slot to the booked slots for the chosen date
  bookedSlots[date].push(timeSlot);

  // Save the updated booked slots back to local storage
  localStorage.setItem("bookedSlots", JSON.stringify(bookedSlots));
}
