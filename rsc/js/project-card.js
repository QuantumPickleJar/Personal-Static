/**
 * @file project-card.js
 * @description Handles the creation and management of project cards in the gallery
 */

import { getPlaceholderForStack } from './placeholderBuilder.js';
import { renderOneStackIcon } from './stackIconLoader.js';
import { openProjectModal } from './project-modal.js';
import { setupBadges, setupStackIcons } from './placeholderBuilder.js';

const MAX_STACK_CHARS = 20; // Maximum characters in stack display before showing "more" link

/**
 * Creates a project card element from a template clone
 * @param {Object} project - The project data
 * @returns {Element} - The HTML element for the project card
 */
export function createProjectCard(project) {
  const template = document.getElementById("projectCardTemplate");
  if (!template) {
    console.error("Project card template not found");
    return document.createElement("div");
  }

  const clone = template.content.cloneNode(true);
  const card = clone.querySelector(".project-card");

  // Set project ID
  card.dataset.projectId = project.id;

  // Set project title
  const titleElement = clone.querySelector(".project-title");
  titleElement.textContent = project.title;

  // Set academic or personal label based on project type
  const academicLabel = clone.querySelector(".academic-label");

  if (project.academic) {
    academicLabel.textContent = "Academic";
    academicLabel.className = "project-type-label academic-label";
    academicLabel.style.display = "inline-block";

    if (project.dates) {
      academicLabel.setAttribute("data-dates", project.dates);

      const tooltip = document.createElement("span");
      tooltip.className = "date-tooltip";
      tooltip.textContent = project.dates;
      academicLabel.appendChild(tooltip);
    }
  } else {
    academicLabel.textContent = "Personal";
    academicLabel.classList.remove("academic");
    academicLabel.className = "project-type-label personal-label";
    academicLabel.style.display = "inline-block";

    if (project.dates) {
      academicLabel.setAttribute("data-dates", project.dates);

      const tooltip = document.createElement("span");
      tooltip.className = "date-tooltip";
      tooltip.textContent = project.dates;
      academicLabel.appendChild(tooltip);
    }
  }

  // Set the short form description
  const shortFormElement = clone.querySelector(".short-form-truncated");
  if (shortFormElement) {
    shortFormElement.textContent = project.shortForm || "";
  }

  // Handle date label if present
  const dateLabel = clone.querySelector(".date-label");
  if (dateLabel) {
    dateLabel.textContent = project.dates || "";
    dateLabel.setAttribute('data-tooltip', project.dates || "");
  }

  // Stack icons
  const stackIcons = clone.querySelector(".stack-icons");
  if (stackIcons && Array.isArray(project.stack)) {
    stackIcons.innerHTML = "";
    setupStackIcons(stackIcons, project.stack);
  }

  // Images badge
  const imageIcon = clone.querySelector(".image-count-icon");
  if (project.images && project.images.length > 0 && imageIcon) {
    imageIcon.style.display = "flex";
    imageIcon.querySelector(".count").textContent = project.images.length;
  }

  // Mermaid badge
  const mermaidIcon = clone.querySelector(".mermaid-icon");
  if (mermaidIcon && project.mermaid && project.mermaid.trim()) {
    mermaidIcon.style.display = "block";
  }

  // make just the corner of the card clickable, not the entire card
  const viewButton = card.querySelector('.open-modal-btn');
  viewButton.style.cursor = "pointer";
  viewButton.addEventListener('click', () => {
    openProjectModal(project);
  });

  const modalButton = clone.querySelector(".open-modal-btn");
  if (modalButton) {
    modalButton.style.cursor = "pointer";
    modalButton.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log('Button clicked for project:', project.id);
      openProjectModal(project.id);
    });
  }

  return card;
}

/**
 * Renders the projects gallery
 * @param {Array} projects - Array of project data
 */
export function renderProjectsGallery(projects) {
  const gallery = document.getElementById("projectsGallery");
  if (!gallery) {
    console.error("Projects gallery element not found");
    return;
  }

  gallery.innerHTML = ""; // Clear existing content

  projects.forEach(project => {
    const card = createProjectCard(project);
    gallery.appendChild(card);
  });
}

/**
 * Expands the stack icons when the "more" link is clicked
 * @param {HTMLElement} container - The container with stack icons
 * @param {Array} stackArray - The full array of stack technologies
 * @param {number} max - The current number of visible items
 * @param {HTMLElement} linkElement - The "more" link element to remove
 */
function expandStack(container, stackArray, max, linkElement) {
  container.removeChild(linkElement);
  stackArray.slice(max).forEach(tech => {
    const techSpan = document.createElement('span');
    techSpan.classList.add('stack-icon');
    techSpan.textContent = tech;
    container.appendChild(techSpan);
  });

  // Find the parent project card
  const projectCard = container.closest('.project-card');
  if (projectCard) {
    // Find the academic label within this card
    const academicLabel = projectCard.querySelector('.academic-label');
    if (academicLabel) {
      // Toggle visibility
      if (academicLabel.style.display === 'none') {
        academicLabel.style.display = '';
      } else {
        academicLabel.style.display = 'none';
      }
    }
  }
}

/**
 * Creates a date tooltip HTML
 * @param {Object|string} dates - The dates object or string
 * @returns {string} - HTML for the tooltip
 */
export function buildDateTooltip(dates) {
  if (!dates) {
    return "No date info available.";
  }

  // Handle if dates is a string
  if (typeof dates === 'string') {
    return dates;
  }

  // Fallback to "N/A" if any field is missing/blank
  const started = dates.started || "N/A";
  const modified = dates.modified || "N/A";
  // Some projects use "released" instead of "completed" – adapt as needed
  const completed = dates.completed || dates.released || "N/A";

  // For multiline in HTML, use <br>, or do a small template with divs
  return `
    <div>
      <strong>Started:</strong> ${started}<br>
      <strong>Modified:</strong> ${modified}<br>
      <strong>Completed:</strong> ${completed}
    </div>
  `;
}

/**
 * Determines which stack items should be visible based on character count
 * @param {Array} stackArray - Array of stack technology names
 * @returns {Object} - Object with visible items and count of remaining items
 */
function getVisibleStackItems(stackArray) {
  let charCount = 0;
  let visibleItems = [];

  for (const tech of stackArray) {
    if (charCount + tech.length <= MAX_STACK_CHARS) {
      charCount += tech.length;
      visibleItems.push(tech);
    } else {
      break;
    }
  }

  return {
    items: visibleItems,
    remaining: stackArray.length - visibleItems.length
  };
}

/**
 * Sets up tooltip events for an element
 * @param {HTMLElement} element - The element to add tooltips to
 * @param {string} tooltipText - The text to display in the tooltip
 */
export function setupTooltipEvents(element, tooltipText = null) {
  if (!element) return;
  
  element.addEventListener('mouseover', () => {
    let tooltip = element.querySelector('.tooltip-date');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'tooltip-date';
      tooltip.innerHTML = `<span style="color:white; display:inline-block;">${tooltipText || element.dataset.tooltip}</span>`;
      tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      tooltip.style.padding = '5px 8px';
      tooltip.style.zIndex = '100';
      element.appendChild(tooltip);
      void tooltip.offsetWidth;
    }
    tooltip.classList.add('visible');
  });
  
  element.addEventListener('mouseout', () => {
    const tooltip = element.querySelector('.tooltip-date');
    if (tooltip) {
      tooltip.classList.remove('visible');
    }
  });
}