
let userId = null;
const registrationSection = document.getElementById("registration-section");
const loginSection = document.getElementById("login-section");
const balanceSection = document.getElementById("balance-section");
const applyLeaveSection = document.getElementById("apply-leave-section");

const responseMessage = document.getElementById("response-message");

// Display message safely
function showMessage(message, elementId = "response-message") {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = message;
    }
}

// Handle API responses safely
async function readResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
}

// REGISTER
async function registerUser(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const rollNumber = document.getElementById("roll-number").value.trim();
    const casualLeave = Number(document.getElementById("casual-leave").value || 10);
    const medicalLeave = Number(document.getElementById("medical-leave").value || 10);

    if (!username || !email || !rollNumber) {
        showMessage("Please fill all required fields.", "registration-response");
        return;
    }

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                email,
                rollNumber,
                casualLeave,
                medicalLeave
            })
        });

        const data = await readResponse(response);

        showMessage(data.message, "registration-response");

        document.getElementById("registration-form").reset();

        registrationSection.style.display = "none";
        loginSection.style.display = "block";
    } catch (error) {
        showMessage(error.message || "Registration failed.", "registration-response");
    }
}

// LOGIN
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (!email) {
        showMessage("Please enter your registered email.");
        return;
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await readResponse(response);

        userId = data.userId;

        document.getElementById("username-display").textContent = data.username;
        document.getElementById("roll-number-display").textContent = data.rollNumber;
        document.getElementById("casual-leave-display").textContent = data.casualLeave;
        document.getElementById("medical-leave-display").textContent = data.medicalLeave;

        registrationSection.style.display = "none";
        loginSection.style.display = "none";
        balanceSection.style.display = "block";
        applyLeaveSection.style.display = "block";

        showMessage("Login successful!");
        document.getElementById("login-form").reset();
    } catch (error) {
        showMessage(error.message || "Login failed. Check the server.");
    }
}

// REFRESH LEAVE BALANCE
async function refreshLeaveBalance() {
    if (!userId) {
        showMessage("Please log in first.");
        return;
    }

    try {
        const response = await fetch(`/api/balance/${userId}`);
        const data = await readResponse(response);

        document.getElementById("casual-leave-display").textContent = data.casualLeave;
        document.getElementById("medical-leave-display").textContent = data.medicalLeave;

        showMessage("Leave balance updated.");
    } catch (error) {
        showMessage(error.message || "Could not refresh leave balance.");
    }
}

// APPLY FOR LEAVE
async function applyLeave(event) {
    event.preventDefault();

    if (!userId) {
        showMessage("Please log in first.");
        return;
    }

    const type = document.getElementById("leave-type").value;
    const days = Number(document.getElementById("leave-days").value);

    if (!["casual", "medical"].includes(type)) {
        showMessage("Please select a valid leave type.");
        return;
    }

    if (!Number.isInteger(days) || days < 1) {
        showMessage("Enter a valid number of days (at least 1).");
        return;
    }

    try {
        const response = await fetch(`/api/apply/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, days })
        });

        const data = await readResponse(response);

        document.getElementById("casual-leave-display").textContent = data.casualLeave;
        document.getElementById("medical-leave-display").textContent = data.medicalLeave;

        showMessage(data.message || "Leave applied successfully.");

        document.getElementById("leave-form").reset();
    } catch (error) {
        showMessage(error.message || "Unable to apply for leave.");
    }
}

// LOGOUT
function logoutUser() {
    userId = null;

    balanceSection.style.display = "none";
    applyLeaveSection.style.display = "none";
    loginSection.style.display = "block";

    document.getElementById("login-form").reset();

    showMessage("");
}

// NAVIGATION
function showLogin() {
    registrationSection.style.display = "none";
    loginSection.style.display = "block";
    showMessage("");
}

function showRegistration() {
    loginSection.style.display = "none";
    registrationSection.style.display = "block";
    showMessage("");
}

// CONNECT FORM EVENTS
document.getElementById("registration-form")
    .addEventListener("submit", registerUser);

document.getElementById("login-form")
    .addEventListener("submit", loginUser);

document.getElementById("leave-form")
    .addEventListener("submit", applyLeave);

document.getElementById("refresh-balance")
    .addEventListener("click", refreshLeaveBalance);

document.getElementById("logout-button")
    .addEventListener("click", logoutUser);

document.getElementById("show-login")
    .addEventListener("click", showLogin);

document.getElementById("show-registration")
    .addEventListener("click", showRegistration);