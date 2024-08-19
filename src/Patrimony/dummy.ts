import {
  MovementationFile,
  PatrimonyInfo,
  Movementation,
  Patrimonio,
} from "./types"; // Ajuste o caminho conforme necessário

export const movimentacaoDetailsList: PatrimonyInfo[] = [
  {
    gerente: "Ana Silva",
    projeto: "Projeto Alpha",
    responsavel: "Carlos Pereira",
    id_patrimonio: 1,
    patrimonio: "Computador Dell Inspiron",
    descricao: "Computador de mesa com processador Intel i7",
    numeroMovimentacao: 1,
    dataMovimentacao: "2024-01-20",
    nome: ""
  },
  {
    gerente: "João Santos",
    projeto: "Projeto Beta",
    responsavel: "Maria Oliveira",
    id_patrimonio: 2,
    patrimonio: "Impressora HP LaserJet",
    descricao: "Impressora a laser com capacidade para 30 páginas por minuto",
    numeroMovimentacao: 2,
    dataMovimentacao: "2024-02-25",
    nome: ""
  },
  {
    gerente: "Fernanda Costa",
    projeto: "Projeto Gamma",
    responsavel: "Lucas Almeida",
    id_patrimonio: 3,
    patrimonio: "Projetor Epson EB-X27",
    descricao: "Projetor de alta resolução com 3000 lúmens",
    numeroMovimentacao: 3,
    dataMovimentacao: "2024-03-15",
    nome: ""
  },
  {
    gerente: "Roberto Lima",
    projeto: "Projeto Delta",
    responsavel: "Juliana Souza",
    id_patrimonio: 4,
    patrimonio: "Mesa de Escritório de Madeira",
    descricao: "Mesa de escritório com gavetas e acabamento em madeira",
    numeroMovimentacao: 4,
    dataMovimentacao: "2024-04-17",
    nome: ""
  },
  {
    gerente: "Patrícia Mendes",
    projeto: "Projeto Epsilon",
    responsavel: "Ricardo Santos",
    id_patrimonio: 5,
    patrimonio: "Cadeira Ergonomica Ajustável",
    descricao: "Cadeira com ajuste de altura e apoio para os braços",
    numeroMovimentacao: 5,
    dataMovimentacao: "2024-05-08",
    nome: ""
  },
  {
    gerente: "Marcelo Fernandes",
    projeto: "Projeto Zeta",
    responsavel: "Beatriz Castro",
    id_patrimonio: 1,
    patrimonio: "Notebook Lenovo ThinkPad",
    descricao: "Notebook com processador Intel i5 e 16GB de RAM",
    numeroMovimentacao: 6,
    dataMovimentacao: "2024-06-23",
    nome: ""
  },
  {
    gerente: "Cláudia Rocha",
    projeto: "Projeto Eta",
    responsavel: "Eduardo Lima",
    id_patrimonio: 2,
    patrimonio: 'Televisão Samsung 50" UHD',
    descricao: "Televisão de 50 polegadas com resolução 4K",
    numeroMovimentacao: 7,
    dataMovimentacao: "2024-07-25",
    nome: ""
  },
  {
    gerente: "André Oliveira",
    projeto: "Projeto Theta",
    responsavel: "Sofia Almeida",
    id_patrimonio: 3,
    patrimonio: "Câmera Canon EOS 80D",
    descricao: "Câmera digital com lente de 18-55mm",
    numeroMovimentacao: 8,
    dataMovimentacao: "2024-08-05",
    nome: ""
  },
  {
    gerente: "Juliana Pinto",
    projeto: "Projeto Iota",
    responsavel: "Felipe Martins",
    id_patrimonio: 4,
    patrimonio: "Telefone IP Cisco 8800",
    descricao: "Telefone com suporte a VoIP e tela colorida",
    numeroMovimentacao: 9,
    dataMovimentacao: "2024-09-14",
    nome: ""
  },
  {
    gerente: "Ricardo Costa",
    projeto: "Projeto Kappa",
    responsavel: "Larissa Fernandes",
    id_patrimonio: 5,
    patrimonio: "Ar-condicionado LG 12.000 BTUs",
    descricao: "Ar-condicionado de parede com controle remoto",
    numeroMovimentacao: 10,
    dataMovimentacao: "2024-10-30",
    nome: ""
  },
  {
    gerente: "Camila Rocha",
    projeto: "Projeto Lambda",
    responsavel: "Gustavo Santos",
    id_patrimonio: 1,
    patrimonio: "Scanner Canon Lide 300",
    descricao: "Scanner de mesa com resolução de 2400x4800 dpi",
    numeroMovimentacao: 11,
    dataMovimentacao: "2024-11-12",
    nome: ""
  },
];

export const patrimonioDummyData: Patrimonio[] = [

  {
    id_patrimonio: 1,
    nome: "Notebook Dell",
    data_compra: "2022-01-15",
    nserie: "D12345",
    descricao: "Notebook Dell Inspiron 15 com 16GB RAM e 512GB SSD.",
  },
  {
    id_patrimonio: 2,
    nome: "Monitor LG",
    data_compra: "2021-06-22",
    nserie: "L56789",
    descricao: "Monitor LG UltraWide de 29 polegadas.",
  },
  {
    id_patrimonio: 3,
    nome: "Impressora HP",
    data_compra: "2023-03-10",
    nserie: "H98765",
    descricao: "Impressora HP LaserJet Pro M404dn.",
  },
  {
    id_patrimonio: 4,
    nome: "Teclado Mecânico",
    data_compra: "2020-11-05",
    nserie: "T24680",
    descricao: "Teclado Mecânico RGB Corsair K70.",
  },
  {
    id_patrimonio: 5,
    nome: "Mouse Logitech",
    data_compra: "2022-09-14",
    nserie: "M13579",
    descricao: "Mouse Logitech MX Master 3 sem fio.",
  },
  {
    id_patrimonio: 6,
    nome: "Mesa Digitalizadora Wacom",
    data_compra: "2019-04-20",
    nserie: "W19283",
    descricao: "Mesa Digitalizadora Wacom Intuos Pro.",
  },
  {
    id_patrimonio: 7,
    nome: "Projetor Epson",
    data_compra: "2021-12-01",
    nserie: "E16273",
    descricao: "Projetor Epson PowerLite X39.",
  },
  {
    id_patrimonio: 8,
    nome: "Cadeira Ergonomica",
    data_compra: "2020-08-15",
    nserie: "C17263",
    descricao: "Cadeira Ergonomica modelo ThunderX3.",
  },
  {
    id_patrimonio: 9,
    nome: "Servidor Dell",
    data_compra: "2018-02-28",
    nserie: "D18374",
    descricao: "Servidor Dell PowerEdge R740.",
  },
  {
    id_patrimonio: 10,
    nome: "Smartphone Samsung",
    data_compra: "2023-05-17",
    nserie: "S19875",
    descricao: "Smartphone Samsung Galaxy S23.",
  },
];

export const anexoMovimentacaoDummyData: MovementationFile[] = [
  {
    id_anexo_movimentacao: 1,
    arquivo: "https://example.com/files/relatorio1.pdf",
    nome_arquivo: "relatorio1.pdf",
    id_movimentacao: 101,
  },
  {
    id_anexo_movimentacao: 2,
    arquivo: "https://example.com/images/imagem1.jpg",
    nome_arquivo: "imagem1.jpg",
    id_movimentacao: 102,
  },
  {
    id_anexo_movimentacao: 3,
    arquivo: "https://example.com/docs/notas.txt",
    nome_arquivo: "notas.txt",
    id_movimentacao: 103,
  },
  {
    id_anexo_movimentacao: 4,
    arquivo: "https://example.com/spreadsheets/planilha.xlsx",
    nome_arquivo: "planilha.xlsx",
    id_movimentacao: 104,
  },
  {
    id_anexo_movimentacao: 1,
    arquivo: "https://example.com/files/relatorio1.pdf",
    nome_arquivo: "relatorio1.pdf",
    id_movimentacao: 101,
  },
  {
    id_anexo_movimentacao: 2,
    arquivo: "https://example.com/images/imagem1.jpg",
    nome_arquivo: "imagem1.jpg",
    id_movimentacao: 102,
  },
  {
    id_anexo_movimentacao: 3,
    arquivo: "https://example.com/docs/notas.txt",
    nome_arquivo: "notas.txt",
    id_movimentacao: 103,
  },
  {
    id_anexo_movimentacao: 4,
    arquivo: "https://example.com/spreadsheets/planilha.xlsx",
    nome_arquivo: "planilha.xlsx",
    id_movimentacao: 104,
  },
  {
    id_anexo_movimentacao: 1,
    arquivo: "https://example.com/files/relatorio1.pdf",
    nome_arquivo: "relatorio1.pdf",
    id_movimentacao: 101,
  },
  {
    id_anexo_movimentacao: 2,
    arquivo: "https://example.com/images/imagem1.jpg",
    nome_arquivo: "imagem1.jpg",
    id_movimentacao: 102,
  },
  {
    id_anexo_movimentacao: 3,
    arquivo: "https://example.com/docs/notas.txt",
    nome_arquivo: "notas.txt",
    id_movimentacao: 103,
  },
  {
    id_anexo_movimentacao: 4,
    arquivo: "https://example.com/spreadsheets/planilha.xlsx",
    nome_arquivo: "planilha.xlsx",
    id_movimentacao: 104,
  },
];

export const sampleData: readonly Movementation[] = [
  {
    id_movimentacao: 1,
    projeto: "Projeto A",
    data: "2024-08-01",
    responsavel: "João Silva",
    numeroMovimentacao: 12345,
    observacao: "Verificar documentação pendente.",
  },
  {
    id_movimentacao: 2,
    projeto: "Projeto B",
    data: "2024-08-02",
    responsavel: "Maria Santos",
    numeroMovimentacao: 12346,
    observacao: "Movimentação interna concluída.",
  },
  {
    id: 3,
    projeto: "Projeto C",
    data: "2024-08-03",
    responsavel: "Carlos Souza",
    numeroMovimentacao: 12347,
    observacao: "Aguardando aprovação do gerente.",
  },
  {
    id_movimentacao: 4,
    projeto: "Projeto D",
    data: "2024-08-04",
    responsavel: "Ana Costa",
    numeroMovimentacao: 12348,
    observacao: "Necessário agendar reunião.",
  },
  {
    id: 5,
    projeto: "Projeto E",
    data: "2024-08-05",
    responsavel: "Pedro Lima",
    numeroMovimentacao: 12349,
    observacao: "Conferir detalhes financeiros.",
  },
];
