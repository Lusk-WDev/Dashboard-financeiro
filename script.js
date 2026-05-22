// 1. Importamos os dados simulados do nosso "banco de dados"
import transacoesIniciais from './data.js';

// Estrutura para múltiplos dashboards
const storageDashboards = JSON.parse(localStorage.getItem('meusDashboards'));
const defaultDashboards = {
    "Pessoal": { transacoes: [...transacoesIniciais], cor: "#58a6ff" },
    "Trabalho": { transacoes: [], cor: "#3fb950" },
    "Gamer": { transacoes: [], cor: "#f85149" }
};

function normalizarDashboards(data) {
    if (!data || typeof data !== 'object') return defaultDashboards;
    const normalized = {};
    Object.entries(data).forEach(([nome, valor]) => {
        if (Array.isArray(valor)) {
            normalized[nome] = { transacoes: valor, cor: '#58a6ff' };
        } else if (valor && typeof valor === 'object') {
            normalized[nome] = {
                transacoes: Array.isArray(valor.transacoes) ? valor.transacoes : [],
                cor: valor.cor || '#58a6ff'
            };
        } else {
            normalized[nome] = { transacoes: [], cor: '#58a6ff' };
        }
    });
    return normalized;
}

let meusDashboards = normalizarDashboards(storageDashboards);
let dashboardAtual = localStorage.getItem('dashboardAtual') || "Pessoal";
if (!meusDashboards[dashboardAtual]) {
    dashboardAtual = Object.keys(meusDashboards)[0];
}
let transacoes = meusDashboards[dashboardAtual].transacoes;

// Função para salvar no LocalStorage sempre que houver mudança
function atualizarLocalStorage() {
    meusDashboards[dashboardAtual].transacoes = transacoes;
    localStorage.setItem('meusDashboards', JSON.stringify(meusDashboards));
    localStorage.setItem('dashboardAtual', dashboardAtual);
}

// Funções para gerenciar dashboards
function alternarDashboard(nome) {
    if (meusDashboards[nome]) {
        dashboardAtual = nome;
        transacoes = meusDashboards[nome].transacoes;
        atualizarLocalStorage();
        init();
    }
}

function showDashboardMensagem(mensagem, erro = false) {
    dashboardMensagem.innerText = mensagem;
    dashboardMensagem.classList.toggle('erro', erro);
    if (!mensagem) return;
    setTimeout(() => {
        if (dashboardMensagem.innerText === mensagem) {
            dashboardMensagem.innerText = '';
        }
    }, 5000);
}

function criarDashboard(nome, cor = '#58a6ff') {
    const novoNome = nome?.trim();
    if (!novoNome) {
        showDashboardMensagem('Digite um nome válido para o dashboard.', true);
        return;
    }
    if (meusDashboards[novoNome]) {
        showDashboardMensagem('Já existe um dashboard com esse nome.', true);
        return;
    }

    meusDashboards[novoNome] = { transacoes: [], cor };
    dashboardAtual = novoNome;
    transacoes = meusDashboards[dashboardAtual].transacoes;
    atualizarLocalStorage();
    init();
    novoDashboardNomeInput.value = '';
    showDashboardMensagem(`Dashboard "${novoNome}" criado com sucesso.`);
}

function criarDashboardFromForm() {
    criarDashboard(novoDashboardNomeInput.value, novoDashboardCorInput.value);
}

function atualizarDashboardAtual() {
    const novoNome = renomearDashboardNomeInput.value.trim();
    const novaCor = dashboardCorAtualInput.value || '#58a6ff';

    if (!meusDashboards[dashboardAtual]) return;

    if (novoNome && novoNome !== dashboardAtual) {
        if (meusDashboards[novoNome]) {
            showDashboardMensagem('Já existe um dashboard com esse nome.', true);
            return;
        }
        const dados = meusDashboards[dashboardAtual];
        delete meusDashboards[dashboardAtual];
        dashboardAtual = novoNome;
        meusDashboards[dashboardAtual] = dados;
    }

    meusDashboards[dashboardAtual].cor = novaCor;
    transacoes = meusDashboards[dashboardAtual].transacoes;
    atualizarLocalStorage();
    init();
    showDashboardMensagem('Dashboard atualizado com sucesso.');
}

function atualizarDashboardEditor() {
    renomearDashboardNomeInput.value = dashboardAtual;
    const corAtual = meusDashboards[dashboardAtual].cor || '#58a6ff';
    dashboardCorAtualInput.value = corAtual;
    dashboardCorPreview.style.background = corAtual;
}

function atualizarCoresExistentes() {
    coresExistentesContainer.innerHTML = '';
    Object.entries(meusDashboards).forEach(([nome, valor]) => {
        const swatch = document.createElement('span');
        swatch.className = 'paleta-cor';
        swatch.style.background = valor.cor || '#58a6ff';
        swatch.title = nome;
        swatch.onclick = () => {
            novoDashboardCorInput.value = valor.cor || '#58a6ff';
            novoDashboardCorPreview.style.background = novoDashboardCorInput.value;
        };
        coresExistentesContainer.appendChild(swatch);
    });
}

function deletarDashboard(nome) {
    if (!meusDashboards[nome]) return;
    const nomes = Object.keys(meusDashboards);
    if (nomes.length <= 1) {
        showDashboardMensagem('É preciso manter ao menos um dashboard.', true);
        return;
    }

    delete meusDashboards[nome];

    if (dashboardAtual === nome) {
        dashboardAtual = Object.keys(meusDashboards)[0];
        transacoes = meusDashboards[dashboardAtual].transacoes;
    }

    atualizarLocalStorage();
    init();
    showDashboardMensagem(`Dashboard "${nome}" removido.`);
}

// 2. Selecionamos os elementos do HTML que o JS vai manipular (os "ganchos")
const listaTransacoes = document.getElementById('lista-transacoes');
const saldoDisplay = document.getElementById('saldo-total');
const entradasDisplay = document.getElementById('resumo-entradas');
const saidasDisplay = document.getElementById('resumo-saidas');
const formulario = document.getElementById('form-transacao');
const novoDashboardNomeInput = document.getElementById('novo-dashboard-nome');
const novoDashboardCorInput = document.getElementById('novo-dashboard-cor');
const novoDashboardCorPreview = document.getElementById('novo-dashboard-cor-preview');
const criarDashboardBtn = document.getElementById('criar-dashboard-btn');
const coresExistentesContainer = document.getElementById('cores-existentes');
const renomearDashboardNomeInput = document.getElementById('renomear-dashboard-nome');
const dashboardCorAtualInput = document.getElementById('dashboard-cor-atual');
const dashboardCorPreview = document.getElementById('dashboard-cor-preview');
const atualizarDashboardBtn = document.getElementById('atualizar-dashboard-btn');
const dashboardMensagem = document.getElementById('dashboard-mensagem');
const toggleDashboardBuilderBtn = document.getElementById('toggle-dashboard-builder');
const dashboardBuilder = document.querySelector('.dashboard-builder');

criarDashboardBtn.addEventListener('click', criarDashboardFromForm);
atualizarDashboardBtn.addEventListener('click', atualizarDashboardAtual);
novoDashboardCorInput.addEventListener('input', () => {
    novoDashboardCorPreview.style.background = novoDashboardCorInput.value;
});
dashboardCorAtualInput.addEventListener('input', () => {
    dashboardCorPreview.style.background = dashboardCorAtualInput.value;
});
toggleDashboardBuilderBtn.addEventListener('click', () => {
    dashboardBuilder.classList.toggle('hidden');
    toggleDashboardBuilderBtn.textContent = dashboardBuilder.classList.contains('hidden') ? 'Mostrar' : 'Configurar';
});

// 3. Função para renderizar as transações na tela
function adicionarTransacaoAoDOM(transacao) {
    const classe = transacao.tipo === 'entrada' ? 'entrada' : 'saida';
    const item = document.createElement('li');
    item.classList.add('transacao-item', classe);

    item.innerHTML = `
        <span>${transacao.descricao}</span>
        <span>
            ${transacao.tipo === 'entrada' ? '+' : '-'} R$ ${Math.abs(transacao.valor).toFixed(2)}
            <button class="delete-btn" onclick="removerTransacao(${transacao.id})">x</button>
        </span>
    `;

    listaTransacoes.appendChild(item);
}

// ATUALIZE sua função de remover
window.removerTransacao = (id) => {
    transacoes = transacoes.filter(t => t.id !== id);
    meusDashboards[dashboardAtual].transacoes = transacoes;
    atualizarLocalStorage(); // Salva a remoção
    init();
};

// 4. Função para atualizar os valores do cabeçalho (Saldo, Entradas e Saídas)
function atualizarBalanco() {
    // Somamos todas as entradas
    const totalEntradas = transacoes
        .filter(t => t.tipo === 'entrada')
        .reduce((acc, t) => acc + t.valor, 0);

    // Somamos todas as saídas
    const totalSaidas = transacoes
        .filter(t => t.tipo === 'saida')
        .reduce((acc, t) => acc + t.valor, 0);

    const saldoFinal = totalEntradas - totalSaidas;

    // Atualizamos o texto no HTML formatando para moeda brasileira
    saldoDisplay.innerText = `R$ ${saldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    entradasDisplay.innerText = `R$ ${totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    saidasDisplay.innerText = `R$ ${totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

// Função para renderizar a lista de dashboards na sidebar
function renderizarDashboards() {
    const lista = document.getElementById('lista-dashboards');
    lista.innerHTML = '';
    Object.keys(meusDashboards).forEach(nome => {
        const li = document.createElement('li');
        li.classList.add('dashboard-row');

        const cor = meusDashboards[nome].cor || '#58a6ff';
        const colorSwatch = document.createElement('span');
        colorSwatch.className = 'dashboard-color-swatch';
        colorSwatch.style.background = cor;
        colorSwatch.title = `${nome} - ${cor}`;
        colorSwatch.onclick = () => alternarDashboard(nome);

        const button = document.createElement('button');
        button.className = 'dashboard-btn';
        if (nome === dashboardAtual) button.classList.add('ativo');
        button.style.background = cor;
        button.style.borderColor = cor;
        button.textContent = nome;
        button.onclick = () => alternarDashboard(nome);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-dashboard-btn';
        deleteBtn.textContent = '✕';
        deleteBtn.title = `Excluir dashboard ${nome}`;
        deleteBtn.onclick = (event) => {
            event.stopPropagation();
            deletarDashboard(nome);
        };

        li.appendChild(colorSwatch);
        li.appendChild(button);
        li.appendChild(deleteBtn);
        lista.appendChild(li);
    });

    atualizarCoresExistentes();
}

// 5. Função de Inicialização
function init() {
    listaTransacoes.innerHTML = ''; // Limpamos a lista antes de começar
    transacoes.forEach(adicionarTransacaoAoDOM);
    atualizarBalanco();
    atualizarTitulo();
    atualizarDashboardEditor();
    renderizarDashboards();
}

// Função para atualizar o título do dashboard
function atualizarTitulo() {
    document.getElementById('titulo-dashboard').innerText = dashboardAtual;
}

// ATUALIZE o evento de submit do formulário
formulario.addEventListener('submit', (event) => {
    event.preventDefault();

    const novaTransacao = {
        id: Math.floor(Math.random() * 10000),
        descricao: document.getElementById('descricao').value,
        valor: parseFloat(document.getElementById('valor').value),
        tipo: document.getElementById('tipo').value
    };

    transacoes.push(novaTransacao);
    meusDashboards[dashboardAtual].transacoes = transacoes;
    atualizarLocalStorage(); // Salva a nova transação
    init();
    formulario.reset();
});

// Atualização para testar a assinatura do Git
// Rodar a aplicação
init();