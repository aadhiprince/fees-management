document.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get("id");
    const form = document.getElementById("student-form");
    const deleteBtn = document.getElementById("delete-btn");
    const studentIdField = document.getElementById("student_id");
    const formTitle = document.getElementById("form-title");

    console.log("Student ID from URL:", studentId); // Debugging step

    // Initialize form based on edit or add mode
    if (studentId) {
        formTitle.innerText = "Edit Student";
        deleteBtn.style.display = "inline-block";
        studentIdField.disabled = true; // Keep student ID disabled while editing

        try {
            const response = await fetch(`https://fees-management-to3d.onrender.com/get-student/${studentId}`);
            const student = await response.json();
            console.log("Fetched Student Data:", student); // Debugging step

            Object.keys(student).forEach((key) => {
                if (document.getElementById(key)) {
                    document.getElementById(key).value = student[key];
                }
            });
        } catch (error) {
            console.error("Error fetching student data:", error);
            showError("Error fetching student data. Please try again.");
        }
    } else {
        formTitle.innerText = "Add Student";
        studentIdField.disabled = false; // Enable student ID for new students
    }

    // Form submission handler
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Convert year and total to numbers (if applicable)
        data.year = parseInt(data.year, 10);
        data.total = parseFloat(data.total);

        console.log("Form Data Before Sending:", data); // Debugging step

        // Basic validation: Ensure required fields are filled
        if (!data.student_id || !data.name || !data.department || !data.year || !data.semester || !data.batch || !data.total) {
            showError("All fields except Paid are required.");
            return;
        }

        const method = studentId ? "PUT" : "POST";
        const endpoint = studentId
            ? `https://fees-management-to3d.onrender.com/${studentId}`
            : `https://fees-management-to3d.onrender.com/add-student`;

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            console.log("Server Response:", result); // Debugging step

            if (!response.ok) {
                showError(result.message);
                return;
            }

            alert(result.message);
            window.location.href = "dashboard.html";
        } catch (error) {
            console.error("Error saving student data:", error);
            showError("An error occurred while saving data. Please try again.");
        }
    });

    // Delete student handler
    deleteBtn.addEventListener("click", async function () {
        if (!confirm("Are you sure you want to delete this student?")) return;

        try {
            const response = await fetch(`https://fees-management-to3d.onrender.com/delete-student/${studentId}`, {
                method: "DELETE",
            });

            const result = await response.json();
            console.log("Delete Response:", result); // Debugging step

            if (!response.ok) {
                showError(result.message);
                return;
            }

            alert("Student deleted successfully.");
            window.location.href = "dashboard.html";
        } catch (error) {
            console.error("Error deleting student:", error);
            showError("Error deleting student. Please try again.");
        }
    });

    // Function to display alert messages
    function showError(message) {
        alert(message);
    }
});
