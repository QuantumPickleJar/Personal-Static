# Pages
- default to display projects by their date, not their id
- render icons instead of text if bandwidth permits
- display shortForm on the gallery view

## About Me
- collapsible `div` sections for larger, non technical projects to be displayed

## Un-added projects:
- steering wheel
- 3D Printer
- Airport App (FWAPPA?)
## Profile
- employment
- picture
- link to a filter by job on [[#Projects]]

## Home

- summarize work experience and most broadly applicable skills

## Panels

## Features 

## Contact Page

### Appearence 
## Images

### Project Images
- These may be able to be made as partials 
- build layout for each case of project details: 
- [ ] those with **NO** image
- [ ] those with **ONE** image
- [ ] those with **MULTIPLE** images

### Stack Images
#### Functionality

- pull resources from `/rsc/images/stack/`
- apply styling rules to the image(s) 
- Date parsing from Json (may need to split into two dates)
- "status" is broken
- verify Description is what's being used, not shortForm
- mermaid integration

#### Appearance 

- a div with id `stackBox` will be used to hold the list of images defining the stack used in a given project entry
- the box would ideally be responsive so that we can have it remain largely re-usable between modal states AND device viewed
- 
##### Gallery Page
- project image should not be used at all
- list of (stack)images should be **horizontal**
- run along the top edge of detail cards

##### Modal

In the case that there are no images, we'll build one based off of the tech stack.  E.g:
bubbles containing the small tech stack image should be used here
- list of stack images should be **vertical**
Example Shapes:
if **two** : One at N and one at S
if **four**: one at each Cardinal Direction
if **five**: apex of regular pentagon 

If no project image:
- render a default image that is a circle of equidistant points for each "piece" of the stack

If one project image: 
- Center it in the image-container for the modal

If **two or more** images, it's possible that I'd need an additional `<div>` element to act as a horizontal container

## Functionality
- search function by the stack

Expected files:

- imageLoader.js
- stackStylesheet.css

## Roadmap
- academic color needs to be different than personal
- Layout
  - Default sort by project date
  - Render icons (if bandwidth)
  - Gallery view uses shortForm
  - Collapsible sections for About Me
- Projects
  - Confirm steering wheel & 3D Printer
  - Summarize work experience on Home
  - Profile w/ employment, profile image, and job-filter link
- Appearance
  - Reusable image partials for single/multiple/no image
  - Vertically vs. horizontally stacked images
- Functionality
  - Search function by stack
  - Responsive stackBox (modal & gallery)
  - Implement imageLoader.js & stackStylesheet.css

----

- search bar on projects page
- center the text

> So my advanced search bar does not update when the windows is resized. Secondarily, the "projects per page" needs be attached to the main content container, right now it attaches to the sidebar. When I tried targeting mainContent or mainContainer, it failed saying it was null. #codebase

- circle is too large on some projects without images (based on their description size, thus how much space is alotted to the `bottomContainer`)
- booksPage
- placeholder only renders SVGs, needs to render PNGS too
- carousel needs to loop around\



----
mOVE ROOT ON GH-PAGE
If the `dist` folder is not available in the dropdown for GitHub Pages configuration, it's likely because the folder does not exist in the `gh-pages` branch or the branch itself is not correctly set up.

To resolve this, you can manually move the contents of the `dist` folder to the root of the `gh-pages` branch using the CLI. Here are the steps:

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/QuantumPickleJar/Personal-Static.git
   cd Personal-Static
   git checkout gh-pages
   ```

2. **Move `dist` Contents to Root**:
   ```sh
   mv dist/* .
   rm -rf dist
   ```

3. **Commit and Push Changes**:
   ```sh
   git add .
   git commit -m "Move contents of dist to root"
   git push origin gh-pages
   ```

If you prefer to keep the `dist` directory structure and serve it as the root, you can create a new branch and move the `dist` contents there:

1. **Create a New Branch**:
   ```sh
   git checkout -b gh-pages
   ```

2. **Move `dist` Contents to Root**:
   ```sh
   mv dist/* .
   rm -rf dist
   ```

3. **Commit and Push Changes**:
   ```sh
   git add .
   git commit -m "Move contents of dist to root in gh-pages branch"
   git push origin gh-pages
   ```

4. **Configure GitHub Pages**:
   - Go to your repository on GitHub.
   - Click on the "Settings" tab.
   - Scroll down to the "Pages" section.
   - In the "Source" dropdown, select the new `gh-pages` branch.
   - Click "Save" to apply the changes.

This should make the `index.html` file accessible from the root URL.