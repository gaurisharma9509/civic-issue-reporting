// 🔐 Hardcoded admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "1234";

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        
        // ✅ Save login session
        localStorage.setItem("adminLoggedIn", "true");

        // Redirect to admin panel
        window.location.href = "admin.html";
    } else {
        document.getElementById("error").innerText = "Invalid credentials!";
    }
}