/**
 * 🎨 `<reserva-button>` - Custom Element de Botão Premium
 * Suporta variantes (primary, danger, secondary), estados de disabled e loading,
 * com encapsulamento de estilos Shadow DOM e transições suaves.
 */
class ReservaButton extends HTMLElement {
  static get observedAttributes() {
    return ["variant", "disabled", "loading"];
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

  render() {
    const variant = this.getAttribute("variant") || "primary";
    const isDisabled = this.hasAttribute("disabled");
    const isLoading = this.hasAttribute("loading");

    const buttonClass = `btn btn-${variant} ${isLoading ? "btn-loading" : ""}`;
    const disabledAttr = isDisabled || isLoading ? "disabled" : "";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: 100%;
        }
        button {
          width: 100%;
          padding: 0.875rem 1.5rem;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          letter-spacing: 0.3px;
          box-sizing: border-box;
        }
        /* Variants */
        button.btn-primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
        }
        button.btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
        }
        button.btn-danger {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
        }
        button.btn-danger:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
          background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
        }
        button.btn-secondary {
          background: #27272a;
          color: #e4e4e7;
          border: 1px solid #3f3f46;
        }
        button.btn-secondary:hover:not(:disabled) {
          background: #3f3f46;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }
        /* Active Actions */
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        /* Disabled & Loading */
        button:disabled {
          background: #27272a !important;
          color: #71717a !important;
          border: 1px solid #3f3f46 !important;
          box-shadow: none !important;
          cursor: not-allowed;
          transform: none !important;
        }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <button class="${buttonClass}" ${disabledAttr}>
        ${isLoading ? '<div class="spinner"></div>' : ""}
        <slot></slot>
      </button>
    `;
  }
}

customElements.define("reserva-button", ReservaButton);
