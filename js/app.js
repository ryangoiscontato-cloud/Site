/* =============================
   ULTRALIGHT — SISTEMA DE ESTOQUE
   Lógica principal
   ============================= */

'use strict';

// ─── STATE ───────────────────────────────────────────────────────────────────

const DB = {
    get produtos() { return JSON.parse(localStorage.getItem('ul_produtos') || '[]'); },
    set produtos(v) { localStorage.setItem('ul_produtos', JSON.stringify(v)); },
    get historico() { return JSON.parse(localStorage.getItem('ul_historico') || '[]'); },
    set historico(v) { localStorage.setItem('ul_historico', JSON.stringify(v)); },
};

// ─── UTILS ───────────────────────────────────────────────────────────────────

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function today() {
    return new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

// ─── TOAST ───────────────────────────────────────────────────────────────────

const ICONS = {
    success: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
    error:   `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
    warning: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
    info:    `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`,
};

function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `${ICONS[type]}<span>${msg}</span><div class="toast-progress"></div>`;
    document.getElementById('toastContainer').appendChild(el);
    setTimeout(() => {
        el.style.animation = 'none';
        el.style.opacity = '0';
        el.style.transform = 'translateX(100%)';
        el.style.transition = 'all .3s ease';
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

// ─── MODALS ──────────────────────────────────────────────────────────────────

function openModal(id) {
    const el = document.getElementById(id);
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    const el = document.getElementById(id);
    el.classList.remove('open');
    document.body.style.overflow = '';
}

document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal(overlay.id);
    });
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
    }
});

// ─── TABS ────────────────────────────────────────────────────────────────────

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
});

// ─── RENDER HELPERS ──────────────────────────────────────────────────────────

function getStatusBadge(produto) {
    if (produto.saldo === 0) return `<span class="badge badge-zerado">Zerado</span>`;
    if (produto.estoqueMin > 0 && produto.saldo <= produto.estoqueMin)
        return `<span class="badge badge-baixo">Estoque baixo</span>`;
    return `<span class="badge badge-ok">Normal</span>`;
}

function getQtyClass(produto) {
    if (produto.saldo === 0) return 'qty-display qty-zero';
    if (produto.estoqueMin > 0 && produto.saldo <= produto.estoqueMin) return 'qty-display qty-low';
    return 'qty-display';
}

// ─── POPULATE SELECT DROPDOWNS ───────────────────────────────────────────────

function populateSelects() {
    const produtos = DB.produtos;
    const opts = `<option value="">— Selecione um produto —</option>` +
        produtos.map(p => `<option value="${p.id}">${p.nome} (${p.codigo})</option>`).join('');
    document.getElementById('entradaProduto').innerHTML = opts;
    document.getElementById('saidaProduto').innerHTML = opts;

    // Categorias filter
    const cats = [...new Set(produtos.map(p => p.categoria).filter(Boolean))];
    const catOpts = `<option value="">Todas as categorias</option>` +
        cats.map(c => `<option value="${c}">${c}</option>`).join('');
    document.getElementById('filterCategoria').innerHTML = catOpts;
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function renderDashboard() {
    const produtos = DB.produtos;
    const historico = DB.historico;
    const hoje = new Date().toDateString();

    document.getElementById('currentDate').textContent = capitalize(today());
    document.getElementById('statTotalProdutos').textContent = produtos.length;
    document.getElementById('statItensEstoque').textContent = produtos.reduce((s, p) => s + p.saldo, 0);

    const baixo = produtos.filter(p => p.saldo === 0 || (p.estoqueMin > 0 && p.saldo <= p.estoqueMin));
    document.getElementById('statEstoqueBaixo').textContent = baixo.length;

    const movHoje = historico.filter(h => new Date(h.data).toDateString() === hoje);
    document.getElementById('statMovimentos').textContent = movHoje.length;

    // Recent movements (last 8)
    const recent = [...historico].reverse().slice(0, 8);
    const tbody = document.getElementById('tbodyRecentes');
    if (recent.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="4">Nenhum movimento registrado</td></tr>`;
    } else {
        tbody.innerHTML = recent.map(h => `
            <tr>
                <td>${h.produtoNome}</td>
                <td><span class="badge badge-${h.tipo}">${h.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span></td>
                <td><strong>${h.tipo === 'entrada' ? '+' : '-'}${h.qtd}</strong></td>
                <td style="color:var(--gray-400);font-size:.8rem">${fmtDate(h.data)}</td>
            </tr>`).join('');
    }

    // Low stock alerts
    const alertas = document.getElementById('alertasBaixoEstoque');
    if (baixo.length === 0) {
        alertas.innerHTML = `<p class="empty-msg">Nenhum alerta de estoque baixo</p>`;
    } else {
        alertas.innerHTML = baixo.map(p => {
            const cls = p.saldo === 0 ? 'alert-zerado' : 'alert-baixo';
            const msg = p.saldo === 0 ? 'Estoque zerado!' : `Saldo: ${p.saldo} ${p.unidade}`;
            return `<div class="alert-item ${cls}">
                <strong>${p.nome}</strong>
                <span>${msg}</span>
            </div>`;
        }).join('');
    }
}

// ─── SALDO DE ESTOQUE ─────────────────────────────────────────────────────────

function renderSaldo(search = '', categoria = '') {
    let produtos = DB.produtos;
    if (search) {
        const q = search.toLowerCase();
        produtos = produtos.filter(p => p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q));
    }
    if (categoria) produtos = produtos.filter(p => p.categoria === categoria);

    const tbody = document.getElementById('tbodySaldo');
    if (produtos.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="7">Nenhum produto encontrado</td></tr>`;
        return;
    }
    tbody.innerHTML = produtos.map(p => `
        <tr>
            <td><span class="code-tag">${p.codigo}</span></td>
            <td><strong>${p.nome}</strong></td>
            <td>${p.categoria || '<span style="color:var(--gray-400)">—</span>'}</td>
            <td>${p.unidade}</td>
            <td>${p.estoqueMin}</td>
            <td><span class="${getQtyClass(p)}">${p.saldo} ${p.unidade}</span></td>
            <td>${getStatusBadge(p)}</td>
        </tr>`).join('');
}

document.getElementById('searchSaldo').addEventListener('input', e => {
    renderSaldo(e.target.value, document.getElementById('filterCategoria').value);
});
document.getElementById('filterCategoria').addEventListener('change', e => {
    renderSaldo(document.getElementById('searchSaldo').value, e.target.value);
});

// ─── PRODUTOS ────────────────────────────────────────────────────────────────

function renderProdutos() {
    const produtos = DB.produtos;
    const tbody = document.getElementById('tbodyProdutos');
    if (produtos.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="7">Nenhum produto cadastrado. Clique em "Novo Produto" para começar.</td></tr>`;
        return;
    }
    tbody.innerHTML = produtos.map(p => `
        <tr id="row-${p.id}">
            <td><span class="code-tag">${p.codigo}</span></td>
            <td><strong>${p.nome}</strong></td>
            <td>${p.categoria || '<span style="color:var(--gray-400)">—</span>'}</td>
            <td>${p.unidade}</td>
            <td>${p.estoqueMin}</td>
            <td><span class="${getQtyClass(p)}">${p.saldo} ${p.unidade}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-icon-edit" title="Editar" onclick="editarProduto('${p.id}')">
                        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                    </button>
                    <button class="btn-icon btn-icon-delete" title="Excluir" onclick="confirmarExcluir('${p.id}')">
                        <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                    </button>
                </div>
            </td>
        </tr>`).join('');
}

// Novo produto
document.getElementById('btnNovoProduto').addEventListener('click', () => {
    document.getElementById('modalProdutoTitulo').textContent = 'Novo Produto';
    document.getElementById('produtoEditId').value = '';
    document.getElementById('produtoCodigo').value = 'PRD-' + String(DB.produtos.length + 1).padStart(3, '0');
    document.getElementById('produtoNome').value = '';
    document.getElementById('produtoCategoria').value = '';
    document.getElementById('produtoUnidade').value = 'un';
    document.getElementById('produtoEstoqueMin').value = '0';
    document.getElementById('produtoSaldoInicial').value = '0';
    document.getElementById('produtoSaldoInicial').disabled = false;
    clearFormErrors('modalProduto');
    openModal('modalProduto');
});

// Editar produto
window.editarProduto = function(id) {
    const produtos = DB.produtos;
    const p = produtos.find(x => x.id === id);
    if (!p) return;
    document.getElementById('modalProdutoTitulo').textContent = 'Editar Produto';
    document.getElementById('produtoEditId').value = p.id;
    document.getElementById('produtoCodigo').value = p.codigo;
    document.getElementById('produtoNome').value = p.nome;
    document.getElementById('produtoCategoria').value = p.categoria || '';
    document.getElementById('produtoUnidade').value = p.unidade;
    document.getElementById('produtoEstoqueMin').value = p.estoqueMin;
    document.getElementById('produtoSaldoInicial').value = p.saldo;
    document.getElementById('produtoSaldoInicial').disabled = true;
    clearFormErrors('modalProduto');
    openModal('modalProduto');
};

// Salvar produto
document.getElementById('btnSalvarProduto').addEventListener('click', () => {
    const codigo   = document.getElementById('produtoCodigo').value.trim();
    const nome     = document.getElementById('produtoNome').value.trim();
    const categoria= document.getElementById('produtoCategoria').value.trim();
    const unidade  = document.getElementById('produtoUnidade').value;
    const estMin   = parseInt(document.getElementById('produtoEstoqueMin').value) || 0;
    const saldoIni = parseInt(document.getElementById('produtoSaldoInicial').value) || 0;
    const editId   = document.getElementById('produtoEditId').value;

    clearFormErrors('modalProduto');
    let valid = true;

    if (!codigo) { setError('produtoCodigo', 'Código obrigatório'); valid = false; }
    if (!nome)   { setError('produtoNome',   'Nome obrigatório');   valid = false; }
    if (!valid) return;

    const produtos = DB.produtos;

    if (editId) {
        const idx = produtos.findIndex(p => p.id === editId);
        if (idx === -1) return;
        // Check duplicate code
        if (produtos.some(p => p.codigo === codigo && p.id !== editId)) {
            setError('produtoCodigo', 'Código já existe'); return;
        }
        produtos[idx] = { ...produtos[idx], codigo, nome, categoria, unidade, estoqueMin: estMin };
        DB.produtos = produtos;
        toast(`Produto "${nome}" atualizado!`, 'success');
    } else {
        // Check duplicate code
        if (produtos.some(p => p.codigo === codigo)) {
            setError('produtoCodigo', 'Código já existe'); return;
        }
        const novo = { id: uid(), codigo, nome, categoria, unidade, estoqueMin: estMin, saldo: saldoIni };
        produtos.push(novo);
        DB.produtos = produtos;
        // Register initial stock as entry if > 0
        if (saldoIni > 0) {
            const historico = DB.historico;
            historico.push({ id: uid(), produtoId: novo.id, produtoNome: nome, tipo: 'entrada', qtd: saldoIni, obs: 'Saldo inicial', data: new Date().toISOString() });
            DB.historico = historico;
        }
        toast(`Produto "${nome}" cadastrado!`, 'success');
    }

    closeModal('modalProduto');
    refreshAll();
});

// ─── CONFIRMAR EXCLUSÃO ───────────────────────────────────────────────────────

let pendingDeleteId = null;

window.confirmarExcluir = function(id) {
    const p = DB.produtos.find(x => x.id === id);
    if (!p) return;
    pendingDeleteId = id;
    document.getElementById('msgExcluir').textContent = `Tem certeza que deseja excluir o produto "${p.nome}"? O histórico de movimentos será mantido.`;
    openModal('modalExcluir');
};

document.getElementById('btnConfirmarExcluir').addEventListener('click', () => {
    if (!pendingDeleteId) return;
    const produtos = DB.produtos.filter(p => p.id !== pendingDeleteId);
    DB.produtos = produtos;
    pendingDeleteId = null;
    closeModal('modalExcluir');
    toast('Produto excluído!', 'warning');
    refreshAll();
});

// ─── ENTRADA ─────────────────────────────────────────────────────────────────

document.getElementById('btnEntrada').addEventListener('click', () => {
    if (DB.produtos.length === 0) { toast('Cadastre ao menos um produto primeiro!', 'warning'); return; }
    document.getElementById('entradaProduto').value = '';
    document.getElementById('entradaQtd').value = '';
    document.getElementById('entradaObs').value = '';
    document.getElementById('entradaInfoProduto').style.display = 'none';
    clearFormErrors('modalEntrada');
    openModal('modalEntrada');
});

document.getElementById('entradaProduto').addEventListener('change', e => {
    const id = e.target.value;
    if (!id) { document.getElementById('entradaInfoProduto').style.display = 'none'; return; }
    const p = DB.produtos.find(x => x.id === id);
    if (!p) return;
    document.getElementById('entradaSaldoAtual').textContent = p.saldo + ' ' + p.unidade;
    document.getElementById('entradaUnidade').textContent = p.unidade;
    document.getElementById('entradaInfoProduto').style.display = 'block';
});

document.getElementById('btnConfirmarEntrada').addEventListener('click', () => {
    const prodId = document.getElementById('entradaProduto').value;
    const qtd    = parseInt(document.getElementById('entradaQtd').value);
    const obs    = document.getElementById('entradaObs').value.trim();

    clearFormErrors('modalEntrada');
    let valid = true;
    if (!prodId)    { setError('entradaProduto', 'Selecione um produto'); valid = false; }
    if (!qtd || qtd <= 0) { setError('entradaQtd', 'Informe uma quantidade válida'); valid = false; }
    if (!valid) return;

    const produtos = DB.produtos;
    const idx = produtos.findIndex(p => p.id === prodId);
    if (idx === -1) return;

    produtos[idx].saldo += qtd;
    DB.produtos = produtos;

    const historico = DB.historico;
    historico.push({ id: uid(), produtoId: prodId, produtoNome: produtos[idx].nome, tipo: 'entrada', qtd, obs, data: new Date().toISOString() });
    DB.historico = historico;

    toast(`Entrada de ${qtd} ${produtos[idx].unidade} de "${produtos[idx].nome}" registrada!`, 'success');
    closeModal('modalEntrada');
    refreshAll();
    highlightProduct(prodId);
});

// ─── SAÍDA ───────────────────────────────────────────────────────────────────

document.getElementById('btnSaida').addEventListener('click', () => {
    if (DB.produtos.length === 0) { toast('Cadastre ao menos um produto primeiro!', 'warning'); return; }
    document.getElementById('saidaProduto').value = '';
    document.getElementById('saidaQtd').value = '';
    document.getElementById('saidaObs').value = '';
    document.getElementById('saidaInfoProduto').style.display = 'none';
    clearFormErrors('modalSaida');
    openModal('modalSaida');
});

document.getElementById('saidaProduto').addEventListener('change', e => {
    const id = e.target.value;
    if (!id) { document.getElementById('saidaInfoProduto').style.display = 'none'; return; }
    const p = DB.produtos.find(x => x.id === id);
    if (!p) return;
    document.getElementById('saidaSaldoAtual').textContent = p.saldo + ' ' + p.unidade;
    document.getElementById('saidaUnidade').textContent = p.unidade;
    document.getElementById('saidaInfoProduto').style.display = 'block';
});

document.getElementById('btnConfirmarSaida').addEventListener('click', () => {
    const prodId = document.getElementById('saidaProduto').value;
    const qtd    = parseInt(document.getElementById('saidaQtd').value);
    const obs    = document.getElementById('saidaObs').value.trim();

    clearFormErrors('modalSaida');
    let valid = true;
    if (!prodId)    { setError('saidaProduto', 'Selecione um produto'); valid = false; }
    if (!qtd || qtd <= 0) { setError('saidaQtd', 'Informe uma quantidade válida'); valid = false; }
    if (!valid) return;

    const produtos = DB.produtos;
    const idx = produtos.findIndex(p => p.id === prodId);
    if (idx === -1) return;

    if (qtd > produtos[idx].saldo) {
        setError('saidaQtd', `Saldo insuficiente. Disponível: ${produtos[idx].saldo} ${produtos[idx].unidade}`);
        return;
    }

    produtos[idx].saldo -= qtd;
    DB.produtos = produtos;

    const historico = DB.historico;
    historico.push({ id: uid(), produtoId: prodId, produtoNome: produtos[idx].nome, tipo: 'saida', qtd, obs, data: new Date().toISOString() });
    DB.historico = historico;

    toast(`Saída de ${qtd} ${produtos[idx].unidade} de "${produtos[idx].nome}" registrada!`, 'success');
    closeModal('modalSaida');
    refreshAll();
    highlightProduct(prodId);
});

// ─── HISTÓRICO ───────────────────────────────────────────────────────────────

function renderHistorico(search = '', tipo = '') {
    let hist = [...DB.historico].reverse();
    if (search) {
        const q = search.toLowerCase();
        hist = hist.filter(h => h.produtoNome.toLowerCase().includes(q));
    }
    if (tipo) hist = hist.filter(h => h.tipo === tipo);

    const tbody = document.getElementById('tbodyHistorico');
    if (hist.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="6">Nenhum movimento encontrado</td></tr>`;
        return;
    }
    tbody.innerHTML = hist.map((h, i) => `
        <tr>
            <td style="color:var(--gray-400);font-size:.8rem">#${h.id.slice(-4).toUpperCase()}</td>
            <td><strong>${h.produtoNome}</strong></td>
            <td><span class="badge badge-${h.tipo}">${h.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span></td>
            <td><strong style="color:${h.tipo === 'entrada' ? 'var(--green-600)' : 'var(--red-600)'}">${h.tipo === 'entrada' ? '+' : '-'}${h.qtd}</strong></td>
            <td style="color:var(--gray-500);font-size:.85rem">${h.obs || '—'}</td>
            <td style="color:var(--gray-400);font-size:.8rem;white-space:nowrap">${fmtDate(h.data)}</td>
        </tr>`).join('');
}

document.getElementById('searchHistorico').addEventListener('input', e => {
    renderHistorico(e.target.value, document.getElementById('filterTipo').value);
});
document.getElementById('filterTipo').addEventListener('change', e => {
    renderHistorico(document.getElementById('searchHistorico').value, e.target.value);
});

document.getElementById('btnLimparHistorico').addEventListener('click', () => {
    if (!confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) return;
    DB.historico = [];
    renderHistorico();
    renderDashboard();
    toast('Histórico limpo!', 'warning');
});

// ─── FORM VALIDATION HELPERS ─────────────────────────────────────────────────

function setError(fieldId, msg) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.classList.add('error');
    let err = el.nextElementSibling;
    if (!err || !err.classList.contains('field-error')) {
        err = document.createElement('small');
        err.className = 'field-error form-hint';
        err.style.color = 'var(--red-600)';
        el.parentNode.insertBefore(err, el.nextSibling);
    }
    err.textContent = msg;
}

function clearFormErrors(modalId) {
    document.getElementById(modalId).querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
    });
    document.getElementById(modalId).querySelectorAll('.field-error').forEach(el => el.remove());
}

// ─── HIGHLIGHT ROW ────────────────────────────────────────────────────────────

function highlightProduct(prodId) {
    const row = document.getElementById('row-' + prodId);
    if (row) {
        row.classList.remove('row-updated');
        void row.offsetWidth;
        row.classList.add('row-updated');
    }
}

// ─── REFRESH ALL ─────────────────────────────────────────────────────────────

function refreshAll() {
    populateSelects();
    renderDashboard();
    renderSaldo(
        document.getElementById('searchSaldo').value,
        document.getElementById('filterCategoria').value
    );
    renderProdutos();
    renderHistorico(
        document.getElementById('searchHistorico').value,
        document.getElementById('filterTipo').value
    );
}

// ─── SEED DATA (demo) ─────────────────────────────────────────────────────────

function seedIfEmpty() {
    if (DB.produtos.length > 0) return;
    const now = new Date().toISOString();
    const produtos = [
        { id: uid(), codigo: 'PRD-001', nome: 'Parafuso M6 x 25mm', categoria: 'Fixação',     unidade: 'un',  estoqueMin: 100, saldo: 450  },
        { id: uid(), codigo: 'PRD-002', nome: 'Cabo de Aço 3mm',     categoria: 'Cabos',       unidade: 'm',   estoqueMin: 50,  saldo: 120  },
        { id: uid(), codigo: 'PRD-003', nome: 'Tecido Ripstop Azul', categoria: 'Tecidos',     unidade: 'm²',  estoqueMin: 20,  saldo: 18   },
        { id: uid(), codigo: 'PRD-004', nome: 'Fivela de Ajuste',    categoria: 'Componentes', unidade: 'un',  estoqueMin: 50,  saldo: 0    },
        { id: uid(), codigo: 'PRD-005', nome: 'Resina Epóxi 500g',   categoria: 'Químicos',    unidade: 'un',  estoqueMin: 10,  saldo: 32   },
        { id: uid(), codigo: 'PRD-006', nome: 'Espuma EVA 10mm',     categoria: 'Espumas',     unidade: 'm²',  estoqueMin: 15,  saldo: 60   },
    ];
    DB.produtos = produtos;
    const hist = [
        { id: uid(), produtoId: produtos[0].id, produtoNome: produtos[0].nome, tipo: 'entrada', qtd: 500, obs: 'Compra inicial', data: new Date(Date.now() - 86400000*5).toISOString() },
        { id: uid(), produtoId: produtos[0].id, produtoNome: produtos[0].nome, tipo: 'saida',   qtd: 50,  obs: 'Montagem lote 01', data: new Date(Date.now() - 86400000*3).toISOString() },
        { id: uid(), produtoId: produtos[1].id, produtoNome: produtos[1].nome, tipo: 'entrada', qtd: 200, obs: 'Compra inicial', data: new Date(Date.now() - 86400000*4).toISOString() },
        { id: uid(), produtoId: produtos[1].id, produtoNome: produtos[1].nome, tipo: 'saida',   qtd: 80,  obs: 'Produção', data: new Date(Date.now() - 86400000*2).toISOString() },
        { id: uid(), produtoId: produtos[2].id, produtoNome: produtos[2].nome, tipo: 'entrada', qtd: 50,  obs: 'Compra fornecedor', data: new Date(Date.now() - 86400000*6).toISOString() },
        { id: uid(), produtoId: produtos[2].id, produtoNome: produtos[2].nome, tipo: 'saida',   qtd: 32,  obs: 'Corte produção', data: new Date(Date.now() - 86400000).toISOString() },
    ];
    DB.historico = hist;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

seedIfEmpty();
refreshAll();
