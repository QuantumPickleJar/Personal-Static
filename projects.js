import * as bootstrap from 'bootstrap'; // Added to import Bootstrap module
import { initPagination } from './pagination.js';
import { getPlaceholderForStack,  } from './rsc/js/placeholderBuilder.js';
import { filterProjByTitle, filterByDate, createTruncatedSpan } from './gallery-sorting.js';
import { getIcon, renderOneStackIcon } from './rsc/js/stackIconLoader.js';
import { filterProjectsBySearchTerm } from './rsc/js/search.js';
import { projectsPerPage } from './perPageSettings.js';

export let allProjects = []; // stored projects go here

/** Fetch projects.json and render gallery */
export function loadProjects() {
  fetch('rsc/projects.json')
    .then(response => response.json())
    .then(data => {
      allProjects = data;
      console.log('Projects loaded:', allProjects);
      initPagination(allProjects, projectsPerPage);
    // Set up search input listener
    const searchInput = document.querySelector('#searchBar');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const term = searchInput.value.trim();
        // Filter
        const filtered = filterProjectsBySearchTerm(allProjects, term);
        // Re-render or re-paginate with the filtered array
        // For a simple re-render:
        renderProjectsGallery(filtered);
      });
    }
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
    
    // Date label (top left corner)
    const dateLabel = document.createElement('span');
    dateLabel.classList.add('date-label');
    
    // parse the datetime from the `dates` parameter, which will need a helper function
    dateLabel.textContent = project.dates;    // for now, this will suffice

    card.appendChild(dateLabel);
    
    // Academic label (top right corner)
    const academicLabel = document.createElement('span');
    academicLabel.classList.add('academic-label');

    if (project.academic) {
      academicLabel.classList.add('label-academic');
      academicLabel.textContent = 'Academic';
    } else {
      academicLabel.classList.add('label-personal');
      academicLabel.textContent = 'Personal';
    }
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

    // Thumbnail
    const thumb = document.createElement('img');
    thumb.classList.add('project-thumbnail');
    thumb.src = project.thumbnail || 'images/placeholder.jpg';
    thumb.alt = project.title;
    card.appendChild(thumb);

    // Academic label
    const academicLabel = document.createElement('span');
    academicLabel.classList.add('academic-label');
    academicLabel.textContent = project.academic ? "Academic" : "Personal";
    if (project.academic) {
      academicLabel.classList.add('academic');
    } else {
      academicLabel.classList.add('personal');
    }
    card.appendChild(academicLabel);

    // If multiple images, show an icon
    if (project.images && project.images.length > 1) {
      const imageCountIcon = document.createElement('div');
      imageCountIcon.classList.add('image-count-icon');
      imageCountIcon.innerHTML = `<span class="icon">&#128247;</span><span class="count">${project.images.length}</span>`;
      card.appendChild(imageCountIcon);
    }

    // Title
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('project-title');
    titleDiv.textContent = project.title;
    card.appendChild(titleDiv);

    // Use createTruncatedSpan to show shortForm (or fallback to description) in a tooltip if > 100 chars
    const shortOrDesc = project.shortForm || project.description || '';
    const truncatedSpan = createTruncatedSpan(shortOrDesc, 100);
    truncatedSpan.classList.add('short-form-truncated'); 
    card.appendChild(truncatedSpan);

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

    // +N more if needed
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
    card.appendChild(stackContainer);

    // Click => open modal
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


export function openProjectModal(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  console.log('Opening modal for project:', project); // Debug log

  if (!project) {
    console.error('Project not found:', projectId);
    return;
  }

  // Show the modal
  const modal = document.getElementById('projectModal');
  modal.style.display = 'block';

  // Title
  const modalTitle = document.getElementById('modalTitle');
  modalTitle.textContent = project.title;

  // Images / Carousel rendering
  const modalImages = document.getElementById('modalImages');
  modalImages.innerHTML = ''; // Clear previous content

  if (project.images && project.images.length > 0) {
    // Create carousel container without auto-ride attribute
    const carousel = document.createElement('div');
    carousel.id = 'projectImageCarousel';
    carousel.className = 'carousel slide';

    const carouselInner = document.createElement('div');
    carouselInner.className = 'carousel-inner';

    project.images.forEach((imgSrc, index) => {
      const carouselItem = document.createElement('div');
      carouselItem.classList.add('carousel-item');
      if (index === 0) carouselItem.classList.add('active');

      
      const img = document.createElement('img');
      const finalSrc = imgSrc.startsWith('rsc/') || imgSrc.startsWith('http')
      ? imgSrc 
      : imgSrc.includes('/')
      ? `rsc/images/${imgSrc}`
      : `rsc/images/recipes/${imgSrc}`; // Default to recipes subfolder
      
      // Instead of just <img ...>, do something like:
      const anchor = document.createElement('a');
      anchor.href = finalSrc;                // large/full-size image URL
      anchor.setAttribute('data-lightbox', 'carousel-images'); 
      anchor.appendChild(img);
      carouselItem.appendChild(anchor);

      console.log('Final image path:', finalSrc);
      img.src = finalSrc;
      img.classList.add('d-block', 'w-100');
      img.alt = `Project image ${index + 1}`;

      carouselInner.appendChild(carouselItem);
    });

    carousel.appendChild(carouselInner);

    // Create carousel controls
    const btnPrev = document.createElement('button');
    btnPrev.className = 'carousel-control-prev';
    btnPrev.setAttribute('type', 'button');
    btnPrev.setAttribute('data-bs-target', '#projectImageCarousel');
    btnPrev.setAttribute('data-bs-slide', 'prev');
    btnPrev.innerHTML = `
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    `;

    const btnNext = document.createElement('button');
    btnNext.className = 'carousel-control-next';
    btnNext.setAttribute('type', 'button');
    btnNext.setAttribute('data-bs-target', '#projectImageCarousel');
    btnNext.setAttribute('data-bs-slide', 'next');
    btnNext.innerHTML = `
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    `;

    carousel.appendChild(btnPrev);
    carousel.appendChild(btnNext);
    modalImages.appendChild(carousel);

    // Optionally fix the height so description is visible
    carousel.style.maxHeight = '375px';

    // Initialize Bootstrap carousel
    new bootstrap.Carousel(carousel, { interval: false, wrap: true });
  } else {
    // No images: render fallback placeholder without carousel
    const fallbackDiv = document.createElement('div');
    fallbackDiv.classList.add('fallback-placeholder'); // Use the CSS class for styling
    fallbackDiv.style.maxHeight = '400px';
    const img = document.createElement('img');
    img.src = getPlaceholderForStack(project);
    img.className = 'd-block w-100';
    img.alt = 'Project placeholder';

    fallbackDiv.appendChild(img);
    modalImages.appendChild(fallbackDiv);

  }

  // Stack
  const modalStack = document.getElementById('modalStack');
  modalStack.innerHTML = '';
  project.stack.forEach(tech => {
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


