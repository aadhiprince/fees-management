const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv')

const app = express();
app.use(cors());

// Middleware to parse JSON data
app.use(bodyParser.json());

dotenv.config()

// Middleware to parse URL-encoded data
app.use((req, res, next) => {
  console.log(req.method);
  next();  // Allows requests to proceed
});

// Create a MySQL connection
const db = mysql.createConnection({
  host:process.env.MYSQL_HOST,
  user:process.env.MYSQL_USER,       
  password:process.env.MYSQL_PASSWORD, 
  database:process.env.MYSQL_DATABASE,
  port:process.env.PORT
});

// Test MySQL connection
db.connect((err) => {
  if (err) {
    console.log('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// ✅ Login Route (Already Exists)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, result) => {
    if (err) {
      console.log('Error in querying database:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (result.length > 0) {
      const user = result[0];

      if (user.role === 'admin') {
        res.json({ message: 'Admin login successful', role: 'admin', username: user.username });
      } else if (user.role === 'principal') {
        res.json({ message: 'Principal login successful', role: 'principal', username: user.username });
      } else if (user.role === 'faculty') {
        res.json({
          message: 'Faculty login successful',
          role: 'faculty',
          department: user.department,
          username: user.username
        });
      } else {
        res.status(401).json({ message: 'Unauthorized role' });
      }
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

// ✅ Get Students with Filters Route
app.get('/get-students', (req, res) => {
  const { department, year, semester, batch } = req.query;
  console.log(department, year, semester, batch);
  // Base Query
  let query = 'SELECT * FROM students WHERE 1=1';
  const params = [];

  // Apply Filters Dynamically
  if (department && department !== 'all') {
    query += ' AND department = ?';
    params.push(department);
  }
  if (year && year !== 'all') {
    query += ' AND year = ?';
    params.push(year);
  }
  if (semester && semester !== 'all') {
    query += ' AND semester = ?';
    params.push(semester);
  }
  if (batch && batch !== 'all') {
    query += ' AND batch = ?';
    params.push(batch);
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.log('Error fetching students:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(result);
    console.log(result) // Return filtered students
  });
});
// ✅ Get Student by ID (For Editing)
app.get('/get-student/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM students WHERE student_id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.log('Error fetching student:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(result[0]);
  });
});

// ✅ Add New Student
app.post('/add-student', (req, res) => {
  const { student_id, name, department, year, semester, batch, paid, total, status } = req.body;

  if (!student_id || !name || !department || !year || !semester || !batch || !total) {
    return res.status(400).json({ message: 'All fields except paid are required' });
  }

  const query = 'INSERT INTO students (student_id, name, department, year, semester, batch, paid, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [student_id, name, department, year, semester, batch, paid || 0, total, status || 'unpaid'], (err, result) => {
    if (err) {
      console.log('Error adding student:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: 'Student added successfully', student_id, id: result.insertId });
  });
});

// ✅ Update Student (Edit Fees)
app.put('/update-student/:id', (req, res) => {
  const { id } = req.params;
  const { name, department, year, semester, batch, paid, total, status } = req.body;

  const query = 'UPDATE students SET name=?, department=?, year=?, semester=?, batch=?, paid=?, total=?, status=? WHERE student_id=?';
  db.query(query, [name, department, year, semester, batch, paid, total, status, id], (err, result) => {
    if (err) {
      console.log('Error updating student:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student updated successfully' });
  });
});

// ✅ Delete Student
app.delete('/delete-student/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM students WHERE student_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.log('Error deleting student:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  });
});


// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});
