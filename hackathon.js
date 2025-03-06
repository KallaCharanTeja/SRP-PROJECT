async function fetchHackathons() {
    try {
        const response = await fetch('http://localhost:5000/server');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const hackathons = await response.json(); 
        const dataDiv = document.getElementById('data');
        dataDiv.innerHTML = ''; 

        hackathons.forEach(hackathon => {
            const hackathonDiv = document.createElement('div');
            hackathonDiv.classList.add('hackathon');
            const reminderButton = document.createElement('button');
            reminderButton.textContent = 'Add Reminder';
            reminderButton.style.float = 'right';
            reminderButton.onclick = () => addGoogleCalendarReminder(hackathon.title, hackathon.time_left);

            hackathonDiv.innerHTML = `
                <h3>${hackathon.title}</h3>
                <p><strong>Host:</strong> ${hackathon.host}</p>
                <p><strong>Submission Period:</strong> ${hackathon.submission_period}</p>
                <p><strong>Time Left:</strong> ${hackathon.time_left}</p>
                <p><strong>Location:</strong> ${hackathon.location}</p>
                <p><strong>Themes:</strong> ${hackathon.themes}</p>
                <a href="${hackathon.url}" target="_blank">Main Site</a>
                <button class="reminder-btn" onclick="addReminder('${hackathon.title}', '${hackathon.time_left}')">Add Reminder</button>
            `;

            dataDiv.appendChild(hackathonDiv);
        });
    } catch (error) {
        console.error('Error fetching hackathons:', error);
        document.getElementById('data').innerHTML = '<p>Error fetching data. Please try again later.</p>';
    }
}

function addReminder(title, timeLeft) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + parseInt(timeLeft));
    const formattedDate = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const calendarUrl = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(title)}&dates=${formattedDate}/${formattedDate}`;
    window.open(calendarUrl, '_blank');
}

window.onload = fetchHackathons;
