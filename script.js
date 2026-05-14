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

function criarDashboard(nome, cor = "#58a6ff") {
    if (!meusDashboards[nome]) {
        meusDashboards[nome] = { transacoes: [], cor: cor };
        dashboardAtual = nome;
        transacoes = meusDashboards[nome].transacoes;
        atualizarLocalStorage();
        init();
    }
}

function criarNovoDashboard() {
    const nome = prompt("Digite o nome do novo dashboard:");
    if (nome && nome.trim() !== "") {
        const cor = prompt("Escolha uma cor (ex: #ff0000):", "#58a6ff");
        criarDashboard(nome.trim(), cor || "#58a6ff");
    }
}

// Função de deletar dashboard
function deletarDashboard(nome) {
    if (!meusDashboards[nome]) return;
    const nomes = Object.keys(meusDashboards);
    if (nomes.length <= 1) {
        alert('É preciso manter ao menos um dashboard.');
        return;
    }
    if (!confirm(`Deseja excluir o dashboard "${nome}"?`)) return;

    delete meusDashboards[nome];

    if (dashboardAtual === nome) {
        dashboardAtual = Object.keys(meusDashboards)[0];
        transacoes = meusDashboards[dashboardAtual].transacoes;
    }

    atualizarLocalStorage();
    init();
}

// Expor funções globalmente para uso futuro
window.alternarDashboard = alternarDashboard;
window.criarDashboard = criarDashboard;
window.criarNovoDashboard = criarNovoDashboard;
window.deletarDashboard = deletarDashboard;

// 2. Selecionamos os elementos do HTML que o JS vai manipular (os "ganchos")
const listaTransacoes = document.getElementById('lista-transacoes');
const saldoDisplay = document.getElementById('saldo-total');
const entradasDisplay = document.getElementById('resumo-entradas');
const saidasDisplay = document.getElementById('resumo-saidas');
const formulario = document.getElementById('form-transacao');

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

        li.appendChild(button);
        li.appendChild(deleteBtn);
        lista.appendChild(li);
    });
}

// 5. Função de Inicialização
function init() {
    listaTransacoes.innerHTML = ''; // Limpamos a lista antes de começar
    transacoes.forEach(adicionarTransacaoAoDOM);
    atualizarBalanco();
    atualizarTitulo();
    renderizarDashboards();
}

// Função para atualizar o título do dashboard
function atualizarTitulo() {
    document.getElementById('titulo-dashboard').innerText = `Dashboard: ${dashboardAtual}`;
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

// Rodar a aplicação
init();