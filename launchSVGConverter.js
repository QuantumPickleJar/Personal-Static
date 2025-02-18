
/**
 * @file launchSVGConverter.js
 * @description A simple HTTP server that serves an HTML form for submitting SVG icon definitions and processes POST requests to update a JavaScript map file with new SVG entries.
 *
 * The server performs the following functions:
 *
 * - Handles GET requests by serving an HTML form that accepts:
 *   - A text field for icon name(s) (multiple names separated by commas if the multiple flag is checked).
 *   - A textarea for pasting one or more complete <svg>...</svg> blocks.
 *   - An optional checkbox to indicate whether multiple SVGs are provided.
 *
 * - Handles POST requests to:
 *   - Parse the submitted form data.
 *   - Validate and extract one or more SVG blocks (using regex) from the submitted HTML.
 *   - Compare the icon names against existing entries in the target JavaScript file (stackSvgMap.js) in a case-insensitive manner.
 *   - If an icon already exists, skip adding it.
 *   - Inject new icon entries into the iconSvgs object in the target file before its closing brace.
 *
 * The server uses the following modules:
 * @requires http - To create the HTTP server.
 * @requires fs - To read and write the file system.
 * @requires path - To resolve file paths.
 * @requires querystring - To parse URL encoded form data.
 *
 * @constant {string} mapFilePath - Absolute path to the JavaScript file (stackSvgMap.js) containing the icon SVG map.
 * @constant {number} port - Port number (3000) on which the server listens.
 *
 * @event request - The HTTP request event, which is processed by checking the request method (GET or POST) and handling accordingly.
 *
 * @example
 * // Run the server
 * node launchSVGConverter.js
 *
 * // Navigate to http://localhost:3000/ in your browser to load the SVG Converter form.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

// Path to the stackIconMap.js file to update
const mapFilePath = path.join(__dirname, 'rsc/js/stackSvgMap.js');

const port = 3000;

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        // Serve HTML form with a checkbox for handling multiple SVGs.
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SVG Converter</title>
            </head>
            <body>
                <h1>SVG Converter</h1>
                <form method="POST">
                    <label>Icon Name(s):
                        <input type="text" name="iconName" required>
                    </label>
                    <br>
                    <small>If handling multiple icons, separate their names by commas.</small>
                    <br><br>
                    <label>SVG HTML:
                        <textarea name="svgHTML" rows="15" cols="70" required></textarea>
                    </label>
                    <br>
                    <small>
            Paste one or more complete &lt;svg&gt;…&lt;/svg&gt; blocks. In multiple mode each SVG block is extracted automatically.
          </small>
                    <br><br>
                    <label>Multiple SVGs?
                        <input type="checkbox" name="multiple">
                    </label>
                    <br><br>
                    <button type="submit">Submit</button>
                </form>
            </body>
            </html>
        `);
    } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const postData = querystring.parse(body);
            const { iconName, svgHTML } = postData;
            const isMultiple = postData.multiple !== undefined;
            
            fs.readFile(mapFilePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Error reading stackSvgMap.js');
                    return;
                }
        
                let newEntries = "";
                if (isMultiple) {
                    // Split icon names by commas (trimmed) into an array
                    const iconNames = iconName.split(',').map(n => n.trim()).filter(n => n);
          
                    // Use a regex to extract all complete SVG blocks
                    const svgMatches = svgHTML.match(/<svg[\s\S]*?<\/svg>/gi);
          
                    if (!svgMatches || iconNames.length !== svgMatches.length) {
                        res.writeHead(400);
                        res.end('<p>Error: The number of icon names does not match the number of SVG blocks extracted.</p>');
                        return;
                    }
          
                    iconNames.forEach((name, index) => {
                        // Check if the icon already exists (case-insensitive)
                        const regexName = new RegExp(`\\b${name}\\s*:\\s*\``, 'i');
                        if (regexName.test(data)) {
                            newEntries += `\n    // Skipped ${name}: already exists.\n`;
                        } else {
                            newEntries += `\n    ${name}: \`\n${svgMatches[index]}\n    \`,`;
                        }
                    });
                } else {
                    // Single icon handling (same as before)
                    const regex = new RegExp(`\\b${iconName}\\s*:\\s*\``, 'i');
                    if (regex.test(data)) {
                        res.writeHead(200);
                        res.end(`<p>Icon "${iconName}" already exists.</p>`);
                        return;
                    }
                    newEntries = `\n    ${iconName}: \`\n${svgHTML}\n    \`,`;
                }
        
                // Insert new entry(ies) before the closing brace of the iconSvgs object
                const updatedData = data.replace(/(export\s+const\s+iconSvgs\s*=\s*{)([\s\S]*)(\n};)/, (match, p1, p2, p3) => {
                    return p1 + p2 + newEntries + p3;
                });
        
                fs.writeFile(mapFilePath, updatedData, 'utf8', (err) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Error writing to stackSvgMap.js');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`<p>${isMultiple ? 'Multiple icons have been processed' : `Icon "\${iconName}"\`} added successfully.</p>`}`);
                });
            });
        });
    }
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
