/**
 * PaySurity POS Engine — Shared across all 4 on-premise registers
 * Provides: KDS notifications, cart management, payment processing,
 *           table map, split check, barcode scanner, age verification
 */
window.POS = {
  API: 'http://localhost:4000/api/v1',
  token: null,
  cart: [],
  orders: [],
  kdsQueue: [],
  cfg: null,
  txnCount: 0,
  totalRevenue: 0,

  // ─── AUTH ──────────────────────────────────────────────────────
  async auth() {
    if (this.token) return this.token;
    try {
      const r = await fetch(`${this.API}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.cfg.email, password: this.cfg.password })
      });
      const d = await r.json();
      this.token = d.data?.accessToken;
      return this.token;
    } catch { return null; }
  },

  // ─── CART ──────────────────────────────────────────────────────
  addItem(idx) {
    const item = this.cfg.items[idx];
    if (item.stock !== undefined && item.stock <= 0) { this.toast('Out of stock!', 'error'); return; }
    const existing = this.cart.find(c => c.idx === idx);
    if (existing) { existing.qty++; } else { this.cart.push({ ...item, idx, qty: 1 }); }
    if (item.stock !== undefined) item.stock--;
    this.sound('add');
    this.renderCart();
    this.renderGrid();
  },

  removeItem(i) {
    const c = this.cart[i];
    if (c.stock !== undefined) { const orig = this.cfg.items[c.idx]; if (orig) orig.stock++; }
    if (c.qty > 1) { c.qty--; } else { this.cart.splice(i, 1); }
    this.renderCart();
    this.renderGrid();
  },

  clearCart() { 
    this.cart.forEach(c => { const orig = this.cfg.items[c.idx]; if (orig && orig.stock !== undefined) orig.stock += c.qty; });
    this.cart = []; this.renderCart(); this.renderGrid(); 
  },

  getTotal() { return this.cart.reduce((s, c) => s + c.p * c.qty, 0); },

  // ─── RENDER ────────────────────────────────────────────────────
  renderCart() {
    const el = document.getElementById('posCart');
    const total = this.getTotal();
    if (!this.cart.length) {
      el.innerHTML = '<div class="pos-empty">No items in order</div>';
    } else {
      el.innerHTML = this.cart.map((c, i) => `
        <div class="pos-ci">
          <div class="pos-ci-info">
            <span class="pos-ci-name">${this.sn(c.n)}</span>
            <span class="pos-ci-qty">×${c.qty}</span>
          </div>
          <div class="pos-ci-right">
            <span class="pos-ci-price">$${(c.p * c.qty / 100).toFixed(2)}</span>
            <button class="pos-ci-rm" onclick="POS.removeItem(${i})" aria-label="Remove ${this.sn(c.n)}">−</button>
          </div>
        </div>`).join('');
    }
    document.getElementById('posTotal').textContent = `$${(total / 100).toFixed(2)}`;
    document.getElementById('posPayBtn').disabled = !this.cart.length;
    document.getElementById('posItemCount').textContent = this.cart.reduce((s, c) => s + c.qty, 0);
  },

  renderGrid() {
    const el = document.getElementById('posGrid');
    const cat = this.currentCat || 'All';
    const items = cat === 'All' ? this.cfg.items : this.cfg.items.filter(i => i.cat === cat);
    el.innerHTML = items.map((item, _i) => {
      const idx = this.cfg.items.indexOf(item);
      const oos = item.stock !== undefined && item.stock <= 0;
      return `<button class="pos-tile${oos ? ' oos' : ''}" onclick="POS.addItem(${idx})" ${oos ? 'disabled' : ''} aria-label="${this.sn(item.n)} $${(item.p / 100).toFixed(2)}">
        <span class="pos-tile-emoji" aria-hidden="true">${item.e}</span>
        <span class="pos-tile-name">${this.sn(item.n)}</span>
        <span class="pos-tile-price">$${(item.p / 100).toFixed(2)}</span>
        ${item.stock !== undefined ? `<span class="pos-tile-stock${item.stock <= 3 ? ' low' : ''}">${item.stock} left</span>` : ''}
      </button>`;
    }).join('');
  },

  renderCats() {
    const el = document.getElementById('posCats');
    if (!el) return;
    const cats = ['All', ...new Set(this.cfg.items.map(i => i.cat))];
    el.innerHTML = cats.map(c => `<button class="pos-cat${c === (this.currentCat || 'All') ? ' on' : ''}" onclick="POS.setCat('${c}')">${c}</button>`).join('');
  },

  setCat(c) { this.currentCat = c; this.renderCats(); this.renderGrid(); },

  // ─── PAYMENT ───────────────────────────────────────────────────
  async processPayment(method) {
    if (!this.cart.length) return;
    const btn = document.getElementById('posPayBtn');
    btn.disabled = true; btn.textContent = '⏳ Processing...';
    try {
      const token = await this.auth();
      const total = this.getTotal();
      if (!token) throw new Error('Auth failed');

      const orderR = await fetch(`${this.API}/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Trace-Id': `pos-${Date.now()}` },
        body: JSON.stringify({
          orderType: this.cfg.orderType || 'DINE_IN',
          tableNumber: document.getElementById('posTable')?.value || '',
          items: this.cart.map(c => ({ itemName: c.n, quantity: c.qty, unitPriceCents: c.p, kdsStation: c.kds || 'MAIN' })),
          locationId: this.cfg.locationId
        })
      });
      const order = await orderR.json();

      const payR = await fetch(`${this.API}/payments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Trace-Id': `pos-p-${Date.now()}` },
        body: JSON.stringify({ amountCents: total, paymentToken: 'tok_sandbox_pos', paymentMethodType: method || 'CARD_PRESENT', locationId: this.cfg.locationId })
      });
      const payment = await payR.json();

      // KDS notification
      const orderNum = order.data?.orderNumber || `ORD-${Date.now().toString(36).toUpperCase()}`;
      this.txnCount++;
      this.totalRevenue += payment.data?.merchantNetCents || total;
      
      if (this.cfg.hasKDS) {
        this.kdsQueue.unshift({
          id: orderNum,
          items: this.cart.map(c => `${c.qty}× ${c.n}`),
          table: document.getElementById('posTable')?.value || '—',
          time: new Date().toLocaleTimeString(),
          status: 'NEW'
        });
        this.renderKDS();
      }

      this.orders.unshift({ id: orderNum, total, items: [...this.cart], time: new Date().toLocaleTimeString(), method });
      this.cart = [];
      this.renderCart();
      this.renderGrid();
      this.updateStats();
      this.sound('success');
      this.toast(`✅ ${orderNum} — $${(total / 100).toFixed(2)}`, 'success');
      this.renderReceipt(orderNum, total, method);

    } catch (e) {
      this.toast(`❌ ${e.message}`, 'error');
    }
    btn.disabled = false; btn.textContent = '💳 CHARGE';
  },

  // ─── KDS ───────────────────────────────────────────────────────
  renderKDS() {
    const el = document.getElementById('kdsPanel');
    if (!el) return;
    el.innerHTML = this.kdsQueue.slice(0, 6).map((o, i) => `
      <div class="kds-ticket ${o.status.toLowerCase()}">
        <div class="kds-head">
          <span class="kds-num">${o.id}</span>
          <span class="kds-time">${o.time}</span>
        </div>
        <div class="kds-table">Table ${o.table}</div>
        <div class="kds-items">${o.items.join('<br>')}</div>
        <div class="kds-actions">
          ${o.status === 'NEW' ? `<button class="kds-btn start" onclick="POS.kdsUpdate(${i},'COOKING')">🔥 Start</button>` : ''}
          ${o.status === 'COOKING' ? `<button class="kds-btn done" onclick="POS.kdsUpdate(${i},'READY')">✅ Ready</button>` : ''}
          ${o.status === 'READY' ? `<span class="kds-badge ready">🔔 READY</span>` : ''}
        </div>
      </div>`).join('');
  },

  kdsUpdate(i, status) {
    if (this.kdsQueue[i]) { this.kdsQueue[i].status = status; this.renderKDS(); this.sound(status === 'READY' ? 'bell' : 'click'); }
  },

  // ─── TABLE MAP ─────────────────────────────────────────────────
  showTableMap() {
    const el = document.getElementById('tableMap');
    if (el.style.display === 'grid') { el.style.display = 'none'; return; }
    el.style.display = 'grid';
    const tables = Array.from({ length: 12 }, (_, i) => i + 1);
    el.innerHTML = tables.map(t => {
      const occupied = this.orders.some(o => o.table === String(t) && Date.now() - new Date().getTime() < 3600000);
      return `<button class="table-btn${occupied ? ' occupied' : ''}" onclick="POS.selectTable(${t})">${t}</button>`;
    }).join('');
  },

  selectTable(t) {
    const el = document.getElementById('posTable');
    if (el) el.value = t;
    document.getElementById('tableMap').style.display = 'none';
    this.toast(`Table ${t} selected`);
  },

  // ─── SPLIT CHECK ───────────────────────────────────────────────
  showSplitCheck() {
    if (!this.cart.length) { this.toast('Add items first'); return; }
    const total = this.getTotal();
    const el = document.getElementById('splitModal');
    el.style.display = 'flex';
    document.getElementById('splitTotal').textContent = `$${(total / 100).toFixed(2)}`;
    document.getElementById('splitCount').value = 2;
    this.calcSplit();
  },

  calcSplit() {
    const n = parseInt(document.getElementById('splitCount').value) || 2;
    const total = this.getTotal();
    const per = Math.ceil(total / n);
    document.getElementById('splitPer').textContent = `$${(per / 100).toFixed(2)} each`;
    document.getElementById('splitBreakdown').innerHTML = Array.from({ length: n }, (_, i) =>
      `<div class="split-row">Guest ${i + 1}: <strong>$${(per / 100).toFixed(2)}</strong></div>`
    ).join('');
  },

  closeSplit() { document.getElementById('splitModal').style.display = 'none'; },

  // ─── BARCODE SCANNER ──────────────────────────────────────────
  showScanner() {
    const el = document.getElementById('scanModal');
    el.style.display = 'flex';
    document.getElementById('barcodeInput').value = '';
    document.getElementById('barcodeInput').focus();
  },

  processBarcode() {
    const code = document.getElementById('barcodeInput').value.trim();
    if (!code) return;
    // Simulate lookup — match by first few chars of item name
    const item = this.cfg.items.find(i => i.n.toLowerCase().replace(/\s/g, '').includes(code.toLowerCase().replace(/\s/g, '')));
    if (item) {
      const idx = this.cfg.items.indexOf(item);
      this.addItem(idx);
      this.toast(`Scanned: ${item.n}`);
    } else {
      this.toast(`Item not found: ${code}`, 'error');
    }
    document.getElementById('scanModal').style.display = 'none';
  },

  closeScanner() { document.getElementById('scanModal').style.display = 'none'; },

  // ─── AGE VERIFICATION ─────────────────────────────────────────
  showAgeVerify(callback) {
    const el = document.getElementById('ageModal');
    el.style.display = 'flex';
    this._ageCallback = callback;
  },

  confirmAge(verified) {
    document.getElementById('ageModal').style.display = 'none';
    if (verified && this._ageCallback) this._ageCallback();
    else if (!verified) this.toast('Sale declined — ID required', 'error');
  },

  // ─── RECEIPT ───────────────────────────────────────────────────
  renderReceipt(orderNum, total, method) {
    const el = document.getElementById('receiptModal');
    if (!el) return;
    el.style.display = 'flex';
    document.getElementById('receiptContent').innerHTML = `
      <div style="text-align:center;font-family:monospace;font-size:12px;line-height:1.8">
        <div style="font-size:16px;font-weight:700">${this.cfg.storeName}</div>
        <div style="color:var(--muted)">${new Date().toLocaleString()}</div>
        <div style="border-top:1px dashed rgba(255,255,255,.15);margin:8px 0"></div>
        <div style="font-weight:700">Order: ${orderNum}</div>
        ${this.orders[0]?.items.map(c => `<div>${c.qty}× ${this.sn(c.n)} — $${(c.p * c.qty / 100).toFixed(2)}</div>`).join('')}
        <div style="border-top:1px dashed rgba(255,255,255,.15);margin:8px 0"></div>
        <div style="font-size:18px;font-weight:800">TOTAL: $${(total / 100).toFixed(2)}</div>
        <div>Paid via: ${method}</div>
        <div style="margin-top:8px;color:var(--muted)">Thank you! Powered by PaySurity</div>
      </div>`;
  },

  closeReceipt() { document.getElementById('receiptModal').style.display = 'none'; },

  // ─── STATS ─────────────────────────────────────────────────────
  updateStats() {
    const el1 = document.getElementById('statTxn'); if (el1) el1.textContent = this.txnCount;
    const el2 = document.getElementById('statRev'); if (el2) el2.textContent = `$${(this.totalRevenue / 100).toFixed(2)}`;
    const el3 = document.getElementById('statAvg'); if (el3) el3.textContent = this.txnCount ? `$${(this.totalRevenue / this.txnCount / 100).toFixed(2)}` : '$0.00';
  },

  // ─── UTILITY ───────────────────────────────────────────────────
  sn(s) { return String(s).replace(/[<>"'&]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c])); },

  toast(msg, type) {
    const t = document.getElementById('posToast');
    t.textContent = msg;
    t.className = 'pos-toast show ' + (type || '');
    setTimeout(() => t.className = 'pos-toast', 2800);
  },

  sound(type) {
    // Minimal audio feedback via Web Audio API
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      gain.gain.value = 0.05;
      osc.frequency.value = type === 'success' ? 880 : type === 'bell' ? 1200 : type === 'error' ? 300 : 600;
      osc.start(); setTimeout(() => { osc.stop(); ctx.close(); }, type === 'bell' ? 200 : 80);
    } catch {}
  },

  // ─── INIT ──────────────────────────────────────────────────────
  init(cfg) {
    this.cfg = cfg;
    this.currentCat = 'All';
    this.renderCats();
    this.renderGrid();
    this.renderCart();
    this.updateStats();
    if (cfg.hasKDS) this.renderKDS();
    // Clock
    setInterval(() => {
      const el = document.getElementById('posClock');
      if (el) el.textContent = new Date().toLocaleTimeString();
    }, 1000);
  }
};
