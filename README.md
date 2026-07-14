# HubSenior - Portal de Saúde e Bem-Estar

O **HubSenior** é uma plataforma web integrada desenvolvida com o objetivo de conectar clientes (com foco especial na terceira idade) a profissionais de saúde e bem-estar, especificamente **Nutricionistas** e **Personal Trainers (Treinadores Pessoais)**. 

A plataforma possibilita que os profissionais cadastrados prescrevam e acompanhem dietas, rotinas de exercícios, consultas clínicas e resultados de exames, enquanto os clientes conseguem visualizar suas prescrições e enviar feedbacks contínuos sobre sua evolução.

---

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** com framework **Express.js** para construção da API REST.
- **MySQL** (via biblioteca `mysql2`) como banco de dados relacional.
- **JWT (JSON Web Token)** e **Cookie-Parser** para controle de autenticação via cookies seguros (`accessToken` e refresh tokens).
- **Bcrypt** para criptografia e segurança de senhas.

### Frontend
- **HTML5** estrutural e semântico.
- **CSS3** vanilla para estilização responsiva, contendo transições suaves e janelas modais interativas.
- **JavaScript (ES6+)** nativo (Vanilla) para manipulação de DOM e consumo da API backend de forma assíncrona (`fetch`).

---

## 📂 Estrutura de Diretórios e Funcionalidades dos Arquivos

### 🌐 Raiz do Projeto
*   [.gitignore](file:///c:/xampp/htdocs/HubSenior/.gitignore) - Define quais arquivos e diretórios não devem ser rastreados pelo Git (como `node_modules` e arquivos de ambiente `.env`).
*   [guidolin.txt](file:///c:/xampp/htdocs/HubSenior/guidolin.txt) - Arquivo temporário ou de rascunho de controle interno.
*   [README.md](file:///c:/xampp/htdocs/HubSenior/README.md) - Este arquivo com a documentação do projeto.

---

### 🖥️ Backend (`/backend`)
O backend centraliza a lógica de negócios, conexão com o banco de dados e controle de segurança da API.

*   [app.js](file:///c:/xampp/htdocs/HubSenior/backend/app.js) - Ponto de entrada do servidor Express. Configura middlewares cruciais (CORS com credenciais, Cookie Parser, parser de JSON, servir arquivos estáticos do frontend), importa e registra todas as rotas e inicia o servidor na porta 3000.
*   [bd.txt](file:///c:/xampp/htdocs/HubSenior/backend/bd.txt) - Script SQL contendo toda a modelagem do banco de dados `hubsenior`. Define as tabelas (`nutricionistas`, `personais`, `clientes`, `consultas`, `resultados_exames`, `dietas`, `refeicoes`, `treinos`, `exercicios` e `feedback`), chaves primárias/estrangeiras e comportamentos em cascata.
*   [package.json](file:///c:/xampp/htdocs/HubSenior/backend/package.json) - Metadados do projeto Node e suas dependências diretas.
*   [config/conn.js](file:///c:/xampp/htdocs/HubSenior/backend/config/conn.js) - Cria e exporta a conexão com o banco de dados MySQL (`mysql2`) consumindo as variáveis de ambiente (.env).
*   [Functions/Functions.js](file:///c:/xampp/htdocs/HubSenior/backend/Functions/Functions.js) - Middleware de utilidades gerais. Contém a lógica `verificaToken`, que extrai o JWT do cookie `accessToken`, valida a assinatura do token e injeta os dados do usuário autenticado no escopo da requisição (`req.user`).

#### 🗃️ Models (`/backend/models`)
Classes Javascript que representam e instanciam os modelos de dados antes de serem persistidos ou retornados.
*   [Cliente.js](file:///c:/xampp/htdocs/HubSenior/backend/models/Cliente.js) - Define o construtor e conversão para array do objeto Cliente.
*   [Nutricionista.js](file:///c:/xampp/htdocs/HubSenior/backend/models/Nutricionista.js) - Define o construtor do objeto Nutricionista.
*   [Personal.js](file:///c:/xampp/htdocs/HubSenior/backend/models/Personal.js) - Define o construtor do objeto Personal Trainer.
*   [Consulta.js](file:///c:/xampp/htdocs/HubSenior/backend/models/Consulta.js) - Define o construtor do objeto Consulta.
*   [Exame.js](file:///c:/xampp/htdocs/HubSenior/backend/models/Exame.js) - Define o construtor do objeto Exame.
*   [Dieta.js](file:///c:/xampp/htdocs/HubSenior/backend/models/Dieta.js) - Define o construtor do objeto Dieta.
*   [Treino.js](file:///c:/xampp/htdocs/HubSenior/backend/models/Treino.js) - Define o construtor do objeto Treino.
*   [Feedback.js](file:///c:/xampp/htdocs/HubSenior/backend/models/Feedback.js) - Define o construtor do objeto Feedback.

#### 🎮 Controllers (`/backend/controllers`)
Ficheiros responsáveis por receber as requisições HTTP, executar validações de segurança, interagir com o banco de dados via SQL e retornar respostas JSON apropriadas.
*   [AuthController.js](file:///c:/xampp/htdocs/HubSenior/backend/controllers/AuthController.js) - Realiza o login (verificando e-mail e senha com bcrypt para clientes, nutricionistas ou personais), logout (limpando cookies de autenticação), validação da sessão ativa (`CheckLogin`) e renovação de tokens expirados (`Refresh`).
*   [ClienteController.js](file:///c:/xampp/htdocs/HubSenior/backend/controllers/ClienteController.js) - Gerencia o ciclo de vida do cliente. Valida regras estritas no cadastro: obrigatoriedade de campos, formato do e-mail, idade mínima de 18 anos, complexidade de senha (mínimo de 8 caracteres com letras maiúsculas, minúsculas, números e caracteres especiais) e associação a um profissional através do preenchimento de um código exclusivo de Nutricionista ou Personal.
*   [NutricionistaController.js](file:///c:/xampp/htdocs/HubSenior/backend/controllers/NutricionistaController.js) e [PersonalController.js](file:///c:/xampp/htdocs/HubSenior/backend/controllers/PersonalController.js) - Gerenciam os cadastros e dados de perfil de nutricionistas e personal trainers, incluindo o fornecimento do código exclusivo para associação com clientes.
*   [ConsultaController.js](file:///c:/xampp/htdocs/HubSenior/backend/controllers/ConsultaController.js) - Controla o fluxo de agendamento de consultas nutricionais, registro de dados corporais (altura, peso), históricos médicos e alergias, além do gerenciamento de resultados de exames de bioimpedância e bioquímicos.
*   [DietaController.js](file:///c:/xampp/htdocs/HubSenior/backend/controllers/DietaController.js) e [TreinoController.js](file:///c:/xampp/htdocs/HubSenior/backend/controllers/TreinoController.js) - Regras para elaboração de dietas e treinos. Permitem aos profissionais criar, listar, atualizar ou remover refeições diárias e rotinas de exercícios específicos (definindo grupos musculares, séries, repetições, tempos de descanso, carga e link para vídeo demonstrativo).
*   [FeedbackController.js](file:///c:/xampp/htdocs/HubSenior/backend/controllers/FeedbackController.js) - Permite a recepção e o armazenamento do feedback textual deixado pelos clientes sobre suas rotinas ativas.

#### 🛣️ Routes (`/backend/routes`)
Mapeamento dos caminhos (URLs) HTTP direcionados aos respectivos métodos dos controladores.
*   [AuthRoutes.js](file:///c:/xampp/htdocs/HubSenior/backend/routes/AuthRoutes.js)
*   [ClienteRoutes.js](file:///c:/xampp/htdocs/HubSenior/backend/routes/ClienteRoutes.js)
*   [NutricionistaRoutes.js](file:///c:/xampp/htdocs/HubSenior/backend/routes/NutricionistaRoutes.js)
*   [PersonalRoutes.js](file:///c:/xampp/htdocs/HubSenior/backend/routes/PersonalRoutes.js)
*   [ConsultaRoutes.js](file:///c:/xampp/htdocs/HubSenior/backend/routes/ConsultaRoutes.js)
*   [DietaRoutes.js](file:///c:/xampp/htdocs/HubSenior/backend/routes/DietaRoutes.js)
*   [TreinoRoutes.js](file:///c:/xampp/htdocs/HubSenior/backend/routes/TreinoRoutes.js)
*   [FeedbackRoutes.js](file:///c:/xampp/htdocs/HubSenior/backend/routes/FeedbackRoutes.js)

---

### 🎨 Frontend (`/frontend`)
O frontend é a interface visual do portal, que interage dinamicamente com a API backend.

*   [functions/controlarSessao.js](file:///c:/xampp/htdocs/HubSenior/frontend/functions/controlarSessao.js) - Script executado de forma automática em todas as páginas para validar a sessão de usuário. Verifica se há um token JWT ativo chamando `/auth/me` no carregamento. Caso a sessão tenha expirado, tenta renová-la em `/auth/refresh` antes de forçar o redirecionamento à página inicial. Também impede que um usuário com um determinado nível de acesso (ex: `cliente`) tente acessar páginas exclusivas de profissionais (ex: `dieta` ou `treino`) e vice-versa, redirecionando o usuário para o seu painel correto.
*   `styles/` - Armazena estilos globais compartilhados:
    - [base.css](file:///c:/xampp/htdocs/HubSenior/frontend/styles/base.css) - Layout básico, paleta de cores padrão e regras reset CSS.
    - [modal.css](file:///c:/xampp/htdocs/HubSenior/frontend/styles/modal.css) - Estilização genérica reutilizada para as caixas de diálogo interativas.

#### 📄 Páginas (`/frontend/pages`)
Módulos independentes organizados por pastas, cada uma contendo sua interface de visualização (`index.html`), estilo local (`style.css`) e inteligência client-side (`index.js`).

*   `hero/` - Tela inicial de apresentação da plataforma HubSenior, exibindo os propósitos do portal e links de navegação para login e cadastros.
*   `home/` - Tela de redirecionamento geral padrão do ecossistema.
*   `login/` - Formulário de autenticação que capta os dados informados e gera a sessão do usuário.
*   `registro/` - Contém os formulários específicos de cadastro de acordo com o perfil:
    - `registroCliente.html`: Criação de contas de clientes, requerendo o código de associação de um profissional.
    - `registroNutricionista.html` / `registroPersonal.html`: Cadastro profissional utilizando documentos de registro profissional correspondentes (CRN/CREF).
*   `dashboards/` - Painéis de controle personalizados que adaptam a visualização conforme a role (perfil) do usuário:
    - `dashboardcliente.html` / `indexCliente.js`: Visualização de treinos, dietas do dia e envio de feedback.
    - `dashboardnutricionista.html` / `indexNutri.js`: Lista de pacientes vinculados ao nutricionista, atalhos de consulta e dieta.
    - `dashboardpersonal.html` / `indexPersonal.js`: Lista de alunos vinculados ao personal trainer e atalhos para gestão de treinos.
    - `conta.html` / `conta.js`: Tela unificada para edição de dados cadastrais de perfil.
*   `dieta/` - Tela exclusiva do Nutricionista para visualizar as refeições ativas e prescrever novos cardápios alimentares para seus pacientes associados.
*   `treino/` - Tela exclusiva do Personal Trainer para estruturação de treinos e especificação detalhada de exercícios.
*   `consulta/` - Interface do Nutricionista para registro de histórico clínico, peso, altura, alergias e upload/registro de resultados de exames de laboratório.

---

## 🛠️ Como Rodar o Projeto

1.  **Configurar o Banco de Dados**:
    *   Certifique-se de que possui o MySQL instalado e rodando em sua máquina.
    *   Crie o banco de dados `hubsenior` executando os scripts contidos no arquivo [bd.txt](file:///c:/xampp/htdocs/HubSenior/backend/bd.txt).
2.  **Configurar as Variáveis de Ambiente**:
    *   No diretório `/backend`, crie um arquivo `.env` (com base no `env.txt`) e configure os parâmetros de conexão com o banco e segredos do JWT:
        ```env
        PORT=3000
        DBHOST=localhost
        DBUSER=seu_usuario_do_mysql
        DBPASSWORD=sua_senha_do_mysql
        DBDATABASE=hubsenior
        JWT_SECRET=sua_chave_secreta_jwt
        COOKIE_SECRET=sua_chave_secreta_dos_cookies
        ```
3.  **Instalar as Dependências**:
    *   Navegue até a pasta `/backend` no terminal e execute:
        ```bash
        npm install
        ```
4.  **Iniciar a Aplicação**:
    *   Ainda no terminal da pasta `/backend`, execute:
        ```bash
        npm start
        ```
    *   O servidor Express será iniciado na porta **3000** e servirá as páginas estáticas do frontend automaticamente.
    *   Acesse no navegador: `http://localhost:3000/pages/home/index.html` ou `http://localhost:3000/pages/hero/index.html`.
