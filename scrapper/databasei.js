const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'internships'
};

async function checkInternshipExists(url) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT COUNT(*) AS count FROM internships WHERE url = ?', [url]);
    await connection.end();
    return rows[0].count > 0;
}

async function insertInternshipData(internship) {
    const connection = await mysql.createConnection(dbConfig);

    try {
        const { title, url, author, datePublished } = internship;
        const insertQuery = `
            INSERT INTO internships (title, url, author, date_published)
            VALUES (?, ?, ?, ?)
        `;

        await connection.execute(insertQuery, [
            title,
            url,
            author,
            datePublished
        ]);
        console.log(`Successfully added ${title} to the database.`);
    } catch (error) {
        console.error(`Error inserting data: ${error}`);
    } finally {
        await connection.end();
    }
}

module.exports = { insertInternshipData, checkInternshipExists };
