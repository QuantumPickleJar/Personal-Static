import * as bootstrap from 'bootstrap';
import { initPagination } from './pagination.js';
import { filterProjByTitle, filterByDate } from './gallery-sorting.js';
import { filterProjectsBySearchTerm } from './search.js';
import { projectsPerPage } from './perPageSettings.js';
import { openProjectModal, closeModal, loadProjectModal } from './project-modal.js';
import { setupModalToggleFABs, initializeFABs } from './project-fab.js';
import { createProjectCard, renderProjectsGallery } from './project-card.js';
import { showImagesInModal, showMermaidDiagramInModal } from './project-image-display.js';

export let allProjects = [];
const MAX_STACK_CHARS = 20;

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('projectsGallery')) {
    console.log('Projects gallery found, initializing projects');
    initializeProjects();

    const urlParams = new URLSearchParams(window.location.search);
    const projectToShow = urlParams.get('showProject');
    if (projectToShow) {
      setTimeout(() => {
        const project = allProjects.find(p => p.id === projectToShow);
        if (project) {
          openProjectModal(project);
        } else {
          console.error(`Project with ID "${projectToShow}" not found.`);
        }
      }, 500);
    }
  } else {
    console.log('No projects gallery found, skipping initialization');
  }
});

export function loadProjects() {
  console.log('Loading projects...');
  const basePath = window.location.hostname.includes('github.io') ? '/Personal-Static/' : '/';
  const pathsToTry = [
    `${basePath}rsc/json/projects.json`,
    './rsc/json/projects.json',
    '/rsc/json/projects.json',
    'rsc/json/projects.json',
  ];

  return tryFetchPaths(pathsToTry)
    .then((data) => {
      console.log(`Projects data received: ${data.length} items`);
      allProjects = data;
      return data;
    })
    .catch((error) => {
      console.error('Project loading error:', error);
      const gallery = document.getElementById('projectsGallery');
      if (gallery) {
        gallery.innerHTML = `<div class="error">Failed to load projects: ${error.message}</div>`;
      }
      return [];
    });
}

async function tryFetchPaths(paths) {
  for (const path of paths) {
    try {
      console.log(`Trying to fetch from: ${path}`);
      const response = await fetch(path);
      if (response.ok) {
        console.log(`Successfully loaded from: ${path}`);
        return response.json();
      }
    } catch (e) {
      console.log(`Failed attempt with path: ${path}`);
    }
  }
  throw new Error('All paths failed');
}

function initializeProjects() {
  loadTemplates()
    .then(() => loadProjects())
    .then(renderProjectsGallery)
    .then(() => console.log('Projects loaded and rendered'))
    .catch((error) => console.error('Failed to initialize projects:', error));

  const closeModalButton = document.getElementById('closeModal');
  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModal);
  }

  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}

function loadTemplates() {
  const basePath = window.location.hostname.includes('github.io') ? '/Personal-Static/' : '/';
  const templatesNeeded = [
    { path: `${basePath}htmlModules/project-card.html`, id: 'templateContainer-projectCard' },
    { path: `${basePath}htmlModules/stack-item-template.html`, id: 'templateContainer-stackItems' },
  ];

  const promises = templatesNeeded.map((template) =>
    fetch(template.path)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load template: ${template.path}`);
        return response.text();
      })
      .then((html) => {
        const container = document.createElement('div');
        container.id = template.id;
        container.style.display = 'none';
        container.innerHTML = html;
        document.body.appendChild(container);
        console.log(`Loaded template: ${template.path}`);
      })
  );

  return Promise.all(promises);
}

export { renderProjectsGallery };


