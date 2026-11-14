# Teacher Class

> **Aprender · Ensinar · Organizar**

O Teacher Class é um protótipo navegável para professores organizarem cursos, matérias, turmas, períodos e alunos. Ele também mostra o **plano de aula** por curso e matéria e a **agenda semanal**, com a quantidade de aulas previstas.

Trabalho acadêmico da **Equipe 6I**, Análise e Desenvolvimento de Sistemas, 2º período.

O protótipo é estático (HTML, CSS e JavaScript puro): não tem servidor, banco de dados nem autenticação real. Os dados ficam no `localStorage` do navegador e já vêm preenchidos com uma demonstração fictícia.

---

## Como abrir

**Opção 1 — sem instalar nada:** baixe ou clone o repositório e dê **dois cliques no `index.html`**. O protótipo funciona direto pelo `file://`.

**Opção 2 — GitHub Pages:** depois de publicado, acesse a URL do Pages (veja a seção [Publicar no GitHub Pages](#publicar-no-github-pages)).

Na tela inicial:

1. Escolha um dos professores de demonstração **ou**
2. Clique em **Cadastrar-se como professor**.

> Para voltar ao estado inicial a qualquer momento, use **Restaurar dados de demonstração**. A opção fica no menu lateral, no menu **Mais** (celular) e na busca com `Ctrl + K`.

## Funcionalidades

| Tela | O que faz |
|---|---|
| **Entrar** | Login simulado: escolher um professor de demonstração ou se cadastrar. |
| **Painel** | Saudação, próxima aula, indicadores (cursos, matérias, turmas, alunos), aulas de hoje, gráfico de aulas da semana, gráfico de alunos por matéria e atalhos para cadastrar. |
| **Plano de Aula** | Selecionar Curso → Matéria → Turma e ver ementa, carga horária, aulas por semana, alunos e a linha do tempo semanal do plano. É possível adicionar, editar e excluir etapas, e imprimir ou salvar em PDF. |
| **Agenda Semanal** | Grade de segunda a sábado (matéria, turma, horário e sala), resumo "X aulas previstas esta semana / Y horas", navegação entre semanas e visualização em lista (automática no celular). |
| **Cadastros** | Cursos, Matérias, Turmas, Períodos, Alunos, Professores e Alocações. Cada lista tem busca, filtros e ordenação, formulário em painel lateral, edição e exclusão com confirmação. |
| **Extras** | Busca global com `Ctrl + K`, tema claro/escuro (lembrado no navegador), notificações de sucesso e erro, estados vazios ilustrados e layout responsivo. |

O sistema **não** inclui Frequência nem Avaliação nesta versão.

## Requisito → Como testar

| Requisito | Como testar |
|---|---|
| **RF01** — Cadastrar professor | Na tela **Entrar**, clique em **Cadastrar-se como professor**, preencha os dados e clique em **Cadastrar e entrar**. Depois abra **Cadastros → Professores**: o novo professor aparece na lista com o selo "Você". Também é possível cadastrar em **Professores → Novo professor**. |
| **RF02** — Cadastrar curso | **Cadastros → Cursos → Novo curso**, preencha e salve. O curso aparece na lista, destacado. |
| **RF03** — Cadastrar matéria vinculada a um curso | **Cadastros → Matérias → Nova matéria**, escolha o **Curso** e salve. O vínculo aparece na coluna **Curso** (código e padrão do curso). Em **Cursos**, a contagem de matérias do curso aumenta. |
| **RF04** — Cadastrar turma com curso e período | **Cadastros → Turmas → Nova turma**, escolha **Curso**, **Período letivo** e **Turno** e salve. A turma aparece na lista com curso e período. |
| **HU01** — Consultar plano de aula por curso e matéria | **Plano de Aula**: escolha o **Curso** e depois a **Matéria** (e a turma, se houver mais de uma). Aparecem a ementa, a carga horária, as aulas por semana, os alunos e a linha do tempo semanal. Use **Imprimir ou salvar PDF**. |
| **HU02** — Ver a quantidade de aulas previstas por semana | **Agenda Semanal**: o resumo mostra "**X aulas previstas esta semana**" e o total de horas. Use as setas para mudar de semana. O **Painel** também mostra o card "Aulas desta semana". |
| **CA01** — Curso com campos obrigatórios é registrado e listado | Em **Novo curso**, preencha Nome, Código e Duração e clique em **Salvar curso**. Aparece a notificação "Curso cadastrado" e o curso é listado e destacado. |
| **CA02** — Matéria com campo obrigatório vazio é bloqueada | Em **Nova matéria**, deixe o **Nome** vazio e clique em **Salvar matéria**. O sistema não salva e mostra: (1) mensagem em cada campo com erro, (2) resumo no topo com links para os campos e (3) foco no primeiro campo com erro. Ao corrigir, as mensagens somem e o cadastro é salvo. |
| **RNF01** — Legível em celular e computador | Testado em 375, 768, 1280 e 1920 px. No celular: barra inferior, menu **Mais**, tabelas viram cartões e a agenda vira lista por dia. |
| **RNF02** — Linguagem clara | Botões com verbos ("Salvar curso", "Excluir", "Restaurar dados") e mensagens que explicam o que fazer ("Selecione o curso da matéria."). |
| **RNF03** — Acessibilidade | Navegue só com o teclado (`Tab`, `Shift + Tab`, `Enter`, `Esc`, setas na busca). Veja a seção [Acessibilidade](#acessibilidade). |

Exemplo de regra de negócio: tente excluir o curso **ADS**. O sistema bloqueia e mostra "**Este curso possui 4 matérias vinculadas**", com um link para ver essas matérias.

## Acessibilidade

- Contraste AA nos temas claro e escuro. Verificado com axe-core (o motor do Lighthouse) em todas as telas, sem violações WCAG 2 A/AA; o Lighthouse marcou 100 em Acessibilidade na tela de entrada.
- Todo campo tem `label`; erros usam `aria-invalid`, `aria-describedby` e um resumo com `role="alert"`.
- Navegação completa por teclado, link "Pular para o conteúdo" e foco sempre visível.
- Modais e painéis com `role="dialog"`/`alertdialog`, `aria-modal`, foco preso dentro, `Esc` para fechar e retorno do foco. O restante da página fica `inert`.
- A busca `Ctrl + K` segue o padrão ARIA *combobox + listbox*.
- **Daltonismo:** nenhuma informação depende só da cor. Os cursos têm cor **+ padrão** (liso, listras, pontos) **+ código** (ADS, RDC, CDD). Os status têm ícone e texto (Concluída ✓, Em andamento ◉, Prevista ○), e os gráficos mostram o valor escrito.
- Respeita `prefers-reduced-motion` (sem animações).

## Suposições de modelagem

1. **Alocação** é a entidade que liga **professor × matéria × turma**. Ela guarda os horários semanais (dia, início, fim), a sala e o **plano de aula**.
2. A matéria e a turma de uma alocação precisam ser **do mesmo curso**. A mesma matéria não pode ser alocada duas vezes para a mesma turma.
3. Cada aluno pertence a **uma turma**. **Alunos por matéria** é a soma dos alunos das turmas em que o professor leciona aquela matéria.
4. O plano de aula é uma lista de **etapas**, e cada etapa cobre uma ou mais semanas consecutivas do período. A semana 1 é a semana (segunda a sábado) que contém a data de início do período.
5. **Aulas previstas na semana** = horários das alocações do professor que caem dentro do período letivo da turma. Fora do período, a semana mostra zero aulas.
6. O **período ativo** é o que contém a data de hoje. Se nenhum contém, é o último que já começou.
7. Os **cadastros são compartilhados** por todos os professores (são da instituição). Painel, Plano de Aula e Agenda mostram apenas os dados do professor conectado.
8. A exclusão é **bloqueada** quando há vínculos: curso com matérias ou turmas, matéria com alocações, turma com alunos ou alocações, período com turmas, professor com alocações e o próprio professor conectado.
9. O código do curso é único (2 a 6 letras ou números), assim como o e-mail do professor e a matrícula do aluno (6 a 12 números).
10. O login é **simulado**: não há senha nem segurança real. Os dados ficam no `localStorage`. Se ele estiver bloqueado, o protótipo funciona em memória durante a sessão.

Todos os nomes, e-mails e matrículas são **fictícios**.

## Estrutura

```
index.html            Página única (rotas por hash: #/painel, #/cursos …)
assets/               Logo (SVG), favicon e fontes WOFF2 (Inter, Plus Jakarta Sans)
css/
  tokens.css          Cores, tipografia, temas claro/escuro
  base.css            Reset, tipografia, foco, reduced motion
  layout.css          Barra lateral, topo, barra inferior (celular)
  components.css      Botões, cards, formulários, tabelas, diálogos, toasts, busca
  pages.css           Entrar e Painel
  planning.css        Plano de Aula e Agenda
  print.css           Impressão / PDF
js/
  core/               util, store (localStorage), domain (regras), router
  data/seed.js        Dados de demonstração
  ui/                 ícones, componentes, diálogos/toasts, formulários, busca Ctrl+K
  pages/              entrar, painel, plano, agenda, CRUD genérico e configuração das entidades
  app.js              Inicialização, layout e rotas
```

Tecnologias: HTML, CSS e JavaScript puro, **sem frameworks, sem npm, sem build e sem CDN**. Os scripts são clássicos (sem módulos ES) para funcionar também em `file://`.

## Roteiro de demonstração (3 minutos)

| Tempo | O que mostrar | O que falar |
|---|---|---|
| **0:00 – 0:20** | Tela **Entrar** | "Professores têm dificuldade para organizar cursos, matérias, turmas e períodos. O Teacher Class centraliza tudo isso." Clique em **Ana Paula Ribeiro**. |
| **0:20 – 0:45** | **Painel** | Mostre a próxima aula, os indicadores, as aulas de hoje e o gráfico **Alunos por matéria** ("cada curso tem cor, padrão e código, pensando em daltonismo"). |
| **0:45 – 1:20** | **HU01 – Plano de Aula** | Troque Curso → Matéria. Mostre a ementa, a carga horária, as aulas por semana, os alunos e a linha do tempo (Concluída / Em andamento / Prevista). Clique em **Imprimir ou salvar PDF**. |
| **1:20 – 1:40** | **HU02 – Agenda Semanal** | "7 aulas previstas esta semana, 13 h 20 min." Avance uma semana com a seta e alterne Grade / Lista. |
| **1:40 – 2:05** | **RF02 + CA01** | **Cursos → Novo curso**: "Sistemas para Internet", "TSI", 5 → Salvar. Mostre a notificação e o destaque na lista. |
| **2:05 – 2:30** | **RF03 + CA02** | **Matérias → Nova matéria**: clique em Salvar sem preencher. Mostre os erros, o resumo e o foco. Preencha (curso **TSI**) e salve: o vínculo aparece na lista. |
| **2:30 – 2:45** | **RF04 + regra** | **Turmas → Nova turma** (TSI, 2026/2, Noturno). Em Cursos, tente excluir **ADS**: "Este curso possui 4 matérias vinculadas". |
| **2:45 – 3:00** | **RF01 + extras** | `Ctrl + K` → "Novo professor"; alterne o **tema escuro**; mostre no celular (DevTools, 375 px). "Feito com acessibilidade AA e sem frameworks." |

> Dica: antes de apresentar, clique em **Restaurar dados de demonstração**.

## Publicar no GitHub Pages

1. No GitHub, abra o repositório → **Settings** → **Pages**.
2. Em **Build and deployment**, escolha **Source: Deploy from a branch**.
3. Selecione a branch (`main` depois do merge, ou `feat/prototipo`) e a pasta **`/ (root)`**. Clique em **Save**.
4. Em 1 ou 2 minutos, o endereço aparece no topo da página (`https://<usuário>.github.io/TrabalhoRodrigoDoVal/`).

## Equipe 6I — ADS 2º período

- Davi Belém de Souza
- Dian Carlos dos Reis Rocha
- Luan Gabriel Oliveira de Lima
- Rafael de Oliveira Gouvea
- Thiago Vinicius dos Santos Souza
- Zahir El Debal
- Júlio Cesar
- Lucas Martins

## Créditos

- Fontes **Inter** e **Plus Jakarta Sans**, sob a SIL Open Font License, hospedadas localmente.
- Logo recriado em SVG a partir da identidade visual da equipe. Ícones desenhados em SVG para o projeto.
