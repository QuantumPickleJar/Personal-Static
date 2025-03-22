/**
 * @fileoverview Script that builds image directories for projects listed in a JSON file.
 * @description This script reads project entries from a JSON file and creates a corresponding 
 * directory structure for images. Each project gets its own directory named after the project's ID
 * within the images folder. If a directory already exists for a project, it will be skipped.
 * 
 * @requires fs - Node.js file system module
 * @requires path - Node.js path module
 * 
 * @example
 * // Structure of projects.json file:
 * // [
 * //   { "id": "project1", "title": "Project One", ... },
 * //   { "id": "project2", "title": "Project Two", ... }
 * // ]
 * 
 * // To run the script:
 * node buildImageDir.js
 * // This will create:
 * // - /rsc/images/project1/
 * // - /rsc/images/project2/
 * 
 * @file buildImageDir.js - Directory builder for project images
 */
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