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
    this.navigate('home');
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
    this.currentPage = page;
    this._lastParams = params;
    document.querySelectorAll('.nav a').forEach((a) =>
      a.classList.toggle('active', a.dataset.nav === page)
    );
    document.querySelector('.nav').classList.remove('open');

    const app = document.getElementById('app');
    app.innerHTML = `<div class="empty-state">${this.t('common.loading')}</div>`;

    switch (page) {
      case 'home': this.renderHome(); break;
      case 'monsties': this.renderMonsties(); break;
      case 'bestiary': this.renderBestiary(); break;
      case 'equipment': this.renderEquipment(); break;
      case 'gene-calc': this.renderGeneCalc(); break;
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
    app.innerHTML = `
      <h1 class="page-title">${this.t('equipment.title')}</h1>
      <div class="filter-bar">
        <select id="filter-type">
          <option value="">${this.t('equipment.filter_type')}: ${this.t('equipment.filter_all')}</option>
          ${filters.types.map((t) => `<option value="${t}">${this.te('equip_types', t)}</option>`).join('')}
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
      const r = document.getElementById('filter-rarity').value;
      if (t) params.set('type', t);
      if (r) params.set('rarity', r);
      const data = await this.api(`/api/equipment?${params}`);
      document.getElementById('equip-list').innerHTML = this._equipCards(data);
      this._bindEquipClicks();
    };

    app.querySelectorAll('select').forEach((s) => s.addEventListener('change', reload));
    this._bindEquipClicks();
  },

  _equipCards(list) {
    if (list.length === 0) return `<div class="empty-state">${this.t('equipment.no_results')}</div>`;
    return list.map((e) => {
      const stats = e.stats || {};
      const statEntries = Object.entries(stats)
        .filter(([k]) => !['skills'].includes(k))
        .map(([k, v]) => `<div class="stat-item">${k}: <span>${v}</span></div>`)
        .join('');
      return `
        <div class="data-card" data-equip-id="${e.id}">
          <h3>${e.name} ${this.rarityStars(e.rarity)}</h3>
          <div class="tags">
            <span class="tag tag-${e.type === 'weapon' ? 'power' : 'speed'}">${this.te('equip_types', e.type)}</span>
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
      const stats = e.stats || {};
      const statEntries = Object.entries(stats)
        .filter(([k]) => k !== 'skills')
        .map(([k, v]) => `<div class="stat-item">${k}: <span>${v}</span></div>`)
        .join('');
      const skills = (stats.skills || []).map((s) => `<li>${s}</li>`).join('');
      const mats = (e.materials || []).map((m) => `<li>${m}</li>`).join('');

      this.openModal(
        `<h2>${e.name} ${this.rarityStars(e.rarity)}</h2>`,
        `<div class="detail-section">
          <h4>${this.t('equipment.stats')}</h4>
          <div class="stats-grid">${statEntries}</div>
          ${skills ? `<p style="margin-top:0.5rem"><strong>Skills:</strong></p><ul class="materials-list">${skills}</ul>` : ''}
        </div>
        <div class="detail-section">
          <h4>${this.t('equipment.materials')}</h4>
          <ul class="materials-list">${mats || '<li>-</li>'}</ul>
        </div>
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
