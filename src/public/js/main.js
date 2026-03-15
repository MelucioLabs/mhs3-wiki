/* ============================================
   MHS3 Wiki - Main Application
   ============================================ */

const App = {
  lang: localStorage.getItem('mhs3-lang') || 'de',
  i18n: {},
  currentPage: 'home',

  async init() {
    await this.loadI18n();
    this.bindNav();
    this.bindSearch();
    this.bindLangToggle();
    this.bindMobileMenu();
    this.bindHashRouting();

    // Navigate based on URL hash or default to home
    const hash = window.location.hash.replace('#', '') || 'home';
    const validPages = ['home', 'monsties', 'bestiary', 'equipment', 'gene-calc', 'map'];
    this.navigate(validPages.includes(hash) ? hash : 'home');
  },

  // Hash-based routing for SEO and deep linking
  bindHashRouting() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      const validPages = ['home', 'monsties', 'bestiary', 'equipment', 'gene-calc', 'map'];
      if (validPages.includes(hash) && hash !== this.currentPage) {
        this.navigate(hash);
      }
    });
  },

  // --- i18n ---

  async loadI18n() {
    try {
      const res = await fetch(`/api/i18n/${this.lang}`);
      this.i18n = await res.json();
      this.updateI18n();
      document.getElementById('lang-toggle').textContent = this.lang === 'de' ? 'EN' : 'DE';
    } catch (e) {
      console.error('i18n load failed:', e);
    }
  },

  t(key) {
    return key.split('.').reduce((obj, k) => obj?.[k], this.i18n) || key;
  },

  // Translate an enum key (element, attack_type, etc.)
  te(group, key) {
    if (!key) return '-';
    return this.i18n?.enums?.[group]?.[key] || key;
  },

  updateI18n() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = this.t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = this.t(el.dataset.i18nPlaceholder);
    });
    document.title = this.t('site_title');
    // Update html lang attribute
    document.documentElement.lang = this.lang;
  },

  // SEO: Update page title and meta description dynamically
  updateSEO(page, detail) {
    const base = 'MHS3 Wiki';
    const titles = {
      home: `${base} - Monster Hunter Stories 3: Twisted Reflection Wiki`,
      monsties: `Monstie-Datenbank | ${base}`,
      bestiary: `Bestiarum | ${base}`,
      equipment: this.lang === 'de' ? `Ausrüstung | ${base}` : `Equipment | ${base}`,
      'gene-calc': `Gene-Rechner | ${base}`,
      map: this.lang === 'de' ? `Interaktive Karte | ${base}` : `Interactive Map | ${base}`,
      'search-results': `${this.t('search.title')} | ${base}`,
    };
    document.title = detail || titles[page] || titles.home;

    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const hash = page === 'home' ? '' : `#${page}`;
      canonical.href = `https://mhs3.meluciolabs.de/${hash}`;
    }

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const descs = {
        home: this.lang === 'de'
          ? 'Das umfassende Fan-Wiki zu Monster Hunter Stories 3: Twisted Reflection. Monstie-Datenbank, Bestiarum, Gene-Rechner, interaktive Karte und mehr.'
          : 'The comprehensive fan wiki for Monster Hunter Stories 3: Twisted Reflection. Monstie database, bestiary, gene calculator, interactive map and more.',
        monsties: this.lang === 'de'
          ? 'Alle Monsties in MHS3 mit Elementen, Angriffstypen, Ride-Actions und Habitaten. Finde dein perfektes Team!'
          : 'All Monsties in MHS3 with elements, attack types, ride actions and habitats. Find your perfect team!',
        bestiary: this.lang === 'de'
          ? 'Komplettes Bestiarum von MHS3. Alle Monster mit Schwächen, Spezies und Fundorten.'
          : 'Complete MHS3 bestiary. All monsters with weaknesses, species and habitats.',
        equipment: this.lang === 'de'
          ? 'Alle Waffen und Rüstungen in MHS3 mit Stats, Skills und benötigten Materialien.'
          : 'All weapons and armor in MHS3 with stats, skills and required materials.',
        'gene-calc': this.lang === 'de'
          ? 'MHS3 Gene-Rechner: Plane dein Rite of Channeling mit dem 3x3 Grid. Optimiere Bingo-Boni!'
          : 'MHS3 Gene Calculator: Plan your Rite of Channeling with the 3x3 grid. Optimize Bingo Bonuses!',
        map: this.lang === 'de'
          ? 'Interaktive Weltkarte von MHS3. Finde alle Monsties, markiere deinen Fortschritt und teile deine Entdeckungen.'
          : 'Interactive MHS3 world map. Find all monsties, track your progress and share your discoveries.',
      };
      metaDesc.content = descs[page] || descs.home;
    }
  },

  // --- Navigation ---

  bindNav() {
    document.querySelectorAll('[data-nav]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(el.dataset.nav);
      });
    });
  },

  bindMobileMenu() {
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
      document.querySelector('.nav').classList.toggle('open');
    });
  },

  navigate(page, params = {}) {
    // Cleanup map when navigating away
    if (this.currentPage === 'map' && page !== 'map') this._destroyMap();

    this.currentPage = page;
    this._lastParams = params;
    document.querySelectorAll('.nav a').forEach((a) =>
      a.classList.toggle('active', a.dataset.nav === page)
    );
    document.querySelector('.nav').classList.remove('open');

    // Update URL hash (without triggering hashchange loop)
    const newHash = page === 'home' ? '' : page;
    if (window.location.hash.replace('#', '') !== newHash) {
      history.replaceState(null, '', newHash ? `#${newHash}` : window.location.pathname);
    }

    // Update SEO metadata
    this.updateSEO(page);

    const app = document.getElementById('app');
    app.innerHTML = `<div class="empty-state">${this.t('common.loading')}</div>`;

    switch (page) {
      case 'home': this.renderHome(); break;
      case 'monsties': this.renderMonsties(); break;
      case 'bestiary': this.renderBestiary(); break;
      case 'equipment': this.renderEquipment(); break;
      case 'gene-calc': this.renderGeneCalc(); break;
      case 'map': this.renderMap(); break;
      case 'search-results': this.renderSearchResults(params.query); break;
    }
  },

  // --- Lang Toggle ---

  bindLangToggle() {
    document.getElementById('lang-toggle').addEventListener('click', async () => {
      this.lang = this.lang === 'de' ? 'en' : 'de';
      localStorage.setItem('mhs3-lang', this.lang);
      await this.loadI18n();
      this.navigate(this.currentPage, this._lastParams);
    });
  },

  // --- Search ---

  bindSearch() {
    const input = document.getElementById('global-search');
    let timer;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim().length >= 2) {
        this.navigate('search-results', { query: input.value.trim() });
      }
    });
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (input.value.trim().length >= 2) {
          this.navigate('search-results', { query: input.value.trim() });
        }
      }, 400);
    });
  },

  // --- API Helper ---

  async api(path) {
    const sep = path.includes('?') ? '&' : '?';
    const res = await fetch(`${path}${sep}lang=${this.lang}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  // --- Element helpers ---

  elementClass(el) {
    if (!el) return 'none';
    return el.toLowerCase().replace(/\s+/g, '-');
  },

  rarityStars(n) {
    return '<span class="rarity-stars">' + '\u2605'.repeat(n) + '</span>';
  },

  // Element icon SVGs for monstie placeholders
  elementIcon(element, size) {
    const sizeClass = size === 'lg' ? ' monstie-icon-lg' : '';
    const icons = {
      fire: '\uD83D\uDD25',
      water: '\uD83D\uDCA7',
      thunder: '\u26A1',
      ice: '\u2744\uFE0F',
      dragon: '\uD83D\uDC09',
      none: '\u2694\uFE0F'
    };
    const icon = icons[element] || icons.none;
    return `<div class="monstie-icon el-${element || 'none'}${sizeClass}">${icon}</div>`;
  },

  // --- Modal ---

  openModal(headerHtml, bodyHtml) {
    this.closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          ${headerHtml}
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal();
    });
    document.addEventListener('keydown', this._modalEscHandler = (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
    requestAnimationFrame(() => overlay.classList.add('visible'));
  },

  closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (!overlay) return;
    if (this._modalEscHandler) {
      document.removeEventListener('keydown', this._modalEscHandler);
      this._modalEscHandler = null;
    }
    overlay.classList.remove('visible');
    overlay.classList.add('closing');
    setTimeout(() => overlay.remove(), 200);
  },

  // --- HOME ---

  renderHome() {
    document.getElementById('app').innerHTML = `
      <div class="home-page">
        <h1 class="page-title">${this.t('home.welcome')}</h1>
        <p class="page-subtitle">${this.t('home.subtitle')}</p>
        <div class="home-grid">
          <div class="home-card" data-goto="monsties">
            <h3>${this.t('home.card_monsties')}</h3>
            <p>${this.t('home.card_monsties_desc')}</p>
          </div>
          <div class="home-card" data-goto="bestiary">
            <h3>${this.t('home.card_bestiary')}</h3>
            <p>${this.t('home.card_bestiary_desc')}</p>
          </div>
          <div class="home-card" data-goto="equipment">
            <h3>${this.t('home.card_equipment')}</h3>
            <p>${this.t('home.card_equipment_desc')}</p>
          </div>
          <div class="home-card" data-goto="gene-calc">
            <h3>${this.t('home.card_genes')}</h3>
            <p>${this.t('home.card_genes_desc')}</p>
          </div>
          <div class="home-card" data-goto="map">
            <h3>${this.t('home.card_map')}</h3>
            <p>${this.t('home.card_map_desc')}</p>
          </div>
        </div>
      </div>`;
    document.querySelectorAll('[data-goto]').forEach((el) => {
      el.addEventListener('click', () => this.navigate(el.dataset.goto));
    });
  },

  // --- MONSTIES ---

  async renderMonsties() {
    try {
      const [monsties, filters] = await Promise.all([
        this.api('/api/monsties'),
        this.api('/api/monsties/filters'),
      ]);
      this._renderMonstieList(monsties, filters);
    } catch (e) {
      document.getElementById('app').innerHTML = `<div class="empty-state">${this.t('common.error')}</div>`;
    }
  },

  _renderMonstieList(monsties, filters) {
    const app = document.getElementById('app');
    app.innerHTML = `
      <h1 class="page-title">${this.t('monsties.title')}</h1>
      <div class="filter-bar">
        <select id="filter-element">
          <option value="">${this.t('monsties.filter_element')}: ${this.t('monsties.filter_all')}</option>
          ${filters.elements.map((e) => `<option value="${e}">${this.te('elements', e)}</option>`).join('')}
        </select>
        <select id="filter-attack">
          <option value="">${this.t('monsties.filter_attack')}: ${this.t('monsties.filter_all')}</option>
          ${filters.attack_types.map((a) => `<option value="${a}">${this.te('attack_types', a)}</option>`).join('')}
        </select>
        <select id="filter-ride">
          <option value="">${this.t('monsties.filter_ride')}: ${this.t('monsties.filter_all')}</option>
          ${filters.ride_actions.map((r) => `<option value="${r}">${this.te('ride_actions', r)}</option>`).join('')}
        </select>
      </div>
      <div class="card-list" id="monstie-list">
        ${this._monstieCards(monsties)}
      </div>`;

    const reload = async () => {
      const params = new URLSearchParams();
      const el = document.getElementById('filter-element').value;
      const at = document.getElementById('filter-attack').value;
      const ra = document.getElementById('filter-ride').value;
      if (el) params.set('element', el);
      if (at) params.set('attack_type', at);
      if (ra) params.set('ride_action', ra);
      const data = await this.api(`/api/monsties?${params}`);
      document.getElementById('monstie-list').innerHTML = this._monstieCards(data);
      this._bindMonstieClicks();
    };

    app.querySelectorAll('select').forEach((s) => s.addEventListener('change', reload));
    this._bindMonstieClicks();
  },

  _monstieCards(list) {
    if (list.length === 0) return `<div class="empty-state">${this.t('monsties.no_results')}</div>`;
    return list.map((m) => `
      <div class="data-card" data-monstie-id="${m.id}">
        <div class="card-header">
          ${this.elementIcon(m.element)}
          <div>
            <h3>${m.name}</h3>
            ${m.habitat ? `<div class="habitat-info">\uD83D\uDCCD ${m.habitat}</div>` : ''}
          </div>
        </div>
        <div class="tags">
          <span class="tag tag-${this.elementClass(m.element)}">${this.te('elements', m.element)}</span>
          <span class="tag tag-${(m.attack_type || '').toLowerCase()}">${this.te('attack_types', m.attack_type)}</span>
        </div>
        <p class="desc">${m.ride_action ? `${this.t('monsties.ride_action')}: ${this.te('ride_actions', m.ride_action)}` : ''}</p>
        <p class="desc">${m.description || ''}</p>
      </div>`).join('');
  },

  _bindMonstieClicks() {
    document.querySelectorAll('[data-monstie-id]').forEach((el) => {
      el.addEventListener('click', () => this.showMonstieModal(el.dataset.monstieId));
    });
  },

  async showMonstieModal(id) {
    try {
      const m = await this.api(`/api/monsties/${id}`);
      this.updateSEO('monsties', `${m.name} - Monstie | MHS3 Wiki`);
      this.openModal(
        `${this.elementIcon(m.element, 'lg')}<h2>${m.name}</h2>`,
        `<div class="detail-section">
          <div class="tags" style="margin-bottom:0.75rem">
            <span class="tag tag-${this.elementClass(m.element)}">${this.te('elements', m.element)}</span>
            <span class="tag tag-${(m.attack_type || '').toLowerCase()}">${this.te('attack_types', m.attack_type)}</span>
          </div>
          <p><strong>${this.t('monsties.ride_action')}:</strong> ${this.te('ride_actions', m.ride_action)}</p>
          <p><strong>${this.t('monsties.habitat')}:</strong> ${m.habitat || '-'}</p>
        </div>
        <div class="detail-section">
          <h4>${this.t('common.details')}</h4>
          <p>${m.description || '-'}</p>
        </div>`
      );
    } catch (e) {
      console.error('showMonstieModal error:', e);
    }
  },

  // --- BESTIARY ---

  async renderBestiary() {
    try {
      const [monsters, filters] = await Promise.all([
        this.api('/api/bestiary'),
        this.api('/api/bestiary/filters'),
      ]);
      this._renderMonsterList(monsters, filters);
    } catch (e) {
      document.getElementById('app').innerHTML = `<div class="empty-state">${this.t('common.error')}</div>`;
    }
  },

  _renderMonsterList(monsters, filters) {
    const app = document.getElementById('app');
    app.innerHTML = `
      <h1 class="page-title">${this.t('bestiary.title')}</h1>
      <div class="filter-bar">
        <select id="filter-weakness">
          <option value="">${this.t('bestiary.filter_weakness')}: ${this.t('bestiary.filter_all')}</option>
          ${filters.weaknesses.map((w) => `<option value="${w}">${this.te('elements', w)}</option>`).join('')}
        </select>
        <select id="filter-habitat">
          <option value="">${this.t('bestiary.filter_habitat')}: ${this.t('bestiary.filter_all')}</option>
          ${filters.habitats.map((h) => `<option value="${h}">${h}</option>`).join('')}
        </select>
        <select id="filter-species">
          <option value="">${this.t('bestiary.filter_species')}: ${this.t('bestiary.filter_all')}</option>
          ${filters.species.map((s) => `<option value="${s}">${this.te('species', s)}</option>`).join('')}
        </select>
      </div>
      <div class="card-list" id="monster-list">
        ${this._monsterCards(monsters)}
      </div>`;

    const reload = async () => {
      const params = new URLSearchParams();
      const w = document.getElementById('filter-weakness').value;
      const h = document.getElementById('filter-habitat').value;
      const s = document.getElementById('filter-species').value;
      if (w) params.set('weakness', w);
      if (h) params.set('habitat', h);
      if (s) params.set('species', s);
      const data = await this.api(`/api/bestiary?${params}`);
      document.getElementById('monster-list').innerHTML = this._monsterCards(data);
      this._bindMonsterClicks();
    };

    app.querySelectorAll('select').forEach((s) => s.addEventListener('change', reload));
    this._bindMonsterClicks();
  },

  _monsterCards(list) {
    if (list.length === 0) return `<div class="empty-state">${this.t('bestiary.no_results')}</div>`;
    return list.map((m) => `
      <div class="data-card" data-monster-id="${m.id}">
        <h3>${m.name}</h3>
        <div class="tags">
          <span class="tag tag-${this.elementClass(m.weakness)}">${this.t('bestiary.weakness')}: ${this.te('elements', m.weakness)}</span>
        </div>
        <p class="desc">${this.te('species', m.species)} &mdash; ${m.habitat || ''}</p>
        <p class="desc">${m.description || ''}</p>
      </div>`).join('');
  },

  _bindMonsterClicks() {
    document.querySelectorAll('[data-monster-id]').forEach((el) => {
      el.addEventListener('click', () => this.showMonsterModal(el.dataset.monsterId));
    });
  },

  async showMonsterModal(id) {
    try {
      const m = await this.api(`/api/bestiary/${id}`);
      this.updateSEO('bestiary', `${m.name} - Bestiarum | MHS3 Wiki`);
      this.openModal(
        `${this.elementIcon(m.weakness, 'lg')}<h2>${m.name}</h2>`,
        `<div class="detail-section">
          <p><strong>${this.t('bestiary.species')}:</strong> ${this.te('species', m.species)}</p>
          <p><strong>${this.t('bestiary.weakness')}:</strong> <span class="tag tag-${this.elementClass(m.weakness)}">${this.te('elements', m.weakness)}</span></p>
          <p><strong>${this.t('bestiary.habitat')}:</strong> ${m.habitat || '-'}</p>
        </div>
        <div class="detail-section">
          <h4>${this.t('common.details')}</h4>
          <p>${m.description || '-'}</p>
        </div>`
      );
    } catch (e) {
      console.error('showMonsterModal error:', e);
    }
  },

  // --- EQUIPMENT ---

  async renderEquipment() {
    try {
      const [equip, filters] = await Promise.all([
        this.api('/api/equipment'),
        this.api('/api/equipment/filters'),
      ]);
      this._renderEquipList(equip, filters);
    } catch (e) {
      document.getElementById('app').innerHTML = `<div class="empty-state">${this.t('common.error')}</div>`;
    }
  },

  _renderEquipList(equip, filters) {
    const app = document.getElementById('app');
    const elementOptions = (filters.elements || []).map((e) => {
      const label = e === 'non_elemental' ? this.te('elements', 'none') : this.te('elements', e);
      return `<option value="${e}">${label}</option>`;
    }).join('');
    app.innerHTML = `
      <h1 class="page-title">${this.t('equipment.title')}</h1>
      <div class="filter-bar">
        <select id="filter-type">
          <option value="">${this.t('equipment.filter_type')}: ${this.t('equipment.filter_all')}</option>
          ${filters.types.map((t) => `<option value="${t}">${this.te('equip_types', t)}</option>`).join('')}
        </select>
        <select id="filter-element">
          <option value="">${this.t('monsties.filter_element')}: ${this.t('equipment.filter_all')}</option>
          ${elementOptions}
        </select>
        <select id="filter-rarity">
          <option value="">${this.t('equipment.filter_rarity')}: ${this.t('equipment.filter_all')}</option>
          ${filters.rarities.map((r) => `<option value="${r}">${'\u2605'.repeat(r)}</option>`).join('')}
        </select>
      </div>
      <div class="card-list" id="equip-list">
        ${this._equipCards(equip)}
      </div>`;

    const reload = async () => {
      const params = new URLSearchParams();
      const t = document.getElementById('filter-type').value;
      const el = document.getElementById('filter-element').value;
      const r = document.getElementById('filter-rarity').value;
      if (t) params.set('type', t);
      if (el) params.set('element', el);
      if (r) params.set('rarity', r);
      const data = await this.api(`/api/equipment?${params}`);
      document.getElementById('equip-list').innerHTML = this._equipCards(data);
      this._bindEquipClicks();
    };

    app.querySelectorAll('select').forEach((s) => s.addEventListener('change', reload));
    this._bindEquipClicks();
  },

  _equipTypeTag(type) {
    const tagMap = { greatsword: 'power', longsword: 'speed', hammer: 'power', bow: 'technical', horn: 'technical', gunlance: 'power', armor: 'speed' };
    return tagMap[type] || 'power';
  },

  // Stats to hide from equipment display (internal/hash data)
  _hiddenStats: new Set(['element', 'element_resist', 'melody', 'partner_melody', 'skills']),

  _equipCards(list) {
    if (list.length === 0) return `<div class="empty-state">${this.t('equipment.no_results')}</div>`;
    return list.map((e) => {
      const stats = e.stats || {};
      const statLabels = { attack: this.lang === 'de' ? 'Angriff' : 'Attack', critical: this.lang === 'de' ? 'Krit.' : 'Crit', defense: this.lang === 'de' ? 'Vert.' : 'Def', max_level: 'Max Lv', status: 'Status', status_rate: this.lang === 'de' ? 'Status-Rate' : 'Status Rate' };
      const statEntries = Object.entries(stats)
        .filter(([k]) => !this._hiddenStats.has(k))
        .filter(([, v]) => v !== 0 && v !== '')
        .map(([k, v]) => {
          const display = k === 'status' ? this.te('status_effects', v) || v : v;
          return `<div class="stat-item">${statLabels[k] || k}: <span>${display}</span></div>`;
        })
        .join('');
      const elemKey = stats.element;
      const elemTag = elemKey
        ? `<span class="tag tag-${this.elementClass(elemKey)}">${this.te('elements', elemKey)}</span>`
        : '';
      return `
        <div class="data-card" data-equip-id="${e.id}">
          <h3>${e.name} ${this.rarityStars(e.rarity)}</h3>
          <div class="tags">
            <span class="tag tag-${this._equipTypeTag(e.type)}">${this.te('equip_types', e.type)}</span>
            ${elemTag}
          </div>
          <div class="stats-grid">${statEntries}</div>
          <p class="desc">${e.description || ''}</p>
        </div>`;
    }).join('');
  },

  _bindEquipClicks() {
    document.querySelectorAll('[data-equip-id]').forEach((el) => {
      el.addEventListener('click', () => this.showEquipModal(el.dataset.equipId));
    });
  },

  async showEquipModal(id) {
    try {
      const e = await this.api(`/api/equipment/${id}`);
      this.updateSEO('equipment', `${e.name} - ${this.lang === 'de' ? 'Ausrüstung' : 'Equipment'} | MHS3 Wiki`);
      const stats = e.stats || {};
      const de = this.lang === 'de';
      const statLabels = { attack: de ? 'Angriff' : 'Attack', critical: de ? 'Krit. Rate' : 'Crit Rate', defense: de ? 'Verteidigung' : 'Defense', max_level: 'Max Level', status: 'Status', status_rate: de ? 'Status-Rate' : 'Status Rate', element_resist: de ? 'Element-Resistenz' : 'Element Resistance' };
      const statEntries = Object.entries(stats)
        .filter(([k]) => !this._hiddenStats.has(k))
        .filter(([, v]) => v !== 0 && v !== '')
        .map(([k, v]) => {
          const display = k === 'status' ? this.te('status_effects', v) || v : v;
          return `<div class="stat-item">${statLabels[k] || k}: <span>${display}</span></div>`;
        })
        .join('');

      // Element display
      const elemKey = stats.element;
      const elemHtml = elemKey
        ? `<span class="tag tag-${this.elementClass(elemKey)}" style="margin-left:0.5rem">${this.te('elements', elemKey)}</span>`
        : '';

      // Element resistance for armor
      const elemResist = stats.element_resist || {};
      const resistLabels = { weak: de ? '▼ Schwach' : '▼ Weak', very_weak: de ? '▼▼ Sehr Schwach' : '▼▼ Very Weak', resist: de ? '▲ Resistent' : '▲ Resist', strong_resist: de ? '▲▲ Sehr Resistent' : '▲▲ Strong Resist' };
      const elemResistHtml = Object.entries(elemResist).map(([elem, level]) =>
        `<div class="stat-item">${this.te('elements', elem)}: <span class="${level.includes('weak') ? 'text-red' : 'text-green'}">${resistLabels[level] || level}</span></div>`
      ).join('');
      const skills = (stats.skills || []).map((s) => `<li>${s}</li>`).join('');
      const mats = (e.materials || []).map((m) => `<li>${m}</li>`).join('');

      this.openModal(
        `<h2>${e.name} ${this.rarityStars(e.rarity)}</h2>
         <span class="tag tag-${this._equipTypeTag(e.type)}" style="margin-bottom:0.5rem;display:inline-block">${this.te('equip_types', e.type)}</span>${elemHtml}`,
        `<div class="detail-section">
          <h4>${this.t('equipment.stats')}</h4>
          <div class="stats-grid">${statEntries}</div>
          ${elemResistHtml ? `<h4 style="margin-top:0.5rem">${statLabels.element_resist}</h4><div class="stats-grid">${elemResistHtml}</div>` : ''}
          ${skills ? `<p style="margin-top:0.5rem"><strong>Skills:</strong></p><ul class="materials-list">${skills}</ul>` : ''}
        </div>
        ${mats ? `<div class="detail-section">
          <h4>${this.t('equipment.materials')}</h4>
          <ul class="materials-list">${mats}</ul>
        </div>` : ''}
        <div class="detail-section">
          <h4>${this.t('common.details')}</h4>
          <p>${e.description || '-'}</p>
        </div>`
      );
    } catch (e) {
      console.error('showEquipModal error:', e);
    }
  },

  // --- GENE CALC ---

  renderGeneCalc() {
    document.getElementById('app').innerHTML = `
      <h1 class="page-title">${this.t('gene_calc.title')}</h1>
      <p class="page-subtitle">${this.t('gene_calc.instructions')}</p>
      <div id="gene-calc-root"></div>`;
    if (typeof GeneCalculator !== 'undefined') {
      GeneCalculator.init('gene-calc-root', this);
    }
  },

  // --- MAP (Leaflet.js interactive map) ---

  _mapInstance: null,
  _mapMarkers: [],
  _activeRegionFilter: null,

  // Map configuration for each region/sub-area
  _mapConfig: {
    regions: [
      {
        id: 'azuria',
        name_de: 'Azuria',
        name_en: 'Azuria',
        color: '#4ade80',
        habitatKeys: ['Azuria'],  // same in DE/EN
        subMaps: [
          { id: 'azuria_main', name_de: 'Hauptgebiet', name_en: 'Main Area', file: 'azuria_main.png', w: 1065, h: 1039 },
          { id: 'azuria_ashen_pass', name_de: 'Aschenpfad', name_en: 'Ashen Pass', file: 'azuria_ashen_pass.png', w: 959, h: 1014 },
          { id: 'azuria_castle', name_de: 'Schloss Azuria', name_en: 'Azuria Castle', file: 'azuria_azuria_castle.png', w: 963, h: 965 },
        ],
      },
      {
        id: 'canalta',
        name_de: 'Canalta-Waldland',
        name_en: 'Canalta Timberland',
        color: '#22c55e',
        habitatKeys: ['Canalta Timberland', 'Canalta-Waldland'],  // EN / DE
        subMaps: [
          { id: 'canalta_main', name_de: 'Hauptgebiet', name_en: 'Main Area', file: 'canalta_timperland_main.png', w: 923, h: 913 },
        ],
      },
      {
        id: 'tarkuan',
        name_de: 'Tarkuan',
        name_en: 'Tarkuan',
        color: '#f59e0b',
        habitatKeys: ['Tarkuan'],
        subMaps: [],
      },
      {
        id: 'serathis',
        name_de: 'Serathis',
        name_en: 'Serathis',
        color: '#67e8f9',
        habitatKeys: ['Serathis'],
        subMaps: [],
      },
    ],
  },

  _elementColors: {
    fire: '#ef4444', water: '#3b82f6', thunder: '#facc15',
    ice: '#67e8f9', dragon: '#a855f7', none: '#9ca3af',
  },

  // Named/story monsties to exclude from map region lists
  _storyMonsties: new Set([
    'Ratha V', 'Plessie', 'Gravy', 'Dee', 'Sereg', 'Gnocchi', 'Angie',
    'Chirpy', 'Kagachi', 'Fawn', 'Lenox', 'Legia', 'Golma', 'Großpoogie', 'Great Poogie',
  ]),

  _mapSortMode: 'element', // 'element' or 'name'

  renderMap() {
    this._destroyMap();

    const app = document.getElementById('app');
    const de = this.lang === 'de';
    const regions = this._mapConfig.regions;

    // Build region tabs
    const regionTabs = regions.map((r, i) => {
      const name = de ? r.name_de : r.name_en;
      const hasMap = r.subMaps.length > 0;
      return `<button class="map-region-tab ${i === 0 ? 'active' : ''}" data-region="${r.id}"
        style="--region-color: ${r.color}">
        ${name}
        ${!hasMap ? '<span class="map-tab-soon">' + (de ? 'bald' : 'soon') + '</span>' : ''}
      </button>`;
    }).join('');

    app.innerHTML = `
      <div class="map-wrapper">
        <div class="map-header">
          <h1 class="page-title map-title">${de ? 'Interaktive Karten' : 'Interactive Maps'}</h1>
          <p class="map-subtitle">${de
            ? 'Wähle eine Region und erkunde die Karte'
            : 'Select a region and explore the map'}</p>
        </div>
        <div class="map-region-tabs">${regionTabs}</div>
        <div class="map-sub-tabs" id="map-sub-tabs"></div>
        <div id="mhs3-map" class="map-container"></div>
        <div class="map-monstie-list" id="map-monstie-list"></div>
      </div>`;

    // Bind region tabs
    document.querySelectorAll('.map-region-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.map-region-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._selectRegion(btn.dataset.region);
      });
    });

    // Load monsties, then select first region
    this._loadMapMonsties().then(() => this._selectRegion('azuria'));
  },

  async _loadMapMonsties() {
    try {
      const data = await this.api('/api/monsties');
      this._mapMonsties = data.data || data;
    } catch (e) {
      console.error('Map: Failed to load monsties', e);
      this._mapMonsties = [];
    }
  },

  _selectRegion(regionId) {
    const region = this._mapConfig.regions.find(r => r.id === regionId);
    if (!region) return;
    this._activeMapRegion = region;

    const de = this.lang === 'de';
    const subTabsEl = document.getElementById('map-sub-tabs');

    if (region.subMaps.length === 0) {
      // No maps available yet
      subTabsEl.innerHTML = '';
      this._destroyMap();
      document.getElementById('mhs3-map').innerHTML = `
        <div class="empty-state map-placeholder">
          <div class="map-placeholder-icon">🗺️</div>
          <h3>${de ? 'Karte kommt bald' : 'Map coming soon'}</h3>
          <p>${de
            ? `Die Karte für ${region.name_de} wird bald hinzugefügt.`
            : `The map for ${region.name_en} will be added soon.`}</p>
        </div>`;
      this._showRegionMonsties(region);
      return;
    }

    // Build sub-map tabs
    if (region.subMaps.length > 1) {
      subTabsEl.innerHTML = region.subMaps.map((sm, i) => {
        const name = de ? sm.name_de : sm.name_en;
        return `<button class="map-sub-tab ${i === 0 ? 'active' : ''}" data-submap="${sm.id}">${name}</button>`;
      }).join('');

      subTabsEl.querySelectorAll('.map-sub-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          subTabsEl.querySelectorAll('.map-sub-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const sm = region.subMaps.find(s => s.id === btn.dataset.submap);
          if (sm) this._loadSubMap(sm);
        });
      });
    } else {
      subTabsEl.innerHTML = '';
    }

    // Load first sub-map
    this._loadSubMap(region.subMaps[0]);
    this._showRegionMonsties(region);
  },

  _loadSubMap(subMap) {
    this._destroyMap();

    if (typeof L === 'undefined') {
      document.getElementById('mhs3-map').innerHTML =
        '<div class="empty-state">Leaflet.js konnte nicht geladen werden.</div>';
      return;
    }

    const { w, h, file } = subMap;
    const bounds = [[0, 0], [h, w]];

    const map = L.map('mhs3-map', {
      crs: L.CRS.Simple,
      minZoom: -1,
      maxZoom: 4,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      maxBounds: [[-50, -50], [h + 50, w + 50]],
      maxBoundsViscosity: 0.8,
      attributionControl: false,
    });

    L.imageOverlay(`/maps/${file}`, bounds).addTo(map);
    map.fitBounds(bounds);

    L.control.attribution({ prefix: false, position: 'bottomright' })
      .addAttribution('MHS3 Wiki')
      .addTo(map);

    this._mapInstance = map;
  },

  _showRegionMonsties(region) {
    const listEl = document.getElementById('map-monstie-list');
    if (!listEl || !this._mapMonsties) return;

    const de = this.lang === 'de';
    // Filter: match region, exclude story monsties
    const regionMonsties = this._mapMonsties.filter(m => {
      const habitat = m.habitat || '';
      const name = m.name || '';
      if (this._storyMonsties.has(name)) return false;
      return region.habitatKeys.some(k => habitat === k);
    });

    // Sort based on current mode
    this._sortMonsties(regionMonsties);

    if (regionMonsties.length === 0) {
      listEl.innerHTML = `<div class="map-monstie-empty">${de
        ? 'Keine Monsties in dieser Region'
        : 'No Monsties in this region'}</div>`;
      return;
    }

    const elementEmoji = { fire: '🔥', water: '💧', thunder: '⚡', ice: '❄️', dragon: '🐉', none: '⚪' };
    const attackLabels = {
      power: de ? 'Kraft' : 'Power',
      speed: de ? 'Geschwindigkeit' : 'Speed',
      technical: de ? 'Technik' : 'Technical',
    };

    const sortLabel = this._mapSortMode === 'element'
      ? (de ? 'Element' : 'Element')
      : (de ? 'Name' : 'Name');
    const nextSort = this._mapSortMode === 'element' ? 'name' : 'element';
    const nextLabel = nextSort === 'element'
      ? (de ? 'Element' : 'Element')
      : (de ? 'Name' : 'Name');

    const header = `<div class="map-monstie-header">
      <h3>${de ? 'Monsties in dieser Region' : 'Monsties in this Region'} (${regionMonsties.length})</h3>
      <button class="map-sort-btn" id="map-sort-toggle" title="${de ? 'Sortierung ändern' : 'Change sorting'}">
        <span class="map-sort-icon">⇅</span> ${sortLabel}
      </button>
    </div>`;

    const cards = regionMonsties.map(m => {
      const name = m.name || m.name_de || m.name_en;
      const elem = m.element || 'none';
      const color = this._elementColors[elem] || this._elementColors.none;
      return `<div class="map-monstie-card" data-id="${m.id}" style="--el-color: ${color}">
        <span class="map-monstie-elem">${elementEmoji[elem] || '⚪'}</span>
        <span class="map-monstie-name">${name}</span>
        <span class="map-monstie-attack">${attackLabels[m.attack_type] || ''}</span>
      </div>`;
    }).join('');

    listEl.innerHTML = header + `<div class="map-monstie-grid">${cards}</div>`;

    // Sort toggle
    document.getElementById('map-sort-toggle')?.addEventListener('click', () => {
      this._mapSortMode = this._mapSortMode === 'element' ? 'name' : 'element';
      this._showRegionMonsties(region);
    });

    // Click to open modal
    listEl.querySelectorAll('.map-monstie-card').forEach(el => {
      el.addEventListener('click', () => this.showMonstieModal(el.dataset.id));
    });
  },

  _sortMonsties(monsties) {
    const elemOrder = { fire: 0, water: 1, thunder: 2, ice: 3, dragon: 4, none: 5 };
    if (this._mapSortMode === 'element') {
      monsties.sort((a, b) => {
        const eA = elemOrder[a.element] ?? 99;
        const eB = elemOrder[b.element] ?? 99;
        if (eA !== eB) return eA - eB;
        return (a.name || '').localeCompare(b.name || '');
      });
    } else {
      monsties.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
  },

  _destroyMap() {
    if (this._mapInstance) {
      this._mapInstance.remove();
      this._mapInstance = null;
    }
    this._mapMarkers = [];
    this._activeRegionFilter = null;
  },

  // --- SEARCH ---

  async renderSearchResults(q) {
    try {
      const data = await this.api(`/api/search?q=${encodeURIComponent(q)}`);
      const categoryMap = {
        monstie: this.t('search.category_monstie'),
        monster: this.t('search.category_monster'),
        equipment: this.t('search.category_equipment'),
      };
      const items = data.results.map((r) => `
        <div class="search-result-item" data-category="${r.category}" data-id="${r.id}">
          <div class="category">${categoryMap[r.category] || r.category}</div>
          <div class="name">${r.name}</div>
        </div>`).join('');

      document.getElementById('app').innerHTML = `
        <h1 class="page-title">${this.t('search.title')}</h1>
        <p class="page-subtitle">${data.total} ${this.t('search.results_for')}: "${q}"</p>
        <div class="search-results">
          ${items || `<div class="empty-state">${this.t('search.no_results')}</div>`}
        </div>`;

      document.querySelectorAll('.search-result-item').forEach((el) => {
        el.addEventListener('click', () => {
          const cat = el.dataset.category;
          const id = el.dataset.id;
          if (cat === 'monstie') this.showMonstieModal(id);
          else if (cat === 'monster') this.showMonsterModal(id);
          else if (cat === 'equipment') this.showEquipModal(id);
        });
      });
    } catch (e) {
      document.getElementById('app').innerHTML = `<div class="empty-state">${this.t('common.error')}</div>`;
    }
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
