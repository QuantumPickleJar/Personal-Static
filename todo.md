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
  - Default or generated placeholders when no images
- Functionality
  - Search function by stack
  - Date parsing from JSON
  - “status” fix
  - Validate shortForm usage
  - Basic mermaid integration
  - Responsive stackBox (modal & gallery)
- Pending
  - Implement imageLoader.js & stackStylesheet.css


----
- search bar on projects page
- center the text 

> So my advanced search bar does not update when the windows is resized. Secondarily, the "projects per page" needs be attached to the main content container, right now it attaches to the sidebar. When I tried targeting mainContent or mainContainer, it failed saying it was null. #codebase

- circle is too large on some projects without images (based on their description size, thus how much space is alotted to the `bottomContainer`)
- booksPage
- placeholder only renders SVGs, needs to render PNGS too
