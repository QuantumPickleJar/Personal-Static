// main.js
// fetch html files from their corresponding partial files

// main.js

/**
 * Load partial files into the main page
 */
function loadPartial(file, elementId) {
  fetch(file)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error fetching ${file}: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      document.getElementById(elementId).innerHTML = html;
    })
    .catch(error => {
      console.error('Error loading partial:', error);
    });
}



// We'll store the fetched projects here
let allProjects = [];

/** Fetch projects.json and render gallery */
function loadProjects() {
  fetch('rsc/projects.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Could not fetch projects.json');
      }
      return response.json();
    })
    .then(data => {
      allProjects = data;
      // renderProjectsGallery(data);
      // projects, projects per page
      initPagination(allProjects, 6); // e.g., 6 items per page
    })
    .catch(err => console.error(err));
}

/** Render the gallery with a given array of projects */
function renderProjectsGallery(projects) {
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
    // Show "Academic" if true; otherwise, "Personal"
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
  // Remove the existing link
  container.removeChild(linkElement);

  // Add the rest of the stack items
  for (let i = max; i < stackArray.length; i++) {
    const techSpan = document.createElement('span');
    techSpan.classList.add('stack-icon');
    techSpan.textContent = stackArray[i];
    container.appendChild(techSpan);
  }
}

/** Open modal for a specific project by ID */
function openProjectModal(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;

  // Get modal elements
  const modal = document.getElementById('projectModal');
  const modalBody = document.getElementById('modalBody');

  // Clear previous content
  modalBody.innerHTML = '';
  
  // Academic label in modal (e.g., above the title)
  const academicLabel = document.createElement('span');
  academicLabel.classList.add('academic-label');
  academicLabel.textContent = project.academic ? "Academic" : "Personal";

  // Populate modal content
  const titleEl = document.createElement('h2');
  titleEl.textContent = project.title;

  const statusEl = document.createElement('p');
  statusEl.innerHTML = `<strong>Status:</strong> ${project.status}`;

  const dateEl = document.createElement('p');
  dateEl.innerHTML = `<strong>Started:</strong> ${project.dateStarted}`;

  const descEl = document.createElement('p');
  descEl.textContent = project.description;

  // Full stack list
  const fullStackContainer = document.createElement('div');
  fullStackContainer.classList.add('stack-icons');
  project.stack.forEach(tech => {
    const techSpan = document.createElement('span');
    techSpan.classList.add('stack-icon');
    techSpan.textContent = tech;
    fullStackContainer.appendChild(techSpan);
  });

  // Optional: preview images
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

  // Append all to modalBody
  modalBody.appendChild(titleEl);
  modalBody.appendChild(statusEl);
  modalBody.appendChild(dateEl);
  modalBody.appendChild(descEl);
  modalBody.appendChild(fullStackContainer);
  modalBody.appendChild(previewContainer);

  // Show the modal
  modal.style.display = 'block';
}

/** Close the modal */
function closeModal() {
  const modal = document.getElementById('projectModal');
  modal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  // Load projects.json
  loadProjects();

  // Close modal when user clicks the X button
  document.getElementById('closeModal').addEventListener('click', closeModal);

  // Also close modal if user clicks outside the modal content
  const modal = document.getElementById('projectModal');
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      closeModal();
    }
  });
});


// When DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  loadPartial('partials/header.html', 'headerContainer');
  loadPartial('partials/footer.html', 'footerContainer');
  loadPartial('partials/sidebar.html', 'sidebarContainer');
});
