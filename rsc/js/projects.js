import*as bootstrap from"bootstrap";import{initPagination}from"./pagination.js";import{getPlaceholderForStack}from"./placeholderBuilder.js";import{filterProjByTitle,filterByDate,createTruncatedSpan}from"./gallery-sorting.js";import{getIcon,renderOneStackIcon}from"./stackIconLoader.js";import{filterProjectsBySearchTerm}from"./search.js";import{projectsPerPage}from"./perPageSettings.js";import{parseMermaidCode}from"./json-parser.js";import panzoom from"panzoom";import mermaid from"mermaid";window.mermaid=mermaid;export let allProjects=[];const MAX_STACK_CHARS=20;mermaid.initialize({startOnLoad:!1});export function loadProjects(){fetch("rsc/json/projects.json").then((e=>e.json())).then((e=>{allProjects=e,console.log("Projects loaded:",allProjects),initPagination(allProjects,projectsPerPage);const t=document.getElementById("loadingOverlay");t&&(t.style.display="none");const a=document.querySelector("#searchBar");a&&a.addEventListener("input",(()=>{const e=a.value.trim(),t=filterProjectsBySearchTerm(allProjects,e);initPagination(t,projectsPerPage)}))})).catch((e=>console.error("Failed to load projects:",e)))}export function renderProjectsGallery(e){console.log("Rendering projects:",e);const t=document.getElementById("projectsGallery");t.innerHTML="",e.forEach((e=>{const a=document.createElement("div");a.classList.add("project-card"),a.dataset.projectId=e.id,a.style.position="relative";const n=document.createElement("img");n.classList.add("project-thumbnail"),n.src=e.thumbnail||"images/placeholder.jpg",n.alt=e.title,a.appendChild(n);const s=document.createElement("div");s.classList.add("label-row"),a.appendChild(s);const o=document.createElement("span");o.classList.add("date-label");const i=e.date||e.dates||"No date";o.textContent=i,o.dataset.tooltip=i,o.addEventListener("mouseover",(e=>{let t=o.querySelector(".tooltip-date");t||(t=document.createElement("div"),t.className="tooltip-date",t.innerHTML=`<span style="color:white; display:inline-block;">${i}</span>`,t.style.backgroundColor="rgba(0, 0, 0, 0.8)",t.style.padding="5px 8px",t.style.zIndex="100",o.appendChild(t),t.offsetWidth),t.classList.add("visible")})),o.addEventListener("mouseout",(()=>{const e=o.querySelector(".tooltip-date");e&&e.classList.remove("visible")})),s.appendChild(o);const d=document.createElement("span");if(d.classList.add("academic-label"),d.textContent=e.academic?"Academic":"Personal",e.academic?d.classList.add("academic"):d.classList.add("personal"),a.appendChild(d),d.addEventListener("mouseover",(e=>{let t=d.querySelector(".tooltip-date");t||(t=document.createElement("div"),t.className="tooltip-date",t.innerHTML=`<span style="color:white; display:inline-block;">${i}</span>`,t.style.backgroundColor="rgba(0, 0, 0, 0.8)",t.style.padding="5px 8px",t.style.zIndex="100",d.appendChild(t),t.offsetWidth),t.classList.add("visible")})),d.addEventListener("mouseout",(()=>{const e=d.querySelector(".tooltip-date");e&&e.classList.remove("visible")})),e.images&&e.images.length>1){const t=document.createElement("div");t.classList.add("image-count-icon"),t.innerHTML=`<span class="icon">&#128247;</span><span class="count">${e.images.length}</span>`,a.appendChild(t)}if(e.mermaid&&e.mermaid.trim()){const e=document.createElement("div");e.classList.add("mermaid-icon"),e.innerHTML='<img src="./rsc/images/stack/MermaidJS.png" alt="Has Mermaid Diagram" />',a.appendChild(e)}const l=document.createElement("div");l.classList.add("project-title"),l.textContent=e.title,a.appendChild(l);const r=e.shortForm||e.description||"",c=createTruncatedSpan(r,100);c.classList.add("short-form-truncated"),a.appendChild(c);const m=document.createElement("div");m.classList.add("stack-icons");const{items:p,remaining:u}=getVisibleStackItems(e.stack);if(p.forEach((e=>{const t=document.createElement("span");t.classList.add("stack-icon"),t.textContent=e,m.appendChild(t)})),u>0){const t=document.createElement("span");t.classList.add("more-link"),t.textContent=`+${u} more`,t.addEventListener("click",(a=>{a.stopPropagation(),expandStack(m,e.stack,p.length,t)})),m.appendChild(t)}if(a.appendChild(m),e.images&&e.images.length>1||e.mermaid&&e.mermaid.trim()){const t=document.createElement("div");if(t.classList.add("badge-container"),e.images&&e.images.length>1){const a=document.createElement("div");a.classList.add("image-count-icon"),a.innerHTML=`<span class="icon">&#128247;</span><span class="count">${e.images.length}</span>`,t.appendChild(a)}if(e.mermaid&&e.mermaid.trim()){const e=document.createElement("div");e.classList.add("mermaid-icon"),e.innerHTML='<img src="./rsc/images/stack/MermaidJS.png" alt="Has Mermaid Diagram" />',t.appendChild(e)}a.appendChild(t)}a.addEventListener("click",(()=>{openProjectModal(e.id)})),t.appendChild(a)}))}function buildDateTooltip(e){return e?`\n    <div>\n      <strong>Started:</strong> ${e.started||"N/A"}<br>\n      <strong>Modified:</strong> ${e.modified||"N/A"}<br>\n      <strong>Completed:</strong> ${e.completed||e.released||"N/A"}\n    </div>\n  `:"No date info available."}function expandStack(e,t,a,n){e.removeChild(n),t.slice(a).forEach((t=>{const a=document.createElement("span");a.classList.add("stack-icon"),a.textContent=t,e.appendChild(a)}))}function showImagesInModal(e){const t=document.getElementById("modalImages");if(t.innerHTML="",t.classList.remove("mermaid-view"),t.classList.add("images-view"),t.style.maxHeight="",t.style.overflow="",e.images&&e.images.length>0){const a=document.createElement("div");a.id="projectImageCarousel",a.className="carousel slide";const n=document.createElement("div");n.className="carousel-inner",e.images.forEach(((e,t)=>{const a=document.createElement("div");a.classList.add("carousel-item"),0===t&&a.classList.add("active");const s=document.createElement("img"),o=e.startsWith("rsc/")||e.startsWith("http")?e:e.includes("/")?`rsc/images/${e}`:`rsc/images/recipes/${e}`,i=document.createElement("a");i.href=o,i.setAttribute("data-lightbox","carousel-images"),i.appendChild(s),a.appendChild(i),s.src=o,s.classList.add("d-block","w-100"),s.alt=`Project image ${t+1}`,n.appendChild(a)})),a.appendChild(n);const s=document.createElement("button");s.className="carousel-control-prev",s.setAttribute("type","button"),s.setAttribute("data-bs-target","#projectImageCarousel"),s.setAttribute("data-bs-slide","prev"),s.innerHTML='\n      <span class="carousel-control-prev-icon" aria-hidden="true"></span>\n      <span class="visually-hidden">Previous</span>\n    ';const o=document.createElement("button");o.className="carousel-control-next",o.setAttribute("type","button"),o.setAttribute("data-bs-target","#projectImageCarousel"),o.setAttribute("data-bs-slide","next"),o.innerHTML='\n      <span class="carousel-control-next-icon" aria-hidden="true"></span>\n      <span class="visually-hidden">Next</span>\n    ',a.appendChild(s),a.appendChild(o),t.appendChild(a),a.style.maxHeight="375px",new bootstrap.Carousel(a,{interval:!1,wrap:!0})}else{const a=document.createElement("div");a.className="fallback-placeholder",a.style.width="250px",a.style.height="250px",a.style.flex="0 0 auto";const n=document.createElement("img");n.src=getPlaceholderForStack(e),n.alt="Project placeholder",n.removeAttribute("style"),a.appendChild(n),t.style.display="flex",t.style.justifyContent="center",t.style.alignItems="center",t.appendChild(a)}}function showMermaidDiagramInModal(e){const t=document.getElementById("modalImages");t.innerHTML="",t.classList.remove("images-view"),t.classList.add("mermaid-view"),t.style.display="block";const a=document.createElement("div");a.id="mermaidContainer",a.className="mermaid",a.style.overflow="",t.appendChild(a);const n=parseMermaidCode(e);if(!n.trim())return a.style.minHeight="300px",void(a.innerHTML='<div class="no-mermaid">No Mermaid Diagram Available</div>');a.textContent=n,setTimeout((()=>{try{mermaid.init(void 0,a),panzoom(a,{smoothScroll:!1,maxZoom:5,minZoom:.5})}catch(e){console.error("Error initializing Mermaid or panzoom:",e)}}),100)}function setupModalToggleFABs(e){const t=e,a=document.querySelector(".fab-container");a&&a.remove();const n=document.createElement("div");n.className="fab-container";const s=document.createElement("button");s.className="fab toggle-images",s.innerHTML='<img src="rsc/images/fab-image-icon.png" alt="Images" style="width:24px; height:24px;">',s.classList.add("selected");const o=document.createElement("button");o.className="fab toggle-mermaid",o.innerHTML='<img src="rsc/images/stack/MermaidJS.png" alt="Mermaid Diagram" />',o.style.position="relative",e.mermaid&&e.mermaid.trim()||(o.setAttribute("disabled","true"),o.classList.add("disabled")),o.addEventListener("click",(()=>{let e=o.querySelector(".fab-tooltip");if(!e){e=document.createElement("div"),e.className="fab-tooltip",e.textContent="drag and scroll to explore the ERD",o.appendChild(e);const t=e.offsetHeight||30;e.style.position="absolute",e.style.top=`-${t+5}px`,e.style.left="50%",e.style.transform="translateX(-50%)",e.style.zIndex="20000",e.offsetWidth,e.classList.add("show"),setTimeout((()=>{e.classList.remove("show"),setTimeout((()=>{e.remove()}),500)}),3e3)}})),o.addEventListener("mouseleave",(()=>{const e=o.querySelector(".fab-tooltip");e&&setTimeout((()=>{e.remove()}),500)})),s.addEventListener("click",(()=>{s.classList.add("selected"),o.classList.remove("selected"),showImagesInModal(t)})),o.addEventListener("click",(()=>{o.disabled||(o.classList.add("selected"),s.classList.remove("selected"),showMermaidDiagramInModal(t))})),n.appendChild(s),n.appendChild(o);const i=document.getElementById("modalStack");i&&i.parentNode&&i.parentNode.insertBefore(n,i.nextSibling)}export function openProjectModal(e){const t=allProjects.find((t=>t.id===e));if(!t)return void console.error("Project not found:",e);document.getElementById("projectModal").style.display="block",document.getElementById("modalTitle").textContent=t.title,showImagesInModal(t);const a=document.getElementById("modalStack");a.innerHTML="",t.stack.forEach((e=>{const t=renderOneStackIcon(e);a.appendChild(t)}));const n=document.querySelector(".fab-container");n&&n.remove(),setupModalToggleFABs(t),document.getElementById("projectStatus").textContent=`Status: ${t.status||"N/A"}`,document.getElementById("projectDates").textContent=`Dates: ${t.dates||"Unknown"}`,document.getElementById("modalDescription").textContent=t.description||"No description available"}export function closeModal(){document.getElementById("projectModal").style.display="none";const e=document.querySelector(".fab-container");e&&e.remove(),document.getElementById("modalTitle").innerText="",document.getElementById("modalDescription").innerText="",document.getElementById("modalStack").innerHTML="",document.getElementById("modalImages").innerHTML=""}function getVisibleStackItems(e){let t=0,a=[];for(const n of e){if(!(t+n.length<=20))break;t+=n.length,a.push(n)}return{items:a,remaining:e.length-a.length}}