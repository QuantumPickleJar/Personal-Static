const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

// Path to the stackIconMap.js file to update
const mapFilePath = path.join(__dirname, 'rsc/js/stackIconMap.js');

const port = 3000;

const server = http.createServer((req, res) => {
	if (req.method === 'GET') {
		// Serve simple HTML form
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
					<label>Icon Name:
						<input type="text" name="iconName" required>
					</label>
					<br>
					<label>SVG HTML:
						<textarea name="svgHTML" rows="10" cols="50" required></textarea>
					</label>
					<br>
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
      
			fs.readFile(mapFilePath, 'utf8', (err, data) => {
				if (err) {
					res.writeHead(500);
					res.end('Error reading stackIconMap.js');
					return;
				}

				// Check if the icon already exists
				const regex = new RegExp(`\\b${iconName}\\s*:`);
				if (regex.test(data)) {
					res.writeHead(200);
					res.end(`<p>Icon "${iconName}" already exists.</p>`);
					return;
				}

				// Prepare the new icon entry (indentation of 4 spaces)
				const newEntry = `\n    ${iconName}: \`\n${svgHTML}\n    \`,`; // using template literal

				// Insert before the closing brace of iconSvgs object
				const updatedData = data.replace(/(export\s+const\s+iconSvgs\s*=\s*{)([\s\S]*)(\n};)/, (match, p1, p2, p3) => {
					return p1 + p2 + newEntry + p3;
				});

				fs.writeFile(mapFilePath, updatedData, 'utf8', (err) => {
					if (err) {
						res.writeHead(500);
						res.end('Error writing to stackIconMap.js');
						return;
					}

					res.writeHead(200);
					res.end(`<p>Icon "${iconName}" added successfully.</p>`);
				});
			});
		});
	}
});

server.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});
