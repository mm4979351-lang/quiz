const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// File path
const dataFile = path.join(__dirname, 'attempts.json');

// Ensure file exists
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([]));
}

// ===============================
// SAVE ATTEMPT
// ===============================
app.post('/save-attempt', (req, res) => {
    try {
        const attempt = req.body;

        // Basic validation
        if (!attempt.Name || !attempt.Email || attempt.Score === undefined) {
            return res.status(400).json({ message: "Invalid Data" });
        }

        const existingData = JSON.parse(fs.readFileSync(dataFile));

        // Add unique ID & timestamp
        attempt.id = Date.now().toString();
        attempt.Timestamp = new Date();

        existingData.push(attempt);

        fs.writeFileSync(dataFile, JSON.stringify(existingData, null, 2));

        res.status(200).json({
            message: "Attempt Saved Successfully",
            id: attempt.id
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ===============================
// GET ALL ATTEMPTS
// ===============================
app.get('/attempts', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataFile));
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error reading data" });
    }
});

// ===============================
// GET SINGLE ATTEMPT BY ID
// ===============================
app.get('/attempt/:id', (req, res) => {
    try {
        const id = req.params.id;
        const data = JSON.parse(fs.readFileSync(dataFile));

        const student = data.find(item => item.id === id);

        if (!student) {
            return res.status(404).json({ message: "Student Not Found" });
        }

        res.json(student);

    } catch (error) {
        res.status(500).json({ message: "Error fetching student" });
    }
});

// ===============================
// GET ATTEMPTS BY EMAIL
// ===============================
app.get('/attempt/email/:email', (req, res) => {
    try {
        const email = req.params.email;
        const data = JSON.parse(fs.readFileSync(dataFile));

        const studentAttempts = data.filter(item => item.Email === email);

        if (studentAttempts.length === 0) {
            return res.status(404).json({ message: "No Attempts Found For This Email" });
        }

        res.json(studentAttempts);

    } catch (error) {
        res.status(500).json({ message: "Error fetching data" });
    }
});



// ===============================
// DELETE ATTEMPT BY ID
// ===============================
app.delete('/attempt/:id', (req, res) => {
    try {
        const id = req.params.id;
        let data = JSON.parse(fs.readFileSync(dataFile));

        const newData = data.filter(item => item.id !== id);

        if (data.length === newData.length) {
            return res.status(404).json({ message: "Student Not Found" });
        }

        fs.writeFileSync(dataFile, JSON.stringify(newData, null, 2));

        res.json({ message: "Attempt Deleted Successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error deleting attempt" });
    }
});

// ===============================
// SERVER START
// ===============================
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});