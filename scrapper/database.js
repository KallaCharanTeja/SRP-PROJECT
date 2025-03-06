 const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root', 
    password: '', 
    database: 'hackathons'
};
async function checkHackathonExists(url) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT COUNT(*) AS count FROM hackathons WHERE url = ?', [url]);
    return rows[0].count > 0; 
}

async function insertHackathonData(hackathon) {
    const connection = await mysql.createConnection(dbConfig);

    try {
        const [rows] = await connection.execute(
            'SELECT * FROM hackathons WHERE url = ?',
            [hackathon.url]
        );

        if (rows.length === 0) {
            const { title, host, submissionPeriod,url, timeLeft, location, themes } = hackathon;
            const insertQuery = `
                INSERT INTO hackathons (title, host, submission_period,url, time_left, location, themes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            await connection.execute(insertQuery, [
                title,
                host,
                submissionPeriod,
                url,
                timeLeft,
                location,
                themes.join(', ') 
            ]);
            console.log(`Successfully added ${title} to the database.`);
        } else {
            console.log(`Skipping ${hackathon.title}: already exists in the database.`);
        }
    } catch (error) {
        console.error(`Error inserting data: ${error}`);
    } finally {
        await connection.end();
    }
}

module.exports = { insertHackathonData,checkHackathonExists };
