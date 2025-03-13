document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error-msg");
    const btn = document.getElementById("loginBtn");
    const btnText = document.getElementById("btnText");
    const spinner = document.querySelector(".spinner");

    // Clear previous error messages
    errorMsg.textContent = "";
    errorMsg.style.display = "none";

    if (!username || !password) {
        errorMsg.textContent = "Username and Password are required!";
        errorMsg.style.display = "block";
        return;
    }

    // Disable button & show loading spinner
    btn.disabled = true;
    btnText.textContent = "Logging in...";
    spinner.style.display = "inline-block";

    try {
        const response = await fetch("https://fees-management-to3d.onrender.com/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("role", data.role);
            localStorage.setItem("username", data.username);
            localStorage.setItem("department", data.department);

            // Redirect to the dashboard
            window.location.href = "dashboard.html";
        } else {
            errorMsg.textContent = data.message || "Invalid credentials!";
            errorMsg.style.display = "block";
        }
    } catch (error) {
        errorMsg.textContent = "Server error. Please try again later!";
        errorMsg.style.display = "block";
    } finally {
        // Re-enable button & hide spinner after response
        btn.disabled = false;
        btnText.textContent = "Login";
        spinner.style.display = "none";
    }
});
