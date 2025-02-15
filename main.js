import { loadProjects, closeModal } from './js/projects.js';

/**
 * Load partial files into the main page
 */
function loadPartial(file, elementId) {
  fetch(`./${file}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error fetching ${file}: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      const container = document.getElementById(elementId);
      container.innerHTML = html;

    })
    .catch(error => {
      console.error('Error loading partial:', error);
    });
}


function populateModal(project) {
  document.getElementById('modalTitle').innerText = project.title;
  document.getElementById('modalShortForm').innerText = project.shortForm;
  document.getElementById('modalDescription').innerText = project.description;

  const modalImages = document.getElementById('modalImages');
  modalImages.innerHTML = '';

  if (project.images.length === 0) {
    // Generate placeholder based on stack
    const placeholder = imageManager.generatePlaceholder(project.stack);
    const imgElement = document.createElement('img');
    imgElement.src = placeholder;
    imgElement.classList.add('modal-placeholder');
    modalImages.appendChild(imgElement);
  } else if (project.images.length === 1) {
    // Center the single image
    const imgElement = document.createElement('img');
    imgElement.src = project.images[0];
    imgElement.classList.add('modal-single-image');
    modalImages.appendChild(imgElement);
  } else {
    // Create horizontal container for multiple images
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('horizontal-stack');

    project.images.forEach(imgSrc => {
      const imgElement = document.createElement('img');
      imgElement.src = imgSrc;
      imgElement.classList.add('modal-multiple-image');
      imageContainer.appendChild(imgElement);
    });

    modalImages.appendChild(imageContainer);
  }

  // Populate stack icons vertically
  const stackBox = document.getElementById('stackBox');
  stackBox.innerHTML = '';
  project.stack.forEach(tech => {
    const stackImg = document.createElement('img');
    stackImg.src = `/rsc/images/stack/${tech.toLowerCase()}.png`;
    stackImg.classList.add('stack-icon');
    stackBox.appendChild(stackImg);
  });

  // Show modal
  document.getElementById('projectModal').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  // Load partials using the updated relative paths
  loadPartial('partials/header.html', 'headerContainer');
  loadPartial('partials/footer.html', 'footerContainer');
  loadPartial('partials/sidebar.html', 'sidebarContainer');

  // Check if the current page is projects.html
  if (window.location.pathname.endsWith('projects.html')) {
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
  }
});