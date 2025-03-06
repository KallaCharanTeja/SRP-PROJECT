const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors'); 

const app = express();
const port = 5001; 

const dbConfig = {
    host: 'localhost',
    user: 'root', 
    password: '', 
    database: 'internships'
};

app.use(cors());

app.get('/serveri', async (req, res) => { 
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM internships'); // Assuming you have an 'internships' table
        await connection.end();
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching internships:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Internships server is running at http://localhost:${port}`);
});
