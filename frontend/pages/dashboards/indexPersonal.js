const clientesCardsDiv = document.querySelector(".clientes-card-container");
const copiarCodigoBtn = document.getElementById("copiarbtn");
const olaPersonal = document.querySelector(".title-personal");
const logoutBtn = document.getElementById("logoutBtn");

document.addEventListener("DOMContentLoaded", async () => {
  const reqPersonal = await fetch("http://localhost:3000/user/personal", { credentials: "include" });
  const dataPersonal = await reqPersonal.json();
  if (dataPersonal.erro) return clientesCardsDiv.innerHTML = `<p class="cards-div-message">Falha ao encontrar seus dados</p>`;
  olaPersonal.innerHTML = `Olá, ${dataPersonal.sucesso.nome}<p>Bem-Vindo de volta!</p>`;
  if (copiarCodigoBtn) {
    copiarCodigoBtn.addEventListener("click", async () => {
      await copiar(dataPersonal.sucesso.codigo);
    });
  }

  const responseClientes = await fetch("http://localhost:3000/user/personal/clientes", { credentials: "include" });
  const dataClientes = await responseClientes.json();
  if (dataClientes.erro) clientesCardsDiv.innerHTML = `<p class="cards-div-message">Falha ao encontrar seus clientes</p>`;
  const clientes = dataClientes.sucesso;
  if (clientes.length <= 0) {
    clientesCardsDiv.innerHTML = `<p class="cards-div-message">Clientes não encontrados, convide seus clientes</p>`;
  } else {
    clientesCardsDiv.innerHTML = "";
    clientesCardsDiv.innerHTML += clientes.map(c => `
  <div class="card-cliente" id=${c.id_cliente}>
    <div class="card-content">
      <div class="card-title">
        <img src="../../img/gUserIcon.svg"/>
        <div class="card-title-text">${c.nome}</div>
      </div>
      <hr class="card-line">
      <div class="card-texto wIcon"><img src="../../img/sUserIcon.svg" class="icon"/><span>Nome:</span> ${c.nome}</div>
      <div class="card-texto wIcon"><img src="../../img/emailIcon.svg" class="icon"/><span>Email:</span> ${c.email}</div>
      <div class="card-botoes-container principal-botoes">
        <div class="card-botoes" onclick="verDados(${c.id_cliente})">Ver Dados</div>
      </div>
      <div class="card-info">
        <div class="card-texto"><span>Nascimento:</span> ${formatarData(c.data_nascimento)}</div>
        <div class="card-texto"><span>Endereço:</span> ${c.endereco}</div>
        <div class="card-texto"><span>Objetivo:</span> ${c.objetivo}</div>
        <div class="card-texto"><span>Treinos:</span></div>
        <div class="lista-treinos"></div>
        <div class="card-botoes" onclick="verDados(${c.id_cliente})">Fechar</div>
      </div>
    </div>
  </div>
`).join('');
  }
});

async function copiar(texto) {
  if (!texto) return;
  try {
    await navigator.clipboard.writeText(texto);
  } catch (error) {
    console.log("Erro ao copiar codigo:", error);
  }
}

async function logout() {
  const response = await fetch("http://localhost:3000/auth/logout", {
    method: "POST",
    credentials: "include"
  });
  const data = await response.json();
  if (data.error) {
    const response = await fetch("http://localhost:3000/auth/me", {
      method: "POST",
      credentials: "include"
    });
    const data = await response.json();
    if (data.erro) {
      const responseRefresh = await fetch("http://localhost:3000/auth/refresh", {
        method: "POST",
        credentials: "include"
      });
      const dataRefresh = await responseRefresh.json();
      if (dataRefresh.erro) return window.location.href = "../home/index.html";
      window.location.reload();
    }
  };
  if (data.sucesso) {
    window.location.href = "../home/index.html";
  }
}

function formatarData(data) {
  const newData = new Date(data);
  const dataFormatada = newData.toLocaleDateString('pt-BR');
  return dataFormatada;
}

async function carregarTreinos(id, card) {
  const listaTreinos = card.querySelector(".lista-treinos");
  if (!listaTreinos) return;

  listaTreinos.innerHTML = `<p class="cards-div-message">Carregando treinos...</p>`;

  try {
    const responseTreinos = await fetch(`http://localhost:3000/treino?id=` + id, {
      credentials: "include"
    });
    const dataTreinos = await responseTreinos.json();

    if (dataTreinos.erro) {
      listaTreinos.innerHTML = `<p class="cards-div-message">Falha ao encontrar treinos</p>`;
      return;
    }

    const treinos = Array.isArray(dataTreinos.sucesso) ? dataTreinos.sucesso : [];
    
    listaTreinos.innerHTML = `
      <a class="card-botoes" href="../treino/index.html?id_cliente=${id}">Criar Treino</a>
    `;

    if (treinos.length <= 0) {
      listaTreinos.innerHTML += `<p class="cards-div-message">Nenhum treino cadastrado</p>`;
      return;
    }

    listaTreinos.innerHTML += treinos.map((treino) => `
    <div class="card-cliente card-dieta">
      <div class="card-content">
        <div class="card-texto"><span>Título:</span> ${treino.titulo_treino}</div>
        <div class="card-botoes-container dieta-acoes">
          <div class="card-botoes" data-treino-id="${treino.id_treino}" onclick="excluirTreino(${treino.id_treino}, ${id})">Excluir Treino</div>
          <a class="card-botoes" data-treino-id="${treino.id_treino}" href="../treino/index.html?id_treino=${treino.id_treino}">Atualizar Treino</a>
        </div>
      </div>
    </div>
  `).join("");
  } catch (error) {
    console.log("Erro ao buscar treinos:", error);
    listaTreinos.innerHTML = `<p class="cards-div-message">Falha ao carregar treinos</p>`;
  }
}

async function verDados(id) {
  const card = document.getElementById(id);
  if (!card) return;

  const cardContent = card.querySelector(".card-content");
  if (!cardContent) return;

  const cardInfo = cardContent.querySelector(".card-info");
  const cardBotoes = cardContent.querySelector(".principal-botoes");
  if (!cardInfo || !cardBotoes) return;

  document.querySelectorAll(".card-info").forEach(info => {
    if (info !== cardInfo) info.style.display = "none";
  });
  document.querySelectorAll(".principal-botoes").forEach(botoes => {
    if (botoes !== cardBotoes) botoes.style.display = "flex";
  });
  const isInfoVisible = window.getComputedStyle(cardInfo).display !== "none";
  cardInfo.style.display = isInfoVisible ? "none" : "flex";
  cardBotoes.style.display = isInfoVisible ? "flex" : "none";

  if (!isInfoVisible) {
    await carregarTreinos(id, card);
  }
}

async function excluirTreino(treinoId, clienteId) {
  const card = document.getElementById(clienteId);
  try {
    const response = await fetch("http://localhost:3000/treino/" + treinoId, {
      method: "DELETE",
      credentials: "include"
    });
    const data = await response.json();
    if (!data.sucesso) return;
    await carregarTreinos(clienteId, card);
    alert(data.sucesso);
  } catch (error) {
    alert("Erro ao deletar treino");
  }
}

function fecharModal() {
  document.querySelector(".modal").classList.remove("is-active");
  document.querySelector(".modal").innerHTML = "";
}

function abrirModal(titulo, descricao) {
  document.querySelector(".modal").classList.add("is-active");
  document.querySelector(".modal").innerHTML += `
	<div class="modal-content">
      <h2>${titulo}</h2>
      <p>${descricao}</p>
      <div>
        <button id="modalAcceptBtn">Sim</button>
        <button onclick=fecharModal()>Não</button>
      </div>
    </div>
	`
}

logoutBtn.addEventListener("click", () => {
  abrirModal("Sair", "Tem certeza que deseja sair?");
  if (!document.getElementById("modalAcceptBtn")) return;
  document.getElementById("modalAcceptBtn").onclick = async () => {
    await logout();
  }
});