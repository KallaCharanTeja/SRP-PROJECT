const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 5000;


const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hackathons'
};

app.use(cors()); 

app.get('/server', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM hackathons');
        await connection.end();
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching hackathons:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
