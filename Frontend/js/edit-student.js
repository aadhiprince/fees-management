document.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get("id");
    const form = document.getElementById("student-form");
    const deleteBtn = document.getElementById("delete-btn");
    const studentIdField = document.getElementById("student_id");

    if (studentId) {
        // Editing existing student
        document.getElementById("form-title").innerText = "Edit Student";
        deleteBtn.style.display = "inline-block";
        studentIdField.disabled = true; // Keep it disabled while editing

        const response = await fetch(`https://fees-management-to3d.onrender.com/get-student/${studentId}`);
        const student = await response.json();

        Object.keys(student).forEach((key) => {
            if (document.getElementById(key)) {
                document.getElementById(key).value = student[key];
            }
        });
    } else {
        // Adding a new student
        document.getElementById("form-title").innerText = "Add Student";
        studentIdField.disabled = false; // Enable it for new students
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const method = studentId ? "PUT" : "POST";
        const endpoint = studentId
            ? `https://fees-management-to3d.onrender.com/update-student/${studentId}`
            : "https://fees-management-to3d.onrender.com/add-student";

        await fetch(endpoint, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        window.location.href = "dashboard.html";
    });

    deleteBtn.addEventListener("click", async function () {
        if (confirm("Are you sure you want to delete this student?")) {
            await fetch(`https://fees-management-to3d.onrender.com/delete-student/${studentId}`, {
                method: "DELETE",
            });
            window.location.href = "dashboard.html";
        }
    });
});
