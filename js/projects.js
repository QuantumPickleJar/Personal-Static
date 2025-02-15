import { initPagination } from './pagination.js';
import { filterProjByTitle, filterByDate } from './gallery-sorting.js';

import ImageManager from './imageManager.js';

const imageManager = new ImageManager({ normalize: true });

export let allProjects = []; // stored projects go here

const newScript = document.createElement('script');
newScript.setAttribute('type', 'module'); // Important for ES Modules
newScript.textContent = oldScript.textContent;


/** Fetch projects.json and render gallery */
export function loadProjects() {
  fetch('rsc/projects.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Could not fetch projects.json');
      }
      return response.json();
    })
    .then(data => {
      allProjects = data;
      console.log('Projects loaded:', allProjects); // Debug log
      initPagination(allProjects, 6); // e.g., 6 items per page
    })
    .catch(err => console.error(err));
}

/** Render the gallery with a given array of projects */
export function renderProjectsGallery(projects) {
  console.log('Rendering projects:', projects); // Debug log
  const gallery = document.getElementById('projectsGallery');
  gallery.innerHTML = ''; // Clear any existing content

  projects.forEach(project => {
    // Create card container & set it as relative for positioning academic label
    const card = document.createElement('div');
    card.classList.add('project-card');
    card.dataset.projectId = project.id;
    card.style.position = 'relative';

    // Academic label (top right corner)
    const academicLabel = document.createElement('span');
    academicLabel.classList.add('academic-label');
    academicLabel.textContent = project.academic ? "Academic" : "Personal";
    card.appendChild(academicLabel);

    // Thumbnail
    const thumb = document.createElement('img');
    thumb.classList.add('project-thumbnail');
    thumb.src = project.thumbnail || 'images/placeholder.jpg';
    thumb.alt = project.title;

    // Title
    const title = document.createElement('div');
    title.classList.add('project-title');
    title.textContent = project.title;

    // Stack Icons (limit to 3 in this example)
    const stackContainer = document.createElement('div');
    stackContainer.classList.add('stack-icons');

    const MAX_VISIBLE_STACK = 3; // adjust as needed
    const totalStack = project.stack.length;

    project.stack.forEach((tech, index) => {
      if (index < MAX_VISIBLE_STACK) {
        const techSpan = document.createElement('span');
        techSpan.classList.add('stack-icon');
        techSpan.textContent = tech;
        stackContainer.appendChild(techSpan);
      }
    });

    // If there are more than MAX_VISIBLE_STACK, show a "+N more" link
    if (totalStack > MAX_VISIBLE_STACK) {
      const moreLink = document.createElement('span');
      moreLink.classList.add('more-link');
      moreLink.textContent = `+${totalStack - MAX_VISIBLE_STACK} more`;
      moreLink.addEventListener('click', e => {
        e.stopPropagation(); // Prevent immediate modal open
        expandStack(stackContainer, project.stack, MAX_VISIBLE_STACK, moreLink);
      });
      stackContainer.appendChild(moreLink);
    }

    // Append elements to the card
    card.appendChild(thumb);
    card.appendChild(title);
    card.appendChild(stackContainer);

    // Clicking the card opens the modal
    card.addEventListener('click', () => {
      openProjectModal(project.id);
    });

    gallery.appendChild(card);
  });
}

/** Expand the stack icons in the gallery card */
function expandStack(container, stackArray, max, linkElement) {
  container.removeChild(linkElement);

  for (let i = max; i < stackArray.length; i++) {
    const techSpan = document.createElement('span');
    techSpan.classList.add('stack-icon');
    techSpan.textContent = stackArray[i];
    container.appendChild(techSpan);
  }
}


/** Open modal for a specific project by ID */
export function openProjectModal(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;
  
  const modal = document.getElementById('projectModal');
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = ''; // Clear previous content
  
  const academicLabel = document.createElement('span');
  academicLabel.classList.add('academic-label');
  academicLabel.textContent = project.academic ? "Academic" : "Personal";
  
  const titleEl = document.createElement('h2');
  titleEl.textContent = project.title;
  
  const statusEl = document.createElement('p');
  statusEl.innerHTML = `<strong>Status:</strong> ${project.status}`;
  
  const dateEl = document.createElement('p');
  dateEl.innerHTML = `<strong>Started:</strong> ${project.dateStarted}`;

  const descEl = document.createElement('p');
  descEl.textContent = project.description;

  const fullStackContainer = document.createElement('div');
  fullStackContainer.classList.add('stack-icons');
  project.stack.forEach(tech => {
    const techSpan = document.createElement('span');
    techSpan.classList.add('stack-icon');
    techSpan.textContent = tech;
    fullStackContainer.appendChild(techSpan);
  });

  const previewContainer = document.createElement('div');
  previewContainer.style.marginTop = '10px';
  if (project.previewImages && project.previewImages.length > 0) {
    project.previewImages.forEach(imgSrc => {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = project.title;
      img.style.width = '100%';
      img.style.marginBottom = '10px';
      previewContainer.appendChild(img);
    });
  }

  // hide all modal-only content "above" the previewContainer
  modalBody.appendChild(titleEl);
  modalBody.appendChild(statusEl);
  modalBody.appendChild(dateEl);
  modalBody.appendChild(descEl);
  modalBody.appendChild(fullStackContainer);
  modalBody.appendChild(previewContainer);

  modal.style.display = 'block';
}

/** Close the modal */
export function closeModal() {
  const modal = document.getElementById('projectModal');
  modal.style.display = 'none';
}



async function loadGallery() {
  const imageSources = [
    { source: 'example-local.png', isRemote: false },
    { source: 'react', isRemote: true }
  ];

  const gallery = document.getElementById('projectsGallery');

  for (const { source, isRemote } of imageSources) {
    let imageUrl = await imageManager.getImage(source, isRemote);
    imageUrl = await imageManager.normalizeImage(imageUrl);

    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.classList.add('project-thumbnail');
    
    gallery.appendChild(imgElement);
  }
}

document.addEventListener('DOMContentLoaded', loadGallery);


// TODO: collapse Stack
