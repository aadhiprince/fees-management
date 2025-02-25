document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error-msg");

    if (!username || !password) {
        errorMsg.textContent = "Username and Password are required!";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("username", data.username);
            localStorage.setItem("department", data.department);

            // Redirect to the dashboard page (same page for all roles)
            window.location.href = "dashboard.html";
        } else {
            errorMsg.textContent = data.message;
        }
    } catch (error) {
        errorMsg.textContent = "Server error. Try again later!";
    }
});
