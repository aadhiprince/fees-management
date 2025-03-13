// Function to get the current user role from localStorage
function getUserRole() {
    return localStorage.getItem("role"); // Possible values: "admin", "principal", "faculty"
}

// Function to get faculty's department from localStorage
function getUserDepartment() {
    return localStorage.getItem("department");
}

// Function to configure the department dropdown based on role
function setupDepartmentDropdown() {
    const role = getUserRole();
    const departmentSelect = document.getElementById("departmentSelect");

    if (role === "faculty") {
        const facultyDepartment = getUserDepartment();
        if (facultyDepartment) {
            departmentSelect.innerHTML = `<option value="${facultyDepartment}">${facultyDepartment.toUpperCase()}</option>`; 
            departmentSelect.disabled = true;
        } else {
            console.error("Faculty department not found in localStorage.");
            departmentSelect.innerHTML = `<option value="">Unknown Department</option>`;
            departmentSelect.disabled = true;
        }
    }
}

// Function to hide the "Edit" column if the user is not an admin
function setupTableHeader() {
    const role = getUserRole();
    const editColumn = document.getElementById("editColumn");

    if (role !== "admin") {
        editColumn.style.display = "none"; // Hide the "Edit" column header
    }
}

// Function to fetch filtered student data from the backend
async function fetchFilteredData() {
    const role = getUserRole();
    const departmentSelect = document.getElementById("departmentSelect");
    let department = role === "faculty" ? getUserDepartment() : departmentSelect.value;
    
    if (!department || department === "null") {
        console.error("Invalid department value:", department);
        return;
    }

    const year = document.getElementById("yearSelect").value;
    const semester = document.getElementById("semesterSelect").value;
    const batch = document.getElementById("batchSelect").value;

    try {
        const response = await fetch(`https://fees-management-to3d.onrender.com/get-students?department=${department}&year=${year}&semester=${semester}&batch=${batch}`);
        const students = await response.json();
        insertDataIntoTable(students);
    } catch (error) {
        console.error("Error fetching student data:", error);
    }
}

// Function to insert student data into the table
function insertDataIntoTable(data) {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = ""; // Clear previous data
    const role = getUserRole();

    data.forEach((student, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student.name || "N/A"}</td>
            <td>${student.student_id || "N/A"}</td>
            <td>${student.department || "N/A"}</td>
            <td>${student.year || "N/A"}</td>
            <td>${student.semester || "N/A"}</td>
            <td>${student.batch || "N/A"}</td>
            <td>${student.total || "N/A"}</td>
            <td>${student.paid || "N/A"}</td>
            <td>${student.balance || "N/A"}</td>
            <td>${student.status || "N/A"}</td>
            ${role === "admin" ? `<td><button onclick="editStudent('${student.student_id}')">Edit</button></td>` : ""}
        `;
        tbody.appendChild(row);
    });
}

// Function to redirect admin to the edit page
function editStudent(studentId) {
    if (getUserRole() !== "admin") return;
    window.location.href = `edit-student.html?id=${studentId}`;
}

// Function to print the table
function printTable() {
    const originalContents = document.body.innerHTML;
    const printContents = document.querySelector(".content").innerHTML;
    
    document.body.innerHTML = `<h1>Student Data</h1>${printContents}`;
    window.print();
    document.body.innerHTML = originalContents;
    location.reload(); // Reload to restore the original page
}

// Function to download table data as an Excel file
function downloadExcel() {
    let table = document.querySelector("table");
    let rows = Array.from(table.querySelectorAll("tr")).map(row => 
        Array.from(row.querySelectorAll("th, td")).map(cell => cell.innerText).join("\t")
    ).join("\n");

    let blob = new Blob([rows], { type: "text/csv" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "student_data.xls";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Run functions on page load
document.addEventListener("DOMContentLoaded", () => {
    setupDepartmentDropdown();
    setupTableHeader();
    setupAddStudentButton();

    // Attach event listeners to buttons
    document.getElementById("printButton").addEventListener("click", printTable);
    document.getElementById("downloadExcelButton").addEventListener("click", downloadExcel);
});
function setupAddStudentButton() {
    const role = getUserRole();
    const addStudentButton = document.getElementById("addStudentButton");

    if (role === "admin") {
        addStudentButton.style.display = "block"; // Show the button
    } else {
        addStudentButton.style.display = "none"; // Hide the button
    }
}
