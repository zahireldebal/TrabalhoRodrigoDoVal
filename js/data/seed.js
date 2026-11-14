/* Demo data. Every person, e-mail and record here is fictitious. */
window.TC = window.TC || {};

(function (TC) {
  'use strict';

  var DATA_VERSION = 1;

  var professores = [
    { id: 'prof-ana', nome: 'Ana Paula Ribeiro', email: 'ana.ribeiro@teacherclass.demo', area: 'Engenharia de Software', titulacao: 'Mestrado' },
    { id: 'prof-carlos', nome: 'Carlos Eduardo Nogueira', email: 'carlos.nogueira@teacherclass.demo', area: 'Infraestrutura e Redes', titulacao: 'Especialização' },
    { id: 'prof-juliana', nome: 'Juliana Ferraz Prado', email: 'juliana.prado@teacherclass.demo', area: 'Ciência de Dados e Estatística', titulacao: 'Doutorado' }
  ];

  var cursos = [
    { id: 'cur-ads', nome: 'Análise e Desenvolvimento de Sistemas', codigo: 'ADS', duracao: 5 },
    { id: 'cur-rdc', nome: 'Redes de Computadores', codigo: 'RDC', duracao: 5 },
    { id: 'cur-cdd', nome: 'Ciência de Dados', codigo: 'CDD', duracao: 6 }
  ];

  var materias = [
    { id: 'mat-alg', nome: 'Algoritmos e Lógica de Programação', cursoId: 'cur-ads', cargaHoraria: 80, ementa: 'Raciocínio lógico, construção de algoritmos, estruturas de controle, vetores e modularização com funções.' },
    { id: 'mat-web', nome: 'Programação Web', cursoId: 'cur-ads', cargaHoraria: 80, ementa: 'Desenvolvimento front-end com HTML semântico, CSS responsivo e JavaScript, com foco em acessibilidade e publicação.' },
    { id: 'mat-eng', nome: 'Engenharia de Software', cursoId: 'cur-ads', cargaHoraria: 40, ementa: 'Processos de desenvolvimento, requisitos, modelagem UML, métodos ágeis, qualidade e prototipação.' },
    { id: 'mat-bd', nome: 'Banco de Dados', cursoId: 'cur-ads', cargaHoraria: 80, ementa: 'Modelagem conceitual e lógica, normalização e linguagem SQL para definição e consulta de dados.' },
    { id: 'mat-red', nome: 'Fundamentos de Redes', cursoId: 'cur-rdc', cargaHoraria: 80, ementa: 'Modelos OSI e TCP/IP, endereçamento IPv4, comutação, roteamento e serviços de rede.' },
    { id: 'mat-so', nome: 'Sistemas Operacionais', cursoId: 'cur-rdc', cargaHoraria: 60, ementa: 'Processos, gerência de memória, sistemas de arquivos, administração Linux e virtualização.' },
    { id: 'mat-seg', nome: 'Segurança da Informação', cursoId: 'cur-rdc', cargaHoraria: 60, ementa: 'Princípios de segurança, ameaças, criptografia, segurança em redes, gestão de riscos e LGPD.' },
    { id: 'mat-est', nome: 'Estatística Aplicada', cursoId: 'cur-cdd', cargaHoraria: 80, ementa: 'Estatística descritiva, visualização, probabilidade, inferência e regressão aplicadas a dados reais.' },
    { id: 'mat-py', nome: 'Python para Dados', cursoId: 'cur-cdd', cargaHoraria: 80, ementa: 'Linguagem Python, NumPy e pandas para limpeza, transformação e visualização de dados.' },
    { id: 'mat-ml', nome: 'Aprendizado de Máquina', cursoId: 'cur-cdd', cargaHoraria: 60, ementa: 'Preparação de dados, regressão, classificação, agrupamento e ética no uso de modelos.' }
  ];

  var periodos = [
    { id: 'per-2026-1', nome: '2026/1', inicio: '2026-02-02', fim: '2026-06-06' },
    { id: 'per-2026-2', nome: '2026/2', inicio: '2026-08-03', fim: '2026-12-05' },
    { id: 'per-2027-1', nome: '2027/1', inicio: '2027-02-01', fim: '2027-06-05' }
  ];

  var turmas = [
    { id: 'tur-ads1a', nome: 'ADS 1º A', cursoId: 'cur-ads', periodoId: 'per-2026-2', turno: 'Noturno' },
    { id: 'tur-ads3b', nome: 'ADS 3º B', cursoId: 'cur-ads', periodoId: 'per-2026-2', turno: 'Matutino' },
    { id: 'tur-rdc1a', nome: 'RDC 1º A', cursoId: 'cur-rdc', periodoId: 'per-2026-2', turno: 'Noturno' },
    { id: 'tur-rdc2a', nome: 'RDC 2º A', cursoId: 'cur-rdc', periodoId: 'per-2026-2', turno: 'Vespertino' },
    { id: 'tur-cdd1a', nome: 'CDD 1º A', cursoId: 'cur-cdd', periodoId: 'per-2026-2', turno: 'Noturno' },
    { id: 'tur-cdd2a', nome: 'CDD 2º A', cursoId: 'cur-cdd', periodoId: 'per-2026-2', turno: 'Matutino' }
  ];

  var alunosPorTurma = {
    'tur-ads1a': ['Beatriz Almeida Costa', 'Pedro Henrique Barros', 'Larissa Fernandes Teixeira', 'Gustavo Nascimento',
      'Camila Duarte Pires', 'João Victor Mendes', 'Isabela Cardoso', 'Felipe Araújo Nunes'],
    'tur-ads3b': ['Ana Clara Moreira', 'Bruno Cavalcanti', 'Letícia Gomes Farias', 'Vinícius Batista',
      'Yasmin Correia', 'Eduardo Lopes Machado'],
    'tur-rdc1a': ['Caio Henrique Freitas', 'Amanda Vieira Campos', 'Leonardo Pacheco', 'Natália Monteiro',
      'Henrique Dias Moura', 'Giovanna Tavares', 'Samuel Antunes'],
    'tur-rdc2a': ['Fernanda Carvalho Brito', 'Igor Santana', 'Sofia Andrade Lacerda', 'Renan Coelho',
      'Mirela Bastos', 'André Luiz Peixoto'],
    'tur-cdd1a': ['Lívia Siqueira', 'Otávio Rezende', 'Manuela Prates', 'Diego Fonseca',
      'Clara Bezerra Lins', 'Arthur Queiroz', 'Helena Vasconcelos'],
    'tur-cdd2a': ['Ricardo Paiva Neto', 'Bianca Sampaio', 'Murilo Guimarães', 'Valentina Rangel',
      'Enzo Magalhães', 'Paula Cristina Dantas']
  };

  /* Lesson plan templates per subject: [tema, objetivos, conteúdo, recursos].
     Each step covers 3 consecutive weeks of the 18-week term. */
  var planos = {
    'mat-alg': [
      ['Introdução à lógica de programação', 'Compreender o que é um algoritmo e representá-lo de formas diferentes.', 'Algoritmos do cotidiano, fluxogramas e pseudocódigo.', 'Slides; quadro; Portugol Studio'],
      ['Variáveis, tipos e operadores', 'Declarar variáveis e montar expressões corretas.', 'Tipos primitivos, operadores aritméticos, relacionais e lógicos.', 'Lista de exercícios 1; laboratório'],
      ['Estruturas condicionais', 'Construir algoritmos que tomam decisões.', 'se/senão, escolha-caso e tabela-verdade.', 'Exercícios guiados; laboratório'],
      ['Estruturas de repetição', 'Resolver problemas com laços de repetição.', 'enquanto, para, contadores e acumuladores.', 'Desafios em dupla; laboratório'],
      ['Vetores e matrizes', 'Armazenar e percorrer coleções de dados.', 'Vetores, matrizes e busca linear.', 'Lista de exercícios 2'],
      ['Funções e projeto final', 'Modularizar soluções e apresentar um projeto.', 'Funções, parâmetros, retorno e projeto integrador.', 'Projeto em grupo; apresentação']
    ],
    'mat-web': [
      ['Fundamentos da Web e HTML semântico', 'Estruturar páginas acessíveis e bem organizadas.', 'Protocolo HTTP, HTML5 e tags semânticas.', 'VS Code; documentação MDN'],
      ['CSS e layout responsivo', 'Construir layouts para celular e computador.', 'Flexbox, Grid e media queries.', 'Laboratório; CodePen'],
      ['JavaScript e DOM', 'Adicionar interatividade às páginas.', 'Eventos, seletores e manipulação do DOM.', 'Exercícios práticos'],
      ['Formulários e validação', 'Validar dados no navegador com boa experiência de uso.', 'Formulários, campos obrigatórios e mensagens de erro acessíveis.', 'Estudo de caso'],
      ['Armazenamento e APIs', 'Persistir dados no navegador.', 'localStorage, JSON e consumo de APIs.', 'Mini-projeto'],
      ['Projeto final e publicação', 'Publicar um site completo e acessível.', 'Git, GitHub Pages e revisão de acessibilidade.', 'Banca de apresentação']
    ],
    'mat-eng': [
      ['Processos de software', 'Comparar modelos de processo de desenvolvimento.', 'Cascata, incremental e métodos ágeis.', 'Slides; artigo para leitura'],
      ['Engenharia de requisitos', 'Levantar e documentar requisitos.', 'Requisitos funcionais e não funcionais, histórias de usuário e critérios de aceite.', 'Oficina de requisitos'],
      ['Modelagem UML', 'Representar o sistema com diagramas.', 'Casos de uso, classes e sequência.', 'Draw.io'],
      ['Scrum na prática', 'Planejar entregas em sprints.', 'Backlog, sprint, papéis e cerimônias.', 'Quadro Kanban'],
      ['Qualidade e testes', 'Planejar testes a partir dos critérios de aceite.', 'Testes de unidade, de aceitação e revisão de código.', 'Checklist de testes'],
      ['Prototipação e entrega', 'Validar a solução com usuários.', 'Protótipo navegável, coleta de feedback e apresentação.', 'Projeto da equipe']
    ],
    'mat-bd': [
      ['Conceitos de banco de dados', 'Entender SGBDs e modelos de dados.', 'Dados e informação, SGBD e modelo relacional.', 'Slides'],
      ['Modelagem conceitual', 'Criar diagramas entidade-relacionamento.', 'Entidades, atributos, relacionamentos e cardinalidade.', 'brModelo'],
      ['Modelo lógico e normalização', 'Normalizar tabelas e definir chaves.', 'Chaves primárias e estrangeiras, 1FN, 2FN e 3FN.', 'Lista de exercícios'],
      ['SQL: DDL e DML', 'Criar e manipular tabelas.', 'CREATE, INSERT, UPDATE e DELETE.', 'MySQL Workbench'],
      ['Consultas com SQL', 'Extrair informações com consultas.', 'SELECT, JOIN, GROUP BY e subconsultas.', 'Laboratório'],
      ['Projeto de banco de dados', 'Modelar e implementar um caso real.', 'Do modelo conceitual ao script SQL.', 'Projeto em grupo']
    ],
    'mat-red': [
      ['Introdução às redes', 'Identificar tipos e topologias de rede.', 'LAN, WAN, topologias e meios físicos.', 'Slides; kit de cabos'],
      ['Modelos OSI e TCP/IP', 'Relacionar camadas e protocolos.', 'Camadas, encapsulamento e protocolos.', 'Packet Tracer'],
      ['Endereçamento IPv4', 'Calcular sub-redes.', 'Classes, máscaras e CIDR.', 'Lista de sub-redes'],
      ['Comutação e VLANs', 'Configurar switches.', 'Comutação, VLAN e trunk.', 'Laboratório de redes'],
      ['Roteamento', 'Configurar rotas estáticas e dinâmicas.', 'Rotas estáticas, RIP e OSPF básico.', 'Packet Tracer'],
      ['Serviços de rede', 'Implantar serviços essenciais.', 'DHCP, DNS e NAT.', 'Laboratório de redes']
    ],
    'mat-so': [
      ['Introdução aos sistemas operacionais', 'Conhecer as funções de um SO.', 'Kernel e chamadas de sistema.', 'Slides'],
      ['Processos e threads', 'Entender a execução concorrente.', 'Estados de processos e escalonamento.', 'Simulador de escalonamento'],
      ['Gerência de memória', 'Comparar técnicas de gerência de memória.', 'Paginação, segmentação e memória virtual.', 'Exercícios'],
      ['Sistemas de arquivos', 'Organizar e proteger arquivos.', 'FAT, NTFS, ext4 e permissões.', 'Máquina virtual'],
      ['Linux na prática', 'Administrar o sistema pelo terminal.', 'Comandos, usuários e pacotes.', 'Laboratório Linux'],
      ['Virtualização', 'Criar e gerenciar máquinas virtuais.', 'Hipervisores e contêineres.', 'VirtualBox']
    ],
    'mat-seg': [
      ['Princípios de segurança', 'Aplicar a tríade confidencialidade, integridade e disponibilidade.', 'Conceitos básicos e políticas de segurança.', 'Slides'],
      ['Ameaças e vulnerabilidades', 'Reconhecer ataques comuns.', 'Malware, phishing e engenharia social.', 'Estudos de caso'],
      ['Criptografia', 'Usar criptografia simétrica e assimétrica.', 'Hash, chaves e certificados digitais.', 'Laboratório'],
      ['Segurança em redes', 'Configurar firewall e VPN.', 'Firewall, IDS e VPN.', 'Laboratório de redes'],
      ['Gestão de riscos e LGPD', 'Avaliar riscos e conformidade.', 'ISO 27001 e Lei Geral de Proteção de Dados.', 'Leitura dirigida'],
      ['Resposta a incidentes', 'Planejar a resposta a incidentes.', 'Detecção, contenção e recuperação.', 'Simulação em grupo']
    ],
    'mat-est': [
      ['Introdução à estatística', 'Diferenciar população e amostra.', 'Tipos de variáveis e amostragem.', 'Slides'],
      ['Estatística descritiva', 'Resumir conjuntos de dados.', 'Média, mediana, moda e desvio padrão.', 'Planilha eletrônica'],
      ['Visualização de dados', 'Escolher o gráfico adequado para cada pergunta.', 'Histogramas, boxplot e dispersão.', 'Planilha; Python'],
      ['Probabilidade', 'Calcular probabilidades.', 'Eventos e distribuições normal e binomial.', 'Lista de exercícios'],
      ['Inferência estatística', 'Estimar parâmetros e testar hipóteses.', 'Intervalo de confiança e teste t.', 'Estudo de caso'],
      ['Correlação e regressão', 'Modelar relações entre variáveis.', 'Correlação e regressão linear simples.', 'Projeto com dados abertos']
    ],
    'mat-py': [
      ['Primeiros passos em Python', 'Escrever scripts simples.', 'Sintaxe, tipos e notebooks Jupyter.', 'Google Colab'],
      ['Estruturas de dados', 'Manipular listas e dicionários.', 'Listas, tuplas e dicionários.', 'Exercícios'],
      ['NumPy', 'Operar com arrays de forma eficiente.', 'Arrays e vetorização.', 'Google Colab'],
      ['pandas', 'Limpar e transformar dados.', 'DataFrame, filtros e agrupamentos.', 'Base de dados aberta'],
      ['Visualização com Python', 'Criar gráficos claros.', 'Matplotlib e seaborn.', 'Google Colab'],
      ['Projeto de análise', 'Comunicar os resultados de uma análise.', 'Fluxo completo de análise e relatório.', 'Projeto individual']
    ],
    'mat-ml': [
      ['Introdução ao aprendizado de máquina', 'Diferenciar os tipos de aprendizado.', 'Aprendizado supervisionado e não supervisionado.', 'Slides'],
      ['Preparação de dados', 'Preparar dados para treinar modelos.', 'Limpeza, normalização e divisão treino/teste.', 'Google Colab'],
      ['Regressão', 'Treinar e avaliar modelos de regressão.', 'Regressão linear e métricas de erro.', 'scikit-learn'],
      ['Classificação', 'Treinar e avaliar classificadores.', 'KNN, árvores de decisão e matriz de confusão.', 'scikit-learn'],
      ['Agrupamento', 'Encontrar padrões em dados sem rótulo.', 'k-means e avaliação de grupos.', 'Google Colab'],
      ['Ética e projeto final', 'Avaliar vieses e entregar um modelo.', 'Vieses, explicabilidade e apresentação.', 'Projeto em grupo']
    ]
  };

  /* professor × matéria × turma, weekly schedule (dia: 1 = segunda … 6 = sábado) */
  var alocacoes = [
    { id: 'alo-1', professorId: 'prof-ana', materiaId: 'mat-alg', turmaId: 'tur-ads1a', sala: 'Laboratório 2', horarios: [{ dia: 1, inicio: '19:00', fim: '20:40' }, { dia: 3, inicio: '19:00', fim: '20:40' }] },
    { id: 'alo-2', professorId: 'prof-ana', materiaId: 'mat-eng', turmaId: 'tur-ads1a', sala: 'Sala 204', horarios: [{ dia: 2, inicio: '19:00', fim: '20:40' }] },
    { id: 'alo-3', professorId: 'prof-ana', materiaId: 'mat-web', turmaId: 'tur-ads3b', sala: 'Laboratório 3', horarios: [{ dia: 2, inicio: '08:00', fim: '09:40' }, { dia: 4, inicio: '08:00', fim: '09:40' }] },
    { id: 'alo-4', professorId: 'prof-ana', materiaId: 'mat-bd', turmaId: 'tur-ads3b', sala: 'Laboratório 1', horarios: [{ dia: 5, inicio: '10:00', fim: '11:40' }, { dia: 6, inicio: '08:00', fim: '11:20' }] },
    { id: 'alo-5', professorId: 'prof-carlos', materiaId: 'mat-red', turmaId: 'tur-rdc1a', sala: 'Laboratório de Redes', horarios: [{ dia: 1, inicio: '20:50', fim: '22:30' }, { dia: 4, inicio: '19:00', fim: '20:40' }] },
    { id: 'alo-6', professorId: 'prof-carlos', materiaId: 'mat-so', turmaId: 'tur-rdc1a', sala: 'Sala 105', horarios: [{ dia: 3, inicio: '20:50', fim: '22:30' }] },
    { id: 'alo-7', professorId: 'prof-carlos', materiaId: 'mat-seg', turmaId: 'tur-rdc2a', sala: 'Laboratório de Redes', horarios: [{ dia: 2, inicio: '13:30', fim: '15:10' }, { dia: 5, inicio: '13:30', fim: '15:10' }] },
    { id: 'alo-8', professorId: 'prof-juliana', materiaId: 'mat-est', turmaId: 'tur-cdd1a', sala: 'Sala 301', horarios: [{ dia: 1, inicio: '19:00', fim: '20:40' }, { dia: 3, inicio: '20:50', fim: '22:30' }] },
    { id: 'alo-9', professorId: 'prof-juliana', materiaId: 'mat-py', turmaId: 'tur-cdd1a', sala: 'Laboratório 4', horarios: [{ dia: 4, inicio: '19:00', fim: '20:40' }] },
    { id: 'alo-10', professorId: 'prof-juliana', materiaId: 'mat-ml', turmaId: 'tur-cdd2a', sala: 'Laboratório 4', horarios: [{ dia: 2, inicio: '10:00', fim: '11:40' }, { dia: 5, inicio: '08:00', fim: '09:40' }] },
    { id: 'alo-11', professorId: 'prof-juliana', materiaId: 'mat-py', turmaId: 'tur-cdd2a', sala: 'Laboratório 4', horarios: [{ dia: 3, inicio: '08:00', fim: '09:40' }] }
  ];

  function buildPlano(materiaId, alocId) {
    return (planos[materiaId] || []).map(function (p, i) {
      return {
        id: alocId + '-e' + (i + 1),
        semanaInicio: i * 3 + 1,
        semanaFim: i * 3 + 3,
        tema: p[0], objetivos: p[1], conteudo: p[2], recursos: p[3]
      };
    });
  }

  /** Returns a fresh, deep copy of the demo dataset. */
  TC.seed = function () {
    var courseNum = { 'cur-ads': '01', 'cur-rdc': '02', 'cur-cdd': '03' };
    var alunos = [];
    var seq = {};
    Object.keys(alunosPorTurma).forEach(function (turmaId) {
      var turma = turmas.filter(function (t) { return t.id === turmaId; })[0];
      alunosPorTurma[turmaId].forEach(function (nome) {
        seq[turma.cursoId] = (seq[turma.cursoId] || 0) + 1;
        alunos.push({
          id: 'alu-' + (alunos.length + 1),
          nome: nome,
          matricula: '2026' + courseNum[turma.cursoId] + String(seq[turma.cursoId]).padStart(3, '0'),
          turmaId: turmaId
        });
      });
    });

    var data = {
      version: DATA_VERSION,
      professores: professores,
      cursos: cursos,
      materias: materias,
      periodos: periodos,
      turmas: turmas,
      alunos: alunos,
      alocacoes: alocacoes.map(function (a) {
        var copy = Object.assign({}, a);
        copy.plano = buildPlano(a.materiaId, a.id);
        return copy;
      })
    };
    return JSON.parse(JSON.stringify(data));
  };

  TC.seed.VERSION = DATA_VERSION;
})(window.TC);
