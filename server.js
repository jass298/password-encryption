
const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const crypto = require('crypto');
const ejs = require('ejs');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'passenc'
});

conn.connect((err) => {
    if (err) throw err;
    console.log('MySQL connected...');
});




//route for homepage
// Show all users (optional)
app.get('/', (req, res) => {
    conn.query("SELECT * FROM users", (err, results) => {
        if (err) throw err;
        res.render('table', { results });
    });
});

// Show register and login forms
app.get('/signup', (req, res) => res.render('signup'));
app.get('/login', (req, res) => res.render('login'));


// Save user info (Register)
app.post('/signup', (req, res) => {
    const { t1, t2, t3, t4 } = req.body;
    const hash = crypto.createHash('md5').update(t2).digest('hex');

    const sql = "INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)";
    const values = [t1, hash, t3, t4];

    conn.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).send("Something went wrong while saving your data.");
        }
        console.log('User registered successfully');
        res.send("Registration successful!");
    });
});

// Login route
app.post('/login', (req, res) => {
    const { name, password } = req.body;
    const hash = crypto.createHash('md5').update(password).digest('hex');

    const sql = "SELECT * FROM users WHERE username = ?";
    conn.query(sql, [name], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Internal server error.");
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = results[0];
        if (user.password === hash) {
            res.json({ message: "Login successful", user });
        } else {
            res.status(401).json({ message: "Incorrect password" });
        }
    });
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
