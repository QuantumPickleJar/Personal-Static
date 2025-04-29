import{LitElement,html,css}from"https://esm.sh/lit@2.8.0";import"https://esm.sh/@material/web/switch/switch.js";const TOGGLE_EVENT="project-type-change";export class ProjectTypeToggle extends LitElement{static styles=css`
    :host {
      display: inline-block;
      --switch-size: 1.2;
    }
    
    md-switch {
      transform: scale(var(--switch-size));
      margin: 4px;
    }
    
    span[slot="on-icon"],
    span[slot="off-icon"] {
      font-size: 16px;
      padding: 2px;
    }
    
    .mermaid-icon img {
      width: 16px;
      height: 16px;
      vertical-align: middle;
    }
    
    @media (max-width: 768px) {
      :host {
        --switch-size: 1;
      }
    }
  `;static properties={selected:{type:Boolean,reflect:!0}};constructor(){super(),this.selected=!1}render(){const e=window.location.hostname.includes("github.io")?"/Personal-Static/":"/";return html`
      <md-switch 
        @input=${this.toggleProjectType} 
        ?selected=${this.selected}
        icons>
        <span slot="on-icon" class="mermaid-icon">
          <img src="${e}rsc/images/stack/MermaidJS.png" alt="Mermaid" />
        </span>
        <span slot="off-icon">📷</span>
      </md-switch>
    `}toggleProjectType(e){if(!e||!e.target)return;this.selected=e.target.selected;const t=new CustomEvent(TOGGLE_EVENT,{bubbles:!0,composed:!0,detail:{showMermaid:this.selected}});this.dispatchEvent(t),localStorage.setItem("projectToggle",this.selected?"mermaid":"photos")}firstUpdated(){const e=localStorage.getItem("projectToggle");e&&(this.selected="mermaid"===e,setTimeout((()=>{this.dispatchEvent(new CustomEvent(TOGGLE_EVENT,{bubbles:!0,composed:!0,detail:{showMermaid:this.selected}}))}),10))}}customElements.define("project-type-toggle",ProjectTypeToggle);