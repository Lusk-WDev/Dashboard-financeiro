// Este array simula um banco de dados de transações financeiras
const transacoesIniciais = [
    {
        id: 1,
        descricao: "Salário",
        valor: 2500.00,
        tipo: "entrada",
        categoria: "Trabalho"
    },
    {
        id: 2,
        descricao: "Compras do Mercado",
        valor: 350.00,
        tipo: "saida",
        categoria: "Compras e Alimentação"
    },
    {
        id: 3,
        descricao: "Mensalidade da Universidade",
        valor: 600.00,
        tipo: "saida",
        categoria: "Educação"
    },
    {
        id: 4,
        descricao: "Venda Monitor Philips",
        valor: 800.00,
        tipo: "entrada",
        categoria: "Vendas"
}
];

export default transacoesIniciais;