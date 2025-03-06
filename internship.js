async function fetchInternships() {
    try {
        const response = await fetch('http://localhost:5001/serveri'); 
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const internships = await response.json(); 
        const dataDiv = document.getElementById('data');
        dataDiv.innerHTML = '';
        internships.forEach(internship => {
            const internshipDiv = document.createElement('div');
            internshipDiv.classList.add('internship');

            internshipDiv.innerHTML = `
                <h3>${internship.title}</h3>
                <p><strong>Author:</strong> ${internship.author || 'Not specified'}</p>
                <a href="${internship.url}" target="_blank">Apply Now</a>
            `;
            dataDiv.appendChild(internshipDiv);
        });
    } catch (error) {
        console.error('Error fetching internships:', error);
        document.getElementById('data').innerHTML = '<p>Error fetching data. Please try again later.</p>';
    }
}
window.onload = fetchInternships;
