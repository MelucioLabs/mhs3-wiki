/**
 * <melucio-footer> Web Component
 *
 * Unified footer for all MelucioLabs projects.
 * Visual style based on KHAI, modal integration via hash routing (works with <rechtliches-modal>).
 *
 * Usage:
 * <melucio-footer
 *   links='[{"label":"Impressum","hash":"impressum"},{"label":"Datenschutz","hash":"datenschutz"}]'
 *   theme="dark"
 * ></melucio-footer>
 *
 * Link types:
 * - { label, hash }  → Sets URL hash → triggers rechtliches-modal (e.g. #impressum)
 * - { label, href }  → External link, opens in new tab
 */
// Canonical link presets — update here, run sync-web-components.ps1 to propagate
const PRESETS = {
  standard: [
    { label: 'Rechtliches & Kontakt', hash: 'rechtliches' },
  ],
  khai: [
    { label: 'Rechtliches & Kontakt', hash: 'rechtliches' },
    { label: 'Gesundheitshinweis',    hash: 'gesundheit'  },
    { label: 'FAQ',                   hash: 'faq'         },
  ],
};

class MelucioFooter extends HTMLElement {
  static get observedAttributes() {
    return ['links', 'preset', 'theme', 'copyright', 'accent'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.render();
  }

  get links() {
    const preset = this.getAttribute('preset');
    if (preset && PRESETS[preset]) return PRESETS[preset];
    try {
      return JSON.parse(this.getAttribute('links') || '[]');
    } catch { return []; }
  }

  get theme() {
    const attr = this.getAttribute('theme');
    if (attr === 'light' || attr === 'dark') return attr;
    // Auto-detect from parent
    const root = document.documentElement;
    return root.getAttribute('data-theme') || 'dark';
  }

  get copyright() {
    return this.getAttribute('copyright') || '\u00A9 2026 <a href="https://meluciolabs.de" target="_blank" rel="noopener">MelucioLabs</a>';
  }

  get accent() {
    return this.getAttribute('accent') || '#5CB85C';
  }

  render() {
    const theme = this.theme;
    const isDark = theme === 'dark';

    const colors = {
      bg: isDark ? '#1A1A2E' : '#f8f9fa',
      border: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      text: isDark ? '#A8A8B8' : '#666666',
      textHover: this.accent,
      separator: isDark ? '#3D3D5C' : '#cccccc',
    };

    const linkElements = this.links.map((link, i) => {
      const sep = i > 0 ? '<span class="sep">&middot;</span>' : '';
      if (link.hash) {
        return `${sep}<button class="footer-link" data-hash="${link.hash}">${link.label}</button>`;
      }
      if (link.href) {
        return `${sep}<a class="footer-link" href="${link.href}" target="_blank" rel="noopener">${link.label}</a>`;
      }
      return '';
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --mf-accent: ${this.accent};
        }
        .footer {
          padding: 2rem 1rem;
          text-align: center;
          background: ${colors.bg};
          border-top: 1px solid ${colors.border};
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 0.875rem;
        }
        .footer-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 0.5rem 0;
          margin-bottom: 0.75rem;
        }
        .footer-link {
          background: none;
          border: none;
          color: ${colors.text};
          font-size: 0.875rem;
          font-family: inherit;
          cursor: pointer;
          padding: 2px 6px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: var(--mf-accent);
        }
        .sep {
          color: ${colors.separator};
          margin: 0 0.4rem;
          user-select: none;
        }
        .copyright {
          color: ${colors.text};
          margin: 0;
          font-size: 0.8rem;
        }
        .copyright a {
          color: var(--mf-accent);
          text-decoration: underline;
        }
        .copyright a:hover {
          opacity: 0.8;
        }
        @media (max-width: 480px) {
          .footer { padding: 1.5rem 1rem; }
          .footer-links { gap: 0.25rem 0; }
        }
      </style>
      <footer class="footer">
        ${this.links.length ? `<div class="footer-links">${linkElements}</div>` : ''}
        <p class="copyright">${this.copyright}</p>
      </footer>
    `;

    // Attach hash-link click handlers
    this.shadowRoot.querySelectorAll('button[data-hash]').forEach(btn => {
      btn.addEventListener('click', () => {
        const hash = btn.dataset.hash;
        window.location.hash = hash;
      });
    });
  }
}

customElements.define('melucio-footer', MelucioFooter);
