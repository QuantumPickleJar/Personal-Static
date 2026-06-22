const WIZARD_TOKEN_STORAGE_KEY = 'printGalleryGithubToken';
const GITHUB_API_BASE = 'https://api.github.com';
const PLACEHOLDER_IMAGE = 'assets/images/prints/placeholder.svg';

const sourceTypeLabels = {
  designed: 'Designed by me',
  remixed: 'Remixed/customized by me',
  printed: 'Printed by me / model by another maker'
};

let activeStep = 0;
let lastFocusedElement = null;
let currentPreviewUrl = '';

function byId(id) {
  return document.getElementById(id);
}

function normalizeText(value) {
  return String(value || '').trim();
}

function splitList(value) {
  return normalizeText(value)
    .split(',')
    .map(function(item) { return item.trim(); })
    .filter(Boolean);
}

function slugify(value) {
  return normalizeText(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'new-print-entry';
}

function getWizardConfig() {
  const wizard = byId('printEntryWizard');
  const branchInput = byId('printTargetBranch');

  return {
    repo: wizard.dataset.galleryRepo,
    branch: normalizeText(branchInput ? branchInput.value : wizard.dataset.galleryBranch) || wizard.dataset.galleryBranch || 'main',
    dataFile: wizard.dataset.galleryDataFile || 'rsc/js/print-gallery.js',
    imageDir: wizard.dataset.galleryImageDir || 'assets/images/prints'
  };
}

function setStatus(message, type) {
  const status = byId('printWizardStatus');
  if (!status) return;

  status.textContent = message || '';
  status.classList.toggle('is-error', type === 'error');
  status.classList.toggle('is-success', type === 'success');
}

function loadStoredToken() {
  const tokenInput = byId('printGithubToken');
  if (!tokenInput) return;

  const savedToken = sessionStorage.getItem(WIZARD_TOKEN_STORAGE_KEY);
  if (savedToken) {
    tokenInput.value = savedToken;
  }
}

function persistTokenForSession() {
  const tokenInput = byId('printGithubToken');
  const rememberInput = byId('printRememberToken');
  if (!tokenInput) return;

  if (rememberInput && rememberInput.checked && tokenInput.value.trim()) {
    sessionStorage.setItem(WIZARD_TOKEN_STORAGE_KEY, tokenInput.value.trim());
  } else {
    sessionStorage.removeItem(WIZARD_TOKEN_STORAGE_KEY);
  }
}

function clearStoredToken() {
  const tokenInput = byId('printGithubToken');
  sessionStorage.removeItem(WIZARD_TOKEN_STORAGE_KEY);
  if (tokenInput) {
    tokenInput.value = '';
    tokenInput.focus();
  }
  setStatus('Saved token cleared for this tab.', 'success');
}

function getGithubToken() {
  const tokenInput = byId('printGithubToken');
  return tokenInput ? tokenInput.value.trim() : '';
}

function setActiveStep(nextStep) {
  const steps = Array.from(document.querySelectorAll('.print-wizard-step'));
  const indicators = Array.from(document.querySelectorAll('[data-step-indicator]'));
  const previousButton = byId('printWizardPrevious');
  const nextButton = byId('printWizardNext');
  const commitButton = byId('printCommitEntry');
  const copyButton = byId('printCopyGeneratedEntry');

  activeStep = Math.min(Math.max(nextStep, 0), steps.length - 1);

  steps.forEach(function(step, index) {
    step.hidden = index !== activeStep;
  });

  indicators.forEach(function(indicator, index) {
    indicator.classList.toggle('is-active', index === activeStep);
  });

  if (previousButton) previousButton.hidden = activeStep === 0;
  if (nextButton) nextButton.hidden = activeStep === steps.length - 1;
  if (commitButton) commitButton.hidden = activeStep !== steps.length - 1;
  if (copyButton) copyButton.hidden = activeStep !== steps.length - 1;

  if (activeStep === steps.length - 1) {
    renderReview();
  }
}

function validateCurrentStep() {
  if (activeStep === 0) {
    const token = getGithubToken();
    const branch = normalizeText(byId('printTargetBranch')?.value);

    if (!token) {
      setStatus('Enter a GitHub token before continuing.', 'error');
      byId('printGithubToken')?.focus();
      return false;
    }

    if (!branch) {
      setStatus('Enter the branch that should receive the gallery update.', 'error');
      byId('printTargetBranch')?.focus();
      return false;
    }

    persistTokenForSession();
  }

  if (activeStep === 1) {
    const requiredFields = [
      ['printEntryTitle', 'Enter a title for the print.'],
      ['printDescription', 'Enter a short description for the print.'],
      ['printAlt', 'Enter alt text for the print photo.']
    ];

    for (const [fieldId, message] of requiredFields) {
      const field = byId(fieldId);
      if (!normalizeText(field?.value)) {
        setStatus(message, 'error');
        field?.focus();
        return false;
      }
    }
  }

  setStatus('');
  return true;
}

function getSelectedFilters(sourceType) {
  const selected = Array.from(document.querySelectorAll('input[name="printFilters"]:checked'))
    .map(function(input) { return input.value; });

  if (sourceType === 'designed' && !selected.includes('designed-by-me')) {
    selected.unshift('designed-by-me');
  }

  if (sourceType === 'printed' && !selected.includes('printed-by-me')) {
    selected.unshift('printed-by-me');
  }

  if (sourceType === 'remixed' && !selected.includes('remixed')) {
    selected.unshift('remixed');
  }

  return selected;
}

function getUploadedImagePath(entryId) {
  const fileInput = byId('printImageFile');
  const file = fileInput && fileInput.files.length ? fileInput.files[0] : null;

  if (!file) {
    return PLACEHOLDER_IMAGE;
  }

  const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const config = getWizardConfig();
  return `${config.imageDir}/${entryId}.${extension}`;
}

function collectEntry() {
  const title = normalizeText(byId('printEntryTitle')?.value);
  const entryId = slugify(byId('printEntryId')?.value || title);
  const sourceType = normalizeText(byId('printSourceType')?.value) || 'printed';
  const categories = splitList(byId('printCategories')?.value);
  const tags = splitList(byId('printTags')?.value);
  const colors = splitList(byId('printColors')?.value);
  const filters = getSelectedFilters(sourceType);

  return {
    id: entryId,
    title,
    description: normalizeText(byId('printDescription')?.value),
    categories: categories.length ? categories : ['3D Printing'],
    sourceType,
    material: normalizeText(byId('printMaterial')?.value) || 'Not recorded',
    colors: colors.length ? colors : ['Not recorded'],
    nozzle: normalizeText(byId('printNozzle')?.value) || 'Not recorded',
    layerHeight: normalizeText(byId('printLayerHeight')?.value) || 'Not recorded',
    modelOrigin: normalizeText(byId('printModelOrigin')?.value) || 'Not recorded',
    tags: tags.length ? tags : [entryId],
    image: getUploadedImagePath(entryId),
    alt: normalizeText(byId('printAlt')?.value) || title,
    link: normalizeText(byId('printLink')?.value),
    notes: normalizeText(byId('printNotes')?.value) || 'Add notes about settings, tuning, fit, materials, or troubleshooting.',
    filters
  };
}

function formatEntryObject(entry) {
  return JSON.stringify(entry, null, 2);
}

function renderReview() {
  const entry = collectEntry();
  const generatedEntry = byId('printGeneratedEntry');
  const reviewTitle = byId('printReviewTitle');
  const reviewDescription = byId('printReviewDescription');
  const reviewImage = byId('printReviewImage');
  const fileInput = byId('printImageFile');
  const file = fileInput && fileInput.files.length ? fileInput.files[0] : null;

  if (generatedEntry) {
    generatedEntry.textContent = formatEntryObject(entry);
  }

  if (reviewTitle) {
    reviewTitle.textContent = entry.title || 'Entry preview';
  }

  if (reviewDescription) {
    const sourceLabel = sourceTypeLabels[entry.sourceType] || 'Source not recorded';
    reviewDescription.textContent = `${sourceLabel}. ${entry.description || 'No description entered yet.'}`;
  }

  if (reviewImage) {
    if (currentPreviewUrl) {
      URL.revokeObjectURL(currentPreviewUrl);
      currentPreviewUrl = '';
    }

    if (file) {
      currentPreviewUrl = URL.createObjectURL(file);
      reviewImage.src = currentPreviewUrl;
    } else {
      reviewImage.src = PLACEHOLDER_IMAGE;
    }

    reviewImage.alt = entry.alt || 'Generated gallery entry preview image';
  }
}

async function copyGeneratedEntry() {
  const entry = collectEntry();
  const text = formatEntryObject(entry);

  try {
    await navigator.clipboard.writeText(text);
    setStatus('Generated entry copied to clipboard.', 'success');
  } catch (error) {
    setStatus('Could not copy automatically. Select the generated text and copy it manually.', 'error');
  }
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

async function githubRequest(config, path, options = {}) {
  const token = getGithubToken();
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    ...(options.headers || {})
  };

  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    ...options,
    headers
  });

  const responseText = await response.text();
  let payload = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch (error) {
      payload = { message: responseText };
    }
  }

  if (!response.ok) {
    const message = payload?.message || `GitHub API request failed with ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

function decodeBase64Text(content) {
  const cleanContent = String(content || '').replace(/\s/g, '');
  const binary = atob(cleanContent);
  const bytes = Uint8Array.from(binary, function(char) { return char.charCodeAt(0); });
  return new TextDecoder().decode(bytes);
}

function encodeBase64Text(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }

  return btoa(binary);
}

function readFileAsBase64(file) {
  return new Promise(function(resolve, reject) {
    const reader = new FileReader();
    reader.onload = function() {
      const result = String(reader.result || '');
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = function() {
      reject(new Error('Could not read the selected image file.'));
    };
    reader.readAsDataURL(file);
  });
}

function insertEntryIntoGallerySource(source, entry) {
  const marker = 'const printGalleryItems = [';
  const markerIndex = source.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error('Could not find printGalleryItems in rsc/js/print-gallery.js.');
  }

  const duplicatePatterns = [
    `id: '${entry.id}'`,
    `id: "${entry.id}"`,
    `"id": "${entry.id}"`
  ];

  if (duplicatePatterns.some(function(pattern) { return source.includes(pattern); })) {
    throw new Error(`A gallery entry with id "${entry.id}" already exists. Change the slug before committing.`);
  }

  const insertIndex = markerIndex + marker.length;
  const formattedEntry = formatEntryObject(entry)
    .split('\n')
    .map(function(line) { return `  ${line}`; })
    .join('\n');

  return `${source.slice(0, insertIndex)}\n${formattedEntry},${source.slice(insertIndex)}`;
}

async function putGitHubFile(config, path, contentBase64, message, sha) {
  const body = {
    message,
    content: contentBase64,
    branch: config.branch
  };

  if (sha) {
    body.sha = sha;
  }

  return githubRequest(config, `/repos/${config.repo}/contents/${encodePath(path)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function uploadImageIfNeeded(config, entry) {
  const fileInput = byId('printImageFile');
  const file = fileInput && fileInput.files.length ? fileInput.files[0] : null;

  if (!file) {
    return false;
  }

  const imageContent = await readFileAsBase64(file);
  await putGitHubFile(
    config,
    entry.image,
    imageContent,
    `Add print gallery image: ${entry.title}`
  );

  return true;
}

async function appendEntryToGallery(config, entry) {
  const contentsPath = `/repos/${config.repo}/contents/${encodePath(config.dataFile)}?ref=${encodeURIComponent(config.branch)}`;
  const dataFile = await githubRequest(config, contentsPath);
  const currentSource = decodeBase64Text(dataFile.content);
  const updatedSource = insertEntryIntoGallerySource(currentSource, entry);

  await putGitHubFile(
    config,
    config.dataFile,
    encodeBase64Text(updatedSource),
    `Add 3D print gallery entry: ${entry.title}`,
    dataFile.sha
  );
}

async function commitEntryToGitHub() {
  if (!validateCurrentStep()) {
    return;
  }

  const config = getWizardConfig();
  const entry = collectEntry();
  const commitButton = byId('printCommitEntry');

  if (!getGithubToken()) {
    setStatus('Enter a GitHub token before committing.', 'error');
    return;
  }

  persistTokenForSession();
  setStatus('Uploading entry to GitHub...');

  if (commitButton) {
    commitButton.disabled = true;
  }

  try {
    await uploadImageIfNeeded(config, entry);
    await appendEntryToGallery(config, entry);
    setStatus(`Committed "${entry.title}" to ${config.repo} on ${config.branch}. Refresh after GitHub Pages rebuilds.`, 'success');
  } catch (error) {
    setStatus(error.message || 'Could not commit the gallery entry.', 'error');
  } finally {
    if (commitButton) {
      commitButton.disabled = false;
    }
  }
}

function openWizard() {
  const wizard = byId('printEntryWizard');
  const panel = wizard?.querySelector('.print-wizard-panel');

  if (!wizard || !panel) return;

  lastFocusedElement = document.activeElement;
  wizard.hidden = false;
  document.body.classList.add('print-wizard-open');
  loadStoredToken();
  setActiveStep(0);
  setStatus('');
  panel.focus();
}

function closeWizard() {
  const wizard = byId('printEntryWizard');
  if (!wizard) return;

  wizard.hidden = true;
  document.body.classList.remove('print-wizard-open');

  if (currentPreviewUrl) {
    URL.revokeObjectURL(currentPreviewUrl);
    currentPreviewUrl = '';
  }

  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

function handleTitleInput() {
  const titleInput = byId('printEntryTitle');
  const idInput = byId('printEntryId');
  if (!titleInput || !idInput || idInput.dataset.userEdited === 'true') return;

  idInput.value = slugify(titleInput.value);
}

function markSlugUserEdited() {
  const idInput = byId('printEntryId');
  if (idInput) {
    idInput.dataset.userEdited = 'true';
  }
}

function handleSourceTypeChange() {
  const sourceType = byId('printSourceType')?.value;
  const designedFilter = document.querySelector('input[name="printFilters"][value="designed-by-me"]');
  const printedFilter = document.querySelector('input[name="printFilters"][value="printed-by-me"]');

  if (designedFilter) designedFilter.checked = sourceType === 'designed';
  if (printedFilter) printedFilter.checked = sourceType === 'printed';
}

function initPrintGalleryAdmin() {
  const openButton = byId('printOpenWizard');
  const closeButton = byId('printWizardClose');
  const previousButton = byId('printWizardPrevious');
  const nextButton = byId('printWizardNext');
  const commitButton = byId('printCommitEntry');
  const copyButton = byId('printCopyGeneratedEntry');
  const clearTokenButton = byId('printClearToken');
  const titleInput = byId('printEntryTitle');
  const idInput = byId('printEntryId');
  const sourceTypeSelect = byId('printSourceType');
  const imageInput = byId('printImageFile');

  if (!openButton || !byId('printEntryWizard')) {
    return;
  }

  openButton.addEventListener('click', openWizard);
  closeButton?.addEventListener('click', closeWizard);
  clearTokenButton?.addEventListener('click', clearStoredToken);
  copyButton?.addEventListener('click', copyGeneratedEntry);
  commitButton?.addEventListener('click', commitEntryToGitHub);
  titleInput?.addEventListener('input', handleTitleInput);
  idInput?.addEventListener('input', markSlugUserEdited);
  sourceTypeSelect?.addEventListener('change', handleSourceTypeChange);
  imageInput?.addEventListener('change', function() {
    if (activeStep === 2) {
      renderReview();
    }
  });

  document.querySelectorAll('[data-close-print-wizard]').forEach(function(element) {
    element.addEventListener('click', closeWizard);
  });

  previousButton?.addEventListener('click', function() {
    setActiveStep(activeStep - 1);
  });

  nextButton?.addEventListener('click', function() {
    if (validateCurrentStep()) {
      setActiveStep(activeStep + 1);
    }
  });

  document.addEventListener('keydown', function(event) {
    const wizard = byId('printEntryWizard');
    if (event.key === 'Escape' && wizard && !wizard.hidden) {
      closeWizard();
    }
  });

  handleSourceTypeChange();
  setActiveStep(0);
}

document.addEventListener('DOMContentLoaded', initPrintGalleryAdmin);
