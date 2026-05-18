/**
 * 📝 `<clipboard-card>` - Ficha de Liberação Portaria Custom Element
 * Exibe dados cadastrais estruturados com atalho de cópia rápida em um clique,
 * completo com feedbacks visuais de animação para os operadores.
 */
class ClipboardCard extends HTMLElement {
  static get observedAttributes() {
    return ["name", "phone", "cpf"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  copyToClipboard(text, tooltipId) {
    navigator.clipboard.writeText(text).then(() => {
      const tooltip = this.shadowRoot.getElementById(tooltipId);
      if (tooltip) {
        tooltip.textContent = "Copiado!";
        tooltip.classList.add("visible");
        setTimeout(() => {
          tooltip.classList.remove("visible");
          tooltip.textContent = "Copiar";
        }, 1500);
      }
    }).catch(err => {
      console.error("Erro ao copiar para área de transferência:", err);
    });
  }

  render() {
    const name = this.getAttribute("name") || "";
    const phone = this.getAttribute("phone") || "";
    const cpf = this.getAttribute("cpf") || "";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 12px;
          padding: 1.25rem;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #e4e4e7;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          box-sizing: border-box;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          text-transform: uppercase;
          color: #71717a;
          margin-bottom: 1rem;
          letter-spacing: 0.8px;
          font-weight: 700;
          border-bottom: 1px solid #27272a;
          padding-bottom: 0.5rem;
        }
        .header svg {
          width: 14px;
          height: 14px;
          fill: currentColor;
        }
        .field {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.65rem 0;
          border-bottom: 1px solid #27272a;
        }
        .field:last-child {
          border-bottom: none;
        }
        .label {
          font-size: 0.85rem;
          color: #a1a1aa;
        }
        .value-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .value {
          font-size: 0.95rem;
          font-weight: 500;
          color: #ffffff;
          user-select: all;
        }
        .copy-btn {
          background: none;
          border: none;
          color: #10b981;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .copy-btn:hover {
          background: rgba(16, 185, 129, 0.16);
          border-color: rgba(16, 185, 129, 0.3);
          color: #34d399;
          transform: translateY(-1px);
        }
        .copy-btn:active {
          transform: translateY(0);
        }
        .tooltip {
          position: absolute;
          bottom: 120%;
          left: 50%;
          transform: translateX(-50%) translateY(-2px);
          background: #09090b;
          color: #ffffff;
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border: 1px solid #3f3f46;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s, transform 0.2s;
          white-space: nowrap;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        .tooltip.visible {
          opacity: 1;
          transform: translateX(-50%) translateY(-5px);
        }
      </style>
      <div class="header">
        <svg viewBox="0 0 24 24">
          <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
        <span>Ficha de Liberação Portaria</span>
      </div>
      
      <div class="field">
        <span class="label">Nome Completo</span>
        <div class="value-wrapper">
          <span class="value">${name}</span>
          <button class="copy-btn" id="btn-name">
            <span class="tooltip" id="tip-name">Copiar</span>
            COPIAR
          </button>
        </div>
      </div>
      
      <div class="field">
        <span class="label">Celular WhatsApp</span>
        <div class="value-wrapper">
          <span class="value">${phone}</span>
          <button class="copy-btn" id="btn-phone">
            <span class="tooltip" id="tip-phone">Copiar</span>
            COPIAR
          </button>
        </div>
      </div>
      
      <div class="field">
        <span class="label">CPF do Profissional</span>
        <div class="value-wrapper">
          <span class="value">${cpf}</span>
          <button class="copy-btn" id="btn-cpf">
            <span class="tooltip" id="tip-cpf">Copiar</span>
            COPIAR
          </button>
        </div>
      </div>
    `;

    // Hook listeners
    this.shadowRoot.getElementById("btn-name").addEventListener("click", () => this.copyToClipboard(name, "tip-name"));
    this.shadowRoot.getElementById("btn-phone").addEventListener("click", () => this.copyToClipboard(phone, "tip-phone"));
    this.shadowRoot.getElementById("btn-cpf").addEventListener("click", () => this.copyToClipboard(cpf, "tip-cpf"));
  }
}

customElements.define("clipboard-card", ClipboardCard);
