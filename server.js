const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Connect to SQLite database
const db = new sqlite3.Database('database.sqlite');

// Create scores table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        word TEXT,
        score INTEGER
    )`);
});

// Endpoint to submit a score
app.post('/submit-score', (req, res) => {
    const { name, word, score } = req.body;
    db.run(`INSERT INTO scores (name, word, score) VALUES (?, ?, ?)`, [name, word, score], function (err) {
        if (err) {
            res.json({ success: false });
            return console.error(err.message);
        }
        res.json({ success: true });
    });
});

// Endpoint to get scores
app.get('/scores', (req, res) => {
    db.all(`SELECT name, word, score FROM scores ORDER BY score DESC`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Serve index.html as the default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve score.html as the scores route
app.get('/score', (req, res) => {
    res.sendFile(path.join(__dirname, 'score.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});