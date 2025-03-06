const puppeteer = require('puppeteer');
const { insertInternshipData, checkInternshipExists } = require('./databasei'); // Import check function

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const url = 'https://cse.noticebard.com/internships/';
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log('Waiting for internship tiles to load...');
    const internshipTileSelector = '.elementor-column';
    await page.waitForSelector(internshipTileSelector);
    await new Promise(resolve => setTimeout(resolve, 5000)); // Extra delay for dynamic content

    console.log('Extracting internship data...');
    const internships = await page.evaluate(() => {
        const internshipElements = document.querySelectorAll('.elementor-column');
        const data = [];

        internshipElements.forEach(internship => {
            const titleElement = internship.querySelector('.elementor-heading-title a');
            const title = titleElement?.innerText || 'No title';
            const url = titleElement?.href || 'No URL';
            const authorElement = internship.querySelector('.elementor-post-info__item--type-author');
            const author = authorElement?.innerText.replace('By ', '') || 'No author';
            const dateElement = internship.querySelector('.elementor-post-info__item--type-date time');
            const datePublished = dateElement?.innerText || 'No date';

            data.push({ title, url, author, datePublished });
        });
        return data;
    });

    console.log(`Total Internships Extracted: ${internships.length}`);

    for (const internship of internships) {
        try {
            const exists = await checkInternshipExists(internship.url);
            if (!exists) {
                await insertInternshipData(internship);
                console.log(`Inserted Internship: ${JSON.stringify(internship, null, 2)}`);
            } else {
                console.log(`Skipping ${internship.title}: already exists in the database.`);
            }
        } catch (error) {
            console.error(`Error inserting internship ${internship.title}:`, error);
        }
    }

    await browser.close();
})();
