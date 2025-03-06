const puppeteer = require('puppeteer');
const { insertHackathonData, checkHackathonExists } = require('./database'); // Import check function

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const maxPages = 2; 
    const allHackathons = []; 

    const url = `https://devpost.com/hackathons?challenge_type[]=online&open_to[]=public&status[]=upcoming&status[]=open`;
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    let currentPage = 1;

    while (currentPage <= maxPages) {
        console.log(`Fetching data from Scroll/Page ${currentPage}`);

        console.log('Waiting for hackathon tiles to load...');
        const hackathonTileSelector = '.hackathon-tile';
        await page.waitForSelector(hackathonTileSelector);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Extra delay for dynamic content

        async function scrollToEnd() {
            await page.evaluate(async () => {
                window.scrollTo(0, document.body.scrollHeight);
                await new Promise(resolve => setTimeout(resolve, 2000));
            });
        }

        let previousHeight;
        for (let i = 0; i < 5; i++) {
            previousHeight = await page.evaluate(() => document.body.scrollHeight);
            await scrollToEnd();
            const currentHeight = await page.evaluate(() => document.body.scrollHeight);
            console.log(`Scrolling... Current Height: ${currentHeight}, Previous Height: ${previousHeight}`);
            if (currentHeight === previousHeight) break;
        }

        console.log('Extracting hackathon data...');
        const hackathons = await page.evaluate(() => {
            const hackathonElements = document.querySelectorAll('.hackathon-tile');
            const data = [];

            hackathonElements.forEach(hackathon => {
                const title = hackathon.querySelector('h3')?.innerText || 'No title';
                const host = hackathon.querySelector('.side-info .host-label')?.innerText || 'No host';
                const submissionPeriod = hackathon.querySelector('.side-info .submission-period')?.innerText || 'No submission period';
                const url = hackathon.querySelector('a')?.href || 'No URL';
                const timeLeft = hackathon.querySelector('.status-label.open')?.innerText || 'No time left';
                const location = hackathon.querySelector('.info-with-icon .info span')?.innerText || 'No location';
                const themeElements = hackathon.querySelectorAll('.theme-label');
                const themes = Array.from(themeElements).map(theme => theme.innerText);

                data.push({ title, host, submissionPeriod, url, timeLeft, location, themes });
            });
            return data;
        });
        allHackathons.push(...hackathons);
        console.log(`Total Hackathons Extracted in Scroll/Page ${currentPage}: ${hackathons.length}`);

        currentPage++; // Move to the next scroll/page
    }

    // Check if the last hackathon is already in the database and insert if not
    if (allHackathons.length > 0) {
        const lastHackathon = allHackathons[allHackathons.length - 1];
        const exists = await checkHackathonExists(lastHackathon.url); // Check existence based on unique field (e.g., URL)

        if (!exists) {
            await insertHackathonData(lastHackathon); // Insert the last hackathon if it doesn't exist
            console.log(`Inserted Hackathon: ${JSON.stringify(lastHackathon, null, 2)}`);
        } else {
            console.log('Hackathon already exists in the database:', lastHackathon.url);
        }
    }

    console.log('All Extracted Hackathon Data:', JSON.stringify(allHackathons, null, 2));
    await browser.close();
})();
