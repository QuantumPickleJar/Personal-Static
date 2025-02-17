import { initPagination } from './pagination.js';
import { getPlaceholderForStack,  } from './rsc/js/placeholderBuilder.js';
import { filterProjByTitle, filterByDate } from './gallery-sorting.js';
import { getIcon, renderOneStackIcon } from './rsc/js/stackIconLoader.js';
export let allProjects = []; // stored projects go here

/** Fetch projects.json and render gallery */
export function loadProjects() {
  fetch('rsc/projects.json')
    .then(response => response.json())
    .then(data => {
      allProjects = data;
      console.log('Projects loaded:', allProjects);
      initPagination(allProjects, 6);
    })
    .catch(err => console.error('Failed to load projects:', err));
}


/** Render the gallery with a given array of projects */
export function renderProjectsGalleryOld(projects) {
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

/** Render the gallery with a given array of projects */
export function renderProjectsGallery(projects) {
  console.log('Rendering projects:', projects);
  const gallery = document.getElementById('projectsGallery');
  gallery.innerHTML = ''; // Clear content

  projects.forEach(project => {
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
    thumb.src = project.thumbnail || 'rsc/images/placeholder.jpg';
    thumb.alt = project.title;

    // Title
    const title = document.createElement('div');
    title.classList.add('project-title');
    title.textContent = project.title;

    // Stack Icons
    const stackContainer = document.createElement('div');
    stackContainer.classList.add('stack-icons');

    const MAX_VISIBLE_STACK = 3;
    const totalStack = project.stack.length;

    project.stack.slice(0, MAX_VISIBLE_STACK).forEach(tech => {
      const techSpan = document.createElement('span');
      techSpan.classList.add('stack-icon');
      techSpan.textContent = tech;
      stackContainer.appendChild(techSpan);
    });

    // "+N more" link if needed
    if (totalStack > MAX_VISIBLE_STACK) {
      const moreLink = document.createElement('span');
      moreLink.classList.add('more-link');
      moreLink.textContent = `+${totalStack - MAX_VISIBLE_STACK} more`;
      moreLink.addEventListener('click', e => {
        e.stopPropagation();
        expandStack(stackContainer, project.stack, MAX_VISIBLE_STACK, moreLink);
      });
      stackContainer.appendChild(moreLink);
    }

    card.appendChild(thumb);
    card.appendChild(title);
    card.appendChild(stackContainer);

    card.addEventListener('click', () => {
      openProjectModal(project.id);
    });

    gallery.appendChild(card);
  });
}

/** Expand stack icons */
function expandStack(container, stackArray, max, linkElement) {
  container.removeChild(linkElement);
  stackArray.slice(max).forEach(tech => {
    const techSpan = document.createElement('span');
    techSpan.classList.add('stack-icon');
    techSpan.textContent = tech;
    container.appendChild(techSpan);
  });
}



// TODO: collapse Stack

/** Open modal */
// export function openProjectModal(projectId) {
//   const project = allProjects.find(p => p.id === projectId);
//   if (!project) return;
// // Get references to the modal and elements
//   const modal = document.getElementById('projectModal');
//   const modalTitle = document.getElementById('modalTitle');
//   const modalDesc = document.getElementById('modalDescription');
//   const modalStack = document.getElementById('modalStack');
//   const modalImages = document.getElementById('modalImages');

//   modalStack.innerHTML = '';

//   // For each tech in the project’s stack, create an icon `<img>`
//   project.stack.forEach(tech => {
//     const iconEl = renderOneStackIcon(tech);
//     modalStack.appendChild(iconEl);
//   });

//   // Clear any old data
//   modalTitle.innerText = '';
//   modalDesc.innerText = '';
//   modalStack.innerHTML = '';
//   modalImages.innerHTML = '';

//   const fullStackContainer = document.createElement('div');
//   fullStackContainer.classList.add('stack-icons');
//   project.stack.forEach(tech => {
//     const techSpan = document.createElement('span');
//     techSpan.classList.add('stack-icon');
//     techSpan.textContent = tech;
//     fullStackContainer.appendChild(techSpan);
//   });

//   const previewContainer = document.createElement('div');
//   previewContainer.style.marginTop = '10px';
//   if (project.previewImages && project.previewImages.length > 0) {
//     project.previewImages.forEach(imgSrc => {
//       const img = document.createElement('img');
//       img.src = imgSrc;
//       img.alt = project.title;
//       img.style.width = '100%';
//       img.style.marginBottom = '10px';
//       previewContainer.appendChild(img);
//     });
//   }

//   // Populate text fields
//   modalTitle.innerText = project.title;
//   modalDesc.innerText = project.description || 'No description available';

//   // Display the stack items or icons
//   if (project.stack && project.stack.length > 0) {
//     project.stack.forEach(tech => {
//       const techSpan = document.createElement('span');
//       techSpan.classList.add('stack-icon');
//       techSpan.textContent = tech;
//       modalStack.appendChild(techSpan);

//       // OR if using `getIcon` from tech-stack-icons:
//       getIcon(tech).then(iconUrl => {
//         const iconImg = document.createElement('img');
//         iconImg.src = iconUrl;
//         iconImg.alt = tech;
//         iconImg.classList.add('modal-image');
//         modalStack.appendChild(iconImg);
//         }).catch(err => {
//           console.warn('Failed to get icon for', tech, err);
//           });
//           /*
//       */
//     });
//   }
 

// // If images is empty, show placeholder
//   if (!project.images || project.images.length === 0) {
//     const placeholderSrc = getPlaceholderForStack(project.stack);
//     const imgElement = document.createElement('img');
//     imgElement.src = placeholderSrc;
//     imgElement.classList.add('modal-image');
//     modalImages.appendChild(imgElement);
//   } else {
//     // Show all images
//     project.images.forEach(imgSrc => {
//       const imgElement = document.createElement('img');
//       imgElement.src = imgSrc;
//       imgElement.classList.add('modal-image');
//       modalImages.appendChild(imgElement);
//     });
//   } 

//   modal.style.display = 'block';
// }

export function openProjectModal(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;

  // Show the modal
  const modal = document.getElementById('projectModal');
  modal.style.display = 'block';

  // Title
  const modalTitle = document.getElementById('modalTitle');
  modalTitle.textContent = project.title;

  // Images
  const modalImages = document.getElementById('modalImages');
  modalImages.innerHTML = '';
  if (project.images && project.images.length > 0) {
    project.images.forEach(imgSrc => {
      const img = document.createElement('img');
      img.src = imgSrc;
      modalImages.appendChild(img);
    });
  } else {
    // fallback placeholder
    const placeholderSrc = getPlaceholderForStack(project.stack);
    const imgElement = document.createElement('img');
    imgElement.src = placeholderSrc;
    modalImages.appendChild(imgElement);
  }

  // Stack
  const modalStack = document.getElementById('modalStack');
  modalStack.innerHTML = '';
  project.stack.forEach(tech => {
    // Possibly use your dynamic icon loader:
    const iconEl = renderOneStackIcon(tech);
    modalStack.appendChild(iconEl);
  });

  // Bottom container
  const projectStatus = document.getElementById('projectStatus');
  projectStatus.textContent = `Status: ${project.status || 'N/A'}`;

  const projectDates = document.getElementById('projectDates');
  projectDates.textContent = `Dates: ${project.dates || 'Unknown'}`;

  const modalDesc = document.getElementById('modalDescription');
  modalDesc.textContent = project.description || 'No description available';
}


/** Close the modal and "reset" it*/
export function closeModal() {
  const modal = document.getElementById('projectModal');
  modal.style.display = 'none';

  // Optionally clear fields so it’s fresh next time
  document.getElementById('modalTitle').innerText = '';
  document.getElementById('modalDescription').innerText = '';
  document.getElementById('modalStack').innerHTML = '';
  document.getElementById('modalImages').innerHTML = '';
}


