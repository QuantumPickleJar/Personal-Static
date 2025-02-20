const fs = require('fs');
const path = require('path');

const projectsPath = path.join(__dirname, 'rsc', 'projects.json');
const imagesDir = path.join(__dirname, 'rsc', 'images');

fs.readFile(projectsPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading projects.json:', err);
        process.exit(1);
    }

    let projects;
    try {
        projects = JSON.parse(data);
    } catch (e) {
        console.error('Error parsing JSON:', e);
        process.exit(1);
    }

    projects.forEach(project => {
        const projectDir = path.join(imagesDir, project.id);
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir, { recursive: true });
            console.log(`Created directory: ${projectDir}`);
        } else {
            console.log(`Directory already exists: ${projectDir}`);
        }
    });
});