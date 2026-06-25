const GALLERY_DATA_URL = 'data/3d-print-gallery.json';
const THREE_MODULE_URL = 'https://esm.sh/three@0.166.1';
const STL_LOADER_MODULE_URL = 'https://esm.sh/three@0.166.1/examples/jsm/loaders/STLLoader.js';

let galleryEntries = [];
let selectedEntry = null;
let selectedMediaIndex = 0;
let activePreviewCleanup = null;

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = String(value || '');
  return element.innerHTML;
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

function uniqueStrings(values) {
  const seen = new Set();
  return values
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .filter((value) => {
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
}

function extensionOf(value) {
  const path = String(value || '').split('?')[0].split('#')[0];
  const dotIndex = path.lastIndexOf('.');
  return dotIndex >= 0 ? path.slice(dotIndex + 1).toLowerCase() : '';
}

function isImage(value) {
  return ['avif', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'webp'].includes(extensionOf(value));
}

function isStl(value) {
  return extensionOf(value) === 'stl';
}

function absoluteUrl(value) {
  if (!value) return '';
  try {
    return new URL(value, window.location.href).toString();
  } catch {
    return '';
  }
}

function entryTitle(entry) {
  return entry.title || entry.name || 'Untitled print';
}

function entryMedia(entry) {
  const media = [];
  const modelCandidate = [entry.attachment, entry.modelUrl, entry.modelSourceUrl, entry.link].find(isStl);
  if (modelCandidate) {
    media.push({ type: 'stl', src: absoluteUrl(modelCandidate), label: 'STL preview' });
  }

  uniqueStrings([...toArray(entry.images), ...toArray(entry.image)])
    .filter(isImage)
    .forEach((image, index) => {
      media.push({ type: 'image', src: absoluteUrl(image), label: `Photo ${index + 1}` });
    });

  return media;
}

async function loadEntries() {
  const response = await fetch(GALLERY_DATA_URL, { cache: 'no-store' });
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload?.entries) ? payload.entries : Array.isArray(payload) ? payload : [];
}

function ensureDialog() {
  if (document.getElementById('printDetailDialog')) return;

  const dialog = document.createElement('dialog');
  dialog.id = 'printDetailDialog';
  dialog.className = 'print-detail-dialog';
  dialog.innerHTML = `
    <article class="print-detail-panel">
      <button class="print-detail-close" type="button" data-detail-close aria-label="Close print details">×</button>
      <div id="printDetailContent"></div>
    </article>
  `;
  document.body.appendChild(dialog);

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.closest('[data-detail-close]')) {
      closeDialog();
      return;
    }

    const action = event.target.closest('[data-detail-action]')?.dataset.detailAction;
    if (!action || !selectedEntry) return;
    const media = entryMedia(selectedEntry);
    if (!media.length) return;

    selectedMediaIndex = action === 'next'
      ? (selectedMediaIndex + 1) % media.length
      : (selectedMediaIndex - 1 + media.length) % media.length;
    renderDialog();
  });

  dialog.addEventListener('close', () => {
    cleanupPreview();
    selectedEntry = null;
    selectedMediaIndex = 0;
  });
}

function cleanupPreview() {
  if (!activePreviewCleanup) return;
  activePreviewCleanup();
  activePreviewCleanup = null;
}

function closeDialog() {
  const dialog = document.getElementById('printDetailDialog');
  if (dialog?.open) dialog.close();
}

async function renderStl(container, src) {
  cleanupPreview();
  container.innerHTML = '<p class="print-stl-loading">Loading STL preview…</p>';

  try {
    const [{ default: THREE }, { STLLoader }] = await Promise.all([
      import(THREE_MODULE_URL),
      import(STL_LOADER_MODULE_URL)
    ]);

    container.innerHTML = '';
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const light = new THREE.DirectionalLight(0xffffff, 1.25);
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    let frameId = 0;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);
    scene.add(light, ambient);
    light.position.set(2, 3, 4);

    function resize() {
      const width = container.clientWidth || 720;
      const height = container.clientHeight || 420;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    window.addEventListener('resize', resize);
    activePreviewCleanup = () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      renderer.domElement.remove();
    };

    new STLLoader().load(src, (geometry) => {
      geometry.computeBoundingBox();
      geometry.computeVertexNormals();
      const box = geometry.boundingBox;
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);
      geometry.translate(-center.x, -center.y, -center.z);

      const maxSize = Math.max(size.x, size.y, size.z) || 1;
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ color: 0x8b72d9, metalness: 0.08, roughness: 0.68 })
      );
      scene.add(mesh);
      camera.position.set(maxSize * 1.25, maxSize * 1.1, maxSize * 1.75);
      camera.lookAt(0, 0, 0);
      resize();

      function animate() {
        mesh.rotation.x = -0.55;
        mesh.rotation.z += 0.006;
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      }
      animate();
    }, undefined, () => {
      container.innerHTML = `<div class="print-stl-fallback"><p>STL preview failed.</p><a href="${escapeHtml(src)}">Open STL file</a></div>`;
    });
  } catch {
    container.innerHTML = `<div class="print-stl-fallback"><p>STL preview is unavailable in this browser.</p><a href="${escapeHtml(src)}">Open STL file</a></div>`;
  }
}

function renderDialog() {
  const content = document.getElementById('printDetailContent');
  if (!content || !selectedEntry) return;

  cleanupPreview();
  const title = entryTitle(selectedEntry);
  const media = entryMedia(selectedEntry);
  selectedMediaIndex = Math.min(Math.max(selectedMediaIndex, 0), Math.max(media.length - 1, 0));
  const active = media[selectedMediaIndex];

  content.innerHTML = `
    <div class="print-detail-layout">
      <section>
        <div class="print-detail-media" id="printDetailMedia">
          ${active?.type === 'image'
            ? `<img src="${escapeHtml(active.src)}" alt="${escapeHtml(title)}">`
            : '<div class="print-stl-preview" data-stl-preview></div>'}
        </div>
        ${media.length > 1 ? `<div class="print-detail-carousel-controls"><button class="print-page-btn" type="button" data-detail-action="prev">Previous</button><span>${selectedMediaIndex + 1} of ${media.length}</span><button class="print-page-btn" type="button" data-detail-action="next">Next</button></div>` : ''}
      </section>
      <section class="print-detail-copy">
        <p class="eyebrow">Selected print</p>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(selectedEntry.longDescription || selectedEntry.description || selectedEntry.shortDescription || 'No description recorded yet.')}</p>
        <div class="print-card-specs">
          <div><span class="print-card-meta-label">Material</span><strong>${escapeHtml(selectedEntry.material || 'Not recorded')}</strong></div>
          <div><span class="print-card-meta-label">Printer</span><strong>${escapeHtml(selectedEntry.printer || 'Not recorded')}</strong></div>
          <div><span class="print-card-meta-label">Nozzle</span><strong>${escapeHtml(selectedEntry.nozzle || 'Not recorded')}</strong></div>
          <div><span class="print-card-meta-label">Layer height</span><strong>${escapeHtml(selectedEntry.layerHeight || 'Not recorded')}</strong></div>
        </div>
        <p class="print-card-notes"><span class="print-card-meta-label">Notes:</span> ${escapeHtml(selectedEntry.notes || 'No notes recorded yet.')}</p>
      </section>
    </div>
  `;

  if (active?.type === 'stl') {
    const preview = content.querySelector('[data-stl-preview]');
    if (preview) renderStl(preview, active.src);
  }
}

function openEntryDetails(id) {
  selectedEntry = galleryEntries.find((entry) => String(entry.id) === String(id));
  if (!selectedEntry) return;
  selectedMediaIndex = 0;
  ensureDialog();
  renderDialog();
  const dialog = document.getElementById('printDetailDialog');
  if (dialog && !dialog.open) dialog.showModal();
}

function enhanceCards() {
  document.querySelectorAll('.print-card[data-print-id]').forEach((card) => {
    if (card.querySelector('[data-gallery-detail-id]')) return;
    const id = card.getAttribute('data-print-id');
    const entry = galleryEntries.find((item) => String(item.id) === String(id));
    if (!entry) return;
    const mediaCount = entryMedia(entry).length;
    const footer = card.querySelector('.print-card-footer');
    if (!footer) return;

    const button = document.createElement('button');
    button.className = 'print-page-btn';
    button.type = 'button';
    button.dataset.galleryDetailId = id;
    button.textContent = mediaCount > 1 ? `View details (${mediaCount} media)` : 'View details';
    footer.insertBefore(button, footer.querySelector('[data-printdesk-request-id]'));
  });
}

async function initDetailEnhancement() {
  try {
    galleryEntries = await loadEntries();
  } catch (error) {
    console.warn('Gallery detail enhancement could not load entries.', error);
    return;
  }

  enhanceCards();
  new MutationObserver(enhanceCards).observe(document.getElementById('printGalleryGrid'), { childList: true });

  document.body.addEventListener('click', (event) => {
    const button = event.target.closest('[data-gallery-detail-id]');
    if (!button) return;
    openEntryDetails(button.dataset.galleryDetailId);
  });
}

document.addEventListener('DOMContentLoaded', initDetailEnhancement);
