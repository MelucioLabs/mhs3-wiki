/**
 * <rechtliches-modal> Web Component
 *
 * Tabbed legal + contact modal for MelucioLabs apps.
 * Opens when window.location.hash === '#rechtliches' or '#kontakt'
 * Tabs: Impressum | Datenschutz | Sicherheit | Kontakt
 *
 * Usage:
 * <rechtliches-modal app="quiz" turnstile-key="0x..."></rechtliches-modal>
 *
 * Attributes:
 *   app           - app identifier sent to contact API (default: 'meluciolabs')
 *   turnstile-key - Cloudflare Turnstile site key (optional)
 *   api-url       - Contact API endpoint (default: https://portal.meluciolabs.de/api/tickets)
 *
 * Trigger:
 * window.location.hash = 'rechtliches'  → opens on last/default tab
 * window.location.hash = 'kontakt'      → opens on Kontakt tab
 * — or —
 * document.querySelector('rechtliches-modal').open('kontakt')
 */

(function () {
  'use strict';

  const COMPANY = 'MelucioLabs';
  const NAME = 'David Vaupel';
  const STREET = 'Hamburger Chaussee 30';
  const CITY = '14641 Nauen';
  const COUNTRY = 'Deutschland';
  const EMAIL = 'kontakt@meluciolabs.de';

  const TABS = ['impressum', 'datenschutz', 'sicherheit', 'kontakt'];
  const TAB_LABELS = { impressum: 'Impressum', datenschutz: 'Datenschutz', sicherheit: 'Sicherheit', kontakt: 'Kontakt' };

  const STYLE = `
    :host { display: block; }

    .rm-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      z-index: 9000;
      animation: rmFadeIn 0.2s ease;
    }
    .rm-overlay.active { display: block; }

    @keyframes rmFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes rmSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

    .rm-sheet {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #1A1A2E;
      border-top: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px 20px 0 0;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      z-index: 9001;
      animation: rmSlideUp 0.3s ease;
    }

    @media (min-width: 768px) {
      .rm-overlay { display: none; }
      .rm-overlay.active { display: flex; align-items: center; justify-content: center; }
      .rm-sheet {
        position: static;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.1);
        animation: rmFadeIn 0.2s ease;
      }
    }

    .rm-handle {
      width: 40px;
      height: 4px;
      background: rgba(255,255,255,0.2);
      border-radius: 2px;
      margin: 12px auto 0;
      flex-shrink: 0;
    }
    @media (min-width: 768px) { .rm-handle { display: none; } }

    .rm-header {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 48px 8px;
      flex-shrink: 0;
      position: relative;
      text-align: center;
    }

    .rm-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #E8E8EC;
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .rm-close {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(255,255,255,0.08);
      border-radius: 50%;
      cursor: pointer;
      color: #888;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
      font-family: inherit;
    }
    .rm-close:hover { background: rgba(255,255,255,0.15); color: #E8E8EC; }

    .rm-tabs {
      display: flex;
      justify-content: center;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 0 12px;
      flex-shrink: 0;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .rm-tabs::-webkit-scrollbar { display: none; }

    .rm-tab {
      flex: 0 1 auto;
      padding: 10px 20px;
      border: none;
      background: none;
      color: #888;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.15s;
      white-space: nowrap;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .rm-tab:hover { color: #E8E8EC; }
    .rm-tab.active {
      color: #5CB85C;
      border-bottom-color: #5CB85C;
    }

    .rm-content {
      overflow-y: auto;
      flex: 1;
      padding: 0;
    }

    .rm-panel { display: none; padding: 16px; }
    .rm-panel.active { display: block; }

    .rm-section { margin-bottom: 18px; }
    .rm-section h3 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #E8E8EC;
      margin: 0 0 6px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .rm-section p, .rm-section li {
      font-size: 0.825rem;
      color: #888;
      line-height: 1.55;
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .rm-section a { color: #5CB85C; text-decoration: none; }
    .rm-section a:hover { text-decoration: underline; }

    .rm-list {
      list-style: none;
      margin: 4px 0 0;
      padding: 0;
    }
    .rm-list li { padding: 2px 0 2px 16px; position: relative; }
    .rm-list li::before { content: '·'; position: absolute; left: 4px; color: #5CB85C; }

    .rm-list--check li::before { content: '✓'; font-size: 0.75rem; }

    .rm-infocard {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      padding: 10px 12px;
      margin-top: 8px;
    }
    .rm-infocard strong {
      font-size: 0.8rem;
      color: #E8E8EC;
      display: block;
      margin-bottom: 4px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .rm-disclaimer {
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 14px;
      font-size: 0.825rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .rm-disclaimer strong {
      display: block;
      margin-bottom: 4px;
      font-size: 0.825rem;
    }
    .rm-disclaimer p { margin: 0; }
    .rm-disclaimer--warning {
      background: rgba(255,193,7,0.08);
      border: 1px solid rgba(255,193,7,0.25);
      color: #cca300;
    }
    .rm-disclaimer--warning strong { color: #e6b800; }
    .rm-disclaimer--health {
      background: rgba(92,184,92,0.08);
      border: 1px solid rgba(92,184,92,0.25);
      color: #4a9e4a;
    }
    .rm-disclaimer--health strong { color: #5CB85C; }

    /* Contact form */
    .rm-contact-form { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }
    .rm-form-group { display: flex; flex-direction: column; gap: 4px; }
    .rm-form-label {
      font-size: 0.78rem; font-weight: 600; color: #888; text-transform: uppercase;
      letter-spacing: 0.03em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .rm-form-input, .rm-form-textarea {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; padding: 10px 12px; font-size: 0.875rem; color: #E8E8EC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transition: border-color 0.15s; width: 100%; box-sizing: border-box;
    }
    .rm-form-input:focus, .rm-form-textarea:focus { outline: none; border-color: #5CB85C; }
    .rm-form-textarea { resize: vertical; min-height: 90px; }
    .rm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (max-width: 480px) { .rm-form-row { grid-template-columns: 1fr; } }
    .rm-btn-submit {
      background: #5CB85C; color: white; border: none; border-radius: 8px;
      padding: 11px 20px; font-size: 0.9rem; font-weight: 600; cursor: pointer;
      font-family: inherit; transition: opacity 0.15s; align-self: flex-end;
    }
    .rm-btn-submit:hover:not(:disabled) { opacity: 0.88; }
    .rm-btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }
    .rm-form-error {
      font-size: 0.8rem; color: #e74c3c; margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .rm-contact-success {
      display: flex; flex-direction: column; align-items: center;
      gap: 10px; padding: 30px 0; text-align: center;
    }
    .rm-contact-success-icon { font-size: 2.5rem; color: #5CB85C; }
    .rm-contact-success h3 {
      font-size: 1.1rem; color: #E8E8EC; margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .rm-contact-success p {
      font-size: 0.875rem; color: #888; margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
  `;

  function impressumContent() {
    return `
      <div class="rm-section">
        <h3>Angaben gemäß § 5 DDG</h3>
        <p><strong style="color:#E8E8EC">${COMPANY}</strong><br>
          ${NAME}<br>
          ${STREET}<br>
          ${CITY}<br>
          ${COUNTRY}
        </p>
      </div>
      <div class="rm-section">
        <h3>Kontakt</h3>
        <p>E-Mail: <a href="mailto:${EMAIL}">${EMAIL}</a><br>
          Oder nutze unser <a href="#kontakt" class="rm-kontakt-link" style="color:#5CB85C;cursor:pointer">Kontaktformular</a>
        </p>
      </div>
      <div class="rm-section">
        <h3>Verantwortlich für den Inhalt</h3>
        <p>${NAME} (Anschrift wie oben)</p>
      </div>
      <div class="rm-disclaimer rm-disclaimer--warning">
        <strong>⚠️ KI-Hinweis</strong>
        <p>Inhalte, die von KI generiert werden, können Fehler enthalten. Bitte überprüfe alle Informationen kritisch.</p>
      </div>
      <div class="rm-disclaimer rm-disclaimer--health">
        <strong>🏥 Gesundheitshinweis</strong>
        <p>Alle Angaben ohne Gewähr. Bei medizinischen Fragen konsultiere bitte einen Arzt.</p>
      </div>
      <div class="rm-section">
        <h3>Haftung für Inhalte</h3>
        <p>Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte verantwortlich. Eine Pflicht zur Überwachung fremder Informationen besteht nicht.</p>
      </div>
    `;
  }

  function datenschutzContent() {
    return `
      <div class="rm-section">
        <h3>1. Verantwortlicher</h3>
        <p>${COMPANY}, ${NAME}, ${STREET}, ${CITY}<br>
          E-Mail: <a href="mailto:${EMAIL}">${EMAIL}</a>
        </p>
      </div>
      <div class="rm-section">
        <h3>2. Erhobene Daten</h3>
        <ul class="rm-list">
          <li>Accountdaten: E-Mail, Benutzername, verschlüsseltes Passwort</li>
          <li>Nutzungsdaten: Gespeicherte Inhalte, Favoriten, Einstellungen</li>
          <li>Technische Daten: IP-Adresse (anonymisiert), Browser-Typ</li>
        </ul>
      </div>
      <div class="rm-section">
        <h3>3. Zweck der Verarbeitung</h3>
        <ul class="rm-list">
          <li>Account-Verwaltung und Authentifizierung</li>
          <li>Speicherung deiner Daten und Einstellungen</li>
          <li>Verbesserung des Dienstes</li>
        </ul>
      </div>
      <div class="rm-section">
        <h3>4. Datensicherheit</h3>
        <ul class="rm-list rm-list--check">
          <li>Verschlüsselte Übertragung (HTTPS/TLS)</li>
          <li>E-Mails werden verschlüsselt gespeichert (AES-128)</li>
          <li>Passwörter werden gehasht (bcrypt)</li>
        </ul>
      </div>
      <div class="rm-section">
        <h3>5. Deine Rechte</h3>
        <ul class="rm-list rm-list--check">
          <li>Auskunft über deine gespeicherten Daten</li>
          <li>Berichtigung unrichtiger Daten</li>
          <li>Löschung deiner Daten</li>
          <li>Datenübertragbarkeit</li>
        </ul>
        <p style="margin-top:6px">Kontakt: <a href="mailto:${EMAIL}">${EMAIL}</a></p>
      </div>
      <div class="rm-section">
        <h3>6. Cookies</h3>
        <p>Nur technisch notwendige Cookies für die Anmeldung (JWT-Token). Keine Tracking-Cookies.</p>
      </div>
      <div class="rm-section">
        <h3>7. Drittanbieter</h3>
        <ul class="rm-list">
          <li>Cloudflare: CDN und DDoS-Schutz</li>
          <li>Cloudflare Turnstile: Bot-Schutz (kein reCAPTCHA)</li>
        </ul>
      </div>
    `;
  }

  function sicherheitContent() {
    return `
      <div class="rm-section">
        <h3>🔐 Passwörter</h3>
        <p>Alle Passwörter werden mit bcrypt gehasht. Wir sehen dein Passwort niemals im Klartext.</p>
        <div class="rm-infocard">
          <strong>Anforderungen</strong>
          <p>Mindestens 8 Zeichen, Groß- und Kleinbuchstaben, Zahlen.</p>
        </div>
      </div>
      <div class="rm-section">
        <h3>🛡️ Anmeldung</h3>
        <p>Dein Account wird geschützt durch:</p>
        <ul class="rm-list rm-list--check">
          <li>JWT-Token mit kurzer Ablaufzeit</li>
          <li>Brute-Force-Schutz durch Rate-Limiting</li>
          <li>Cloudflare Turnstile Bot-Schutz</li>
          <li>HTTPS/TLS-Verschlüsselung</li>
        </ul>
      </div>
      <div class="rm-section">
        <h3>🔒 Datenverschlüsselung</h3>
        <ul class="rm-list rm-list--check">
          <li>E-Mails werden verschlüsselt gespeichert (AES-128)</li>
          <li>Alle Verbindungen TLS-verschlüsselt</li>
          <li>Server läuft hinter Cloudflare CDN</li>
        </ul>
      </div>
      <div class="rm-section">
        <h3>🗑️ Deine Rechte</h3>
        <p>Du kannst jederzeit per E-Mail die Löschung deines Accounts und aller Daten beantragen.</p>
        <ul class="rm-list rm-list--check">
          <li>Vollständige Datenlöschung auf Anfrage</li>
          <li>Datenexport auf Anfrage</li>
        </ul>
      </div>
      <div class="rm-section">
        <h3>❓ Sicherheitsprobleme melden</h3>
        <p>Gefundene Sicherheitslücken bitte direkt melden:<br>
          <a href="mailto:${EMAIL}">${EMAIL}</a>
        </p>
      </div>
    `;
  }

  function kontaktContent() {
    return `
      <div class="rm-section">
        <h3>✉️ Direkt schreiben</h3>
        <p><a href="mailto:${EMAIL}">${EMAIL}</a></p>
      </div>
      <div class="rm-section">
        <h3>📝 Kurze Nachricht senden</h3>
        <form class="rm-contact-form" id="rm-contact-form">
          <div class="rm-form-row">
            <div class="rm-form-group">
              <label class="rm-form-label">Name <span style="font-weight:400;opacity:0.6">(optional)</span></label>
              <input class="rm-form-input" type="text" id="rm-name" maxlength="50" placeholder="Anonym">
            </div>
            <div class="rm-form-group">
              <label class="rm-form-label">E-Mail <span style="font-weight:400;opacity:0.6">(optional)</span></label>
              <input class="rm-form-input" type="email" id="rm-email" maxlength="100" placeholder="Für Rückfragen">
            </div>
          </div>
          <div class="rm-form-group">
            <label class="rm-form-label">Nachricht *</label>
            <textarea class="rm-form-textarea" id="rm-message" required minlength="10" maxlength="1000"
              placeholder="Deine Nachricht…"></textarea>
          </div>
          <p class="rm-form-error" id="rm-form-error" style="display:none"></p>
          <button class="rm-btn-submit" type="submit" id="rm-submit">Absenden</button>
        </form>
        <div class="rm-contact-success" id="rm-success" style="display:none">
          <div class="rm-contact-success-icon">✓</div>
          <h3>Nachricht gesendet!</h3>
          <p id="rm-success-text"></p>
        </div>
      </div>
    `;
  }

  const PANEL_CONTENT = {
    impressum: impressumContent,
    datenschutz: datenschutzContent,
    sicherheit: sicherheitContent,
    kontakt: kontaktContent,
  };

  class RechtlichesModal extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._activeTab = 'impressum';
      this._handleHashChange = this._handleHashChange.bind(this);
      this._handleTouchStart = this._handleTouchStart.bind(this);
      this._handleTouchMove = this._handleTouchMove.bind(this);
      this._touchStartY = null;
    }

    get _app() { return this.getAttribute('app') || 'meluciolabs'; }
    get _apiUrl() { return this.getAttribute('api-url') || 'https://portal.meluciolabs.de/api/tickets'; }
    get _turnstileKey() { return this.getAttribute('turnstile-key') || ''; }

    connectedCallback() {
      this._render();
      window.addEventListener('hashchange', this._handleHashChange);
      // Check initial hash
      const hash = window.location.hash.slice(1);
      if (hash === 'rechtliches') this._open('impressum');
      else if (hash === 'kontakt') this._open('kontakt');
    }

    disconnectedCallback() {
      window.removeEventListener('hashchange', this._handleHashChange);
    }

    _handleHashChange() {
      const hash = window.location.hash.slice(1);
      if (hash === 'rechtliches') this._open(this._activeTab);
      else if (hash === 'kontakt') this._open('kontakt');
    }

    open(tab = 'impressum') { this._open(tab); }

    _open(tab) {
      if (tab) this._activeTab = tab;
      const overlay = this.shadowRoot.querySelector('.rm-overlay');
      if (overlay) overlay.classList.add('active');
      history.replaceState(null, '', '#rechtliches');
      this._setTab(this._activeTab, false);
    }

    _close() {
      const overlay = this.shadowRoot.querySelector('.rm-overlay');
      if (overlay) overlay.classList.remove('active');
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    _setTab(tab, scroll = true) {
      this._activeTab = tab;
      this.shadowRoot.querySelectorAll('.rm-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
      });
      this.shadowRoot.querySelectorAll('.rm-panel').forEach(panel => {
        panel.classList.toggle('active', panel.dataset.tab === tab);
      });
      if (scroll) {
        const content = this.shadowRoot.querySelector('.rm-content');
        if (content) content.scrollTop = 0;
      }
    }

    _handleTouchStart(e) {
      this._touchStartY = e.touches[0].clientY;
    }

    _handleTouchMove(e) {
      if (this._touchStartY === null) return;
      const delta = e.touches[0].clientY - this._touchStartY;
      if (delta > 60) {
        this._touchStartY = null;
        this._close();
      }
    }

    _render() {
      const tabButtons = TABS.map(tab => `
        <button class="rm-tab${tab === this._activeTab ? ' active' : ''}" data-tab="${tab}">
          ${TAB_LABELS[tab]}
        </button>
      `).join('');

      const panels = TABS.map(tab => `
        <div class="rm-panel${tab === this._activeTab ? ' active' : ''}" data-tab="${tab}">
          ${PANEL_CONTENT[tab]()}
        </div>
      `).join('');

      this.shadowRoot.innerHTML = `
        <style>${STYLE}</style>
        <div class="rm-overlay" role="dialog" aria-modal="true" aria-label="Rechtliches">
          <div class="rm-sheet">
            <div class="rm-handle"></div>
            <div class="rm-header">
              <h2 class="rm-title">⚖️ Rechtliches & Kontakt</h2>
              <button class="rm-close" aria-label="Schließen">✕</button>
            </div>
            <div class="rm-tabs" role="tablist">
              ${tabButtons}
            </div>
            <div class="rm-content">
              ${panels}
            </div>
          </div>
        </div>
      `;

      // Overlay click to close (only on the overlay background, not the sheet)
      const overlay = this.shadowRoot.querySelector('.rm-overlay');
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this._close();
      });

      // Close button
      this.shadowRoot.querySelector('.rm-close').addEventListener('click', () => this._close());

      // Tab buttons
      this.shadowRoot.querySelectorAll('.rm-tab').forEach(btn => {
        btn.addEventListener('click', () => this._setTab(btn.dataset.tab));
      });

      // Internal link to switch to Kontakt tab
      this.shadowRoot.addEventListener('click', (e) => {
        if (e.target.classList.contains('rm-kontakt-link')) {
          e.preventDefault();
          this._setTab('kontakt');
        }
      });

      // Swipe to close (mobile)
      const sheet = this.shadowRoot.querySelector('.rm-sheet');
      sheet.addEventListener('touchstart', this._handleTouchStart, { passive: true });
      sheet.addEventListener('touchmove', this._handleTouchMove, { passive: true });
      sheet.addEventListener('touchend', () => { this._touchStartY = null; }, { passive: true });

      // Contact form submission
      const form = this.shadowRoot.getElementById('rm-contact-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const submitBtn = this.shadowRoot.getElementById('rm-submit');
          const errorEl = this.shadowRoot.getElementById('rm-form-error');
          const message = this.shadowRoot.getElementById('rm-message')?.value?.trim();
          if (!message) return;

          submitBtn.disabled = true;
          submitBtn.textContent = 'Wird gesendet…';
          errorEl.style.display = 'none';

          try {
            const res = await fetch(this._apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                app: this._app,
                name: this.shadowRoot.getElementById('rm-name')?.value?.trim() || 'Anonym',
                email: this.shadowRoot.getElementById('rm-email')?.value?.trim() || null,
                subject: `[${this._app}] Kontaktanfrage`,
                message,
                turnstileToken: null,
              }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
              form.style.display = 'none';
              const emailVal = this.shadowRoot.getElementById('rm-email')?.value?.trim();
              const successText = this.shadowRoot.getElementById('rm-success-text');
              if (successText) {
                successText.textContent = emailVal
                  ? 'Vielen Dank! Wir melden uns so schnell wie möglich bei dir.'
                  : 'Danke für dein Feedback!';
              }
              const success = this.shadowRoot.getElementById('rm-success');
              if (success) success.style.display = 'flex';
            } else {
              throw new Error(data.error || 'Fehler');
            }
          } catch {
            errorEl.textContent = 'Fehler beim Senden. Bitte später erneut versuchen.';
            errorEl.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Absenden';
          }
        });
      }
    }
  }

  if (!customElements.get('rechtliches-modal')) {
    customElements.define('rechtliches-modal', RechtlichesModal);
  }
})();
