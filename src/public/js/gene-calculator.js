/* ============================================
   MHS3 Wiki - Gene Calculator (Rite of Channeling)
   ============================================ */

const GeneCalculator = {
  app: null,
  grid: Array(9).fill(null), // 3x3 = 9 cells
  genes: [],
  selectedCell: null,

  async init(rootId, app) {
    this.app = app;
    this.grid = Array(9).fill(null);
    this.selectedCell = null;

    try {
      this.genes = await app.api('/api/monsties/genes');
    } catch (e) {
      this.genes = [];
    }

    this.render(rootId);
  },

  render(rootId) {
    const root = document.getElementById(rootId);
    root.innerHTML = `
      <div class="gene-calc-container">
        <div class="gene-grid-wrapper">
          <div class="gene-grid" id="gene-grid">
            ${this.grid.map((g, i) => this._cellHTML(g, i)).join('')}
          </div>
          <button class="clear-btn" id="clear-grid">${this.app.t('gene_calc.clear_grid')}</button>
          <div class="bonus-panel" id="bonus-panel">
            <h3>${this.app.t('gene_calc.bingo_bonus')}</h3>
            <div id="bonus-lines"></div>
          </div>
        </div>
        <div class="gene-list-panel" id="gene-list-panel">
          <h3>${this.app.t('gene_calc.select_gene')}</h3>
          <div id="gene-options">
            ${this.genes.map((g) => this._geneOptionHTML(g)).join('')}
          </div>
        </div>
      </div>`;

    this._bindEvents();
    this._updateBonuses();
  },

  _cellHTML(gene, index) {
    if (!gene) {
      return `<div class="gene-cell empty" data-cell="${index}"></div>`;
    }
    const icon = this._typeIcon(gene.gene_type);
    return `
      <div class="gene-cell" data-cell="${index}">
        <div class="gene-icon">${icon}</div>
        <div class="gene-name">${gene.name}</div>
      </div>`;
  },

  _geneOptionHTML(gene) {
    const icon = this._typeIcon(gene.gene_type);
    return `
      <div class="gene-option" data-gene-id="${gene.id}">
        <div class="gene-icon">${icon}</div>
        <div class="gene-option-info">
          <div class="name">${gene.name}</div>
          <div class="skill">
            <span class="tag tag-${(gene.gene_type || '').toLowerCase()}" style="font-size:0.65rem">${this.app.te('attack_types', gene.gene_type)}</span>
            <span class="tag tag-${this.app.elementClass(gene.element)}" style="font-size:0.65rem">${this.app.te('elements', gene.element)}</span>
            ${gene.skill_name || ''}
          </div>
        </div>
      </div>`;
  },

  _typeIcon(type) {
    switch ((type || '').toLowerCase()) {
      case 'power': return '\u2694\uFE0F';
      case 'technical': return '\uD83D\uDEE0\uFE0F';
      case 'speed': return '\u26A1';
      default: return '\u2753';
    }
  },

  _bindEvents() {
    // Cell clicks
    document.querySelectorAll('.gene-cell').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.cell, 10);
        document.querySelectorAll('.gene-cell').forEach((c) => c.classList.remove('selected'));
        el.classList.add('selected');
        this.selectedCell = idx;
      });
    });

    // Gene option clicks
    document.querySelectorAll('.gene-option').forEach((el) => {
      el.addEventListener('click', () => {
        if (this.selectedCell === null) return;
        const geneId = parseInt(el.dataset.geneId, 10);
        const gene = this.genes.find((g) => g.id === geneId);
        if (!gene) return;
        this.grid[this.selectedCell] = { ...gene };
        this._refreshGrid();
      });
    });

    // Clear
    document.getElementById('clear-grid').addEventListener('click', () => {
      this.grid = Array(9).fill(null);
      this.selectedCell = null;
      this._refreshGrid();
    });
  },

  _refreshGrid() {
    const gridEl = document.getElementById('gene-grid');
    gridEl.innerHTML = this.grid.map((g, i) => this._cellHTML(g, i)).join('');

    // Re-bind cell clicks
    gridEl.querySelectorAll('.gene-cell').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.cell, 10);
        gridEl.querySelectorAll('.gene-cell').forEach((c) => c.classList.remove('selected'));
        el.classList.add('selected');
        this.selectedCell = idx;
      });
    });

    this._updateBonuses();
  },

  _updateBonuses() {
    // Lines: 3 rows, 3 cols, 2 diagonals
    const lines = [
      { label: `${this.app.t('gene_calc.row')} 1`, cells: [0, 1, 2] },
      { label: `${this.app.t('gene_calc.row')} 2`, cells: [3, 4, 5] },
      { label: `${this.app.t('gene_calc.row')} 3`, cells: [6, 7, 8] },
      { label: `${this.app.t('gene_calc.column')} 1`, cells: [0, 3, 6] },
      { label: `${this.app.t('gene_calc.column')} 2`, cells: [1, 4, 7] },
      { label: `${this.app.t('gene_calc.column')} 3`, cells: [2, 5, 8] },
      { label: `${this.app.t('gene_calc.diagonal')} \\`, cells: [0, 4, 8] },
      { label: `${this.app.t('gene_calc.diagonal')} /`, cells: [2, 4, 6] },
    ];

    // Clear bingo highlights
    document.querySelectorAll('.gene-cell').forEach((c) => {
      c.classList.remove('bingo-type', 'bingo-element', 'bingo-both');
    });

    const bonusHTML = lines.map((line) => {
      const genes = line.cells.map((i) => this.grid[i]);

      // Need all 3 filled
      if (genes.some((g) => !g)) {
        return `<div class="bonus-line">
          <span class="bonus-label">${line.label}</span>
          <span class="bonus-value">${this.app.t('gene_calc.no_bonus')}</span>
        </div>`;
      }

      const typeMatch = genes[0].gene_type && genes.every((g) => g.gene_type === genes[0].gene_type);
      const elementMatch = genes[0].element && genes[0].element !== 'none'
        && genes.every((g) => g.element === genes[0].element);

      let bonusText = this.app.t('gene_calc.no_bonus');
      let bonusClass = '';

      if (typeMatch && elementMatch) {
        bonusText = `${this.app.t('gene_calc.both_match')} (${this.app.te('attack_types', genes[0].gene_type)} + ${this.app.te('elements', genes[0].element)})`;
        bonusClass = 'active-both';
        line.cells.forEach((i) => {
          document.querySelector(`[data-cell="${i}"]`)?.classList.add('bingo-both');
        });
      } else if (typeMatch) {
        bonusText = `${this.app.t('gene_calc.type_match')} (${this.app.te('attack_types', genes[0].gene_type)})`;
        bonusClass = 'active-type';
        line.cells.forEach((i) => {
          document.querySelector(`[data-cell="${i}"]`)?.classList.add('bingo-type');
        });
      } else if (elementMatch) {
        bonusText = `${this.app.t('gene_calc.element_match')} (${this.app.te('elements', genes[0].element)})`;
        bonusClass = 'active-element';
        line.cells.forEach((i) => {
          document.querySelector(`[data-cell="${i}"]`)?.classList.add('bingo-element');
        });
      }

      return `<div class="bonus-line">
        <span class="bonus-label">${line.label}</span>
        <span class="bonus-value ${bonusClass}">${bonusText}</span>
      </div>`;
    }).join('');

    document.getElementById('bonus-lines').innerHTML = bonusHTML;
  },
};
