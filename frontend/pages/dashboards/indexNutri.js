const clientesCardsDiv = document.querySelector(".clientes-card-container");
const nutriCodigo = document.querySelector(".codigo");
const copiarCodigoBtn = document.getElementById("copiarbtn");
const olaNutri = document.querySelector(".title-nutri");
const logouBtn = document.getElementById("logouBtn");

document.addEventListener("DOMContentLoaded", async () => {
  const responseNutri = await fetch("http://localhost:3000/user/nutricionista");
  const dataNutri = await responseNutri.json();
  if (dataNutri.erro) return clientesCardsDiv.innerHTML = `<p class="cards-div-message">Falha ao encontrar seus dados</p>`;
  olaNutri.textContent = `Olá ${dataNutri.sucesso.nome}.`;
  olaNutri.innerHTML += ` <a href="./conta.html" class="ancora">Editar Dados</a>`
  if (copiarCodigoBtn) {
    copiarCodigoBtn.addEventListener("click", async () => {
      await copiar(dataNutri.sucesso.codigo);
    });
  }

  const responseClientes = await fetch("http://localhost:3000/user/nutricionista/clientes");
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
    <div class="card-texto"><span>Id:</span> ${c.id_cliente}</div>
      <div class="card-texto"><span>Nome:</span> ${c.nome}</div>
      <div class="card-texto"><span>Email:</span> ${c.email}</div>
      <div class="card-botoes-container principal-botoes">
        <div class="card-botoes" onclick="verDados(${c.id_cliente})">Ver Dados</div>
      </div>
      <div class="card-info">
        <div class="card-texto"><span>Nascimento:</span> ${formatarData(c.data_nascimento)}</div>
        <div class="card-texto"><span>Endereço:</span> ${c.endereco}</div>
        <div class="card-texto"><span>Objetivo:</span> ${c.objetivo}</div>
        <div class="card-texto"><span>Dietas:</span></div>
        <div class="lista-dietas"></div>
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
    method: "POST"
  });
  const data = await response.json();
  if (data.error) {
    const response = await fetch("http://localhost:3000/auth/me", {
      method: "POST"
    });
    const data = await response.json();
    if (data.erro) {
      const responseRefresh = await fetch("http://localhost:3000/auth/refresh", {
        method: "POST"
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
async function carregarDietas(id, card) {
  const listaDietas = card.querySelector(".lista-dietas");
  if (!listaDietas) return;

  listaDietas.innerHTML = `<p class="cards-div-message">Carregando dietas...</p>`;

  try {
    const [responseDietas, responseConsulta] = await Promise.all([
      fetch(`http://localhost:3000/dieta?id=` + id),
      fetch(`http://localhost:3000/consulta?id=` + id)
    ]);
    const dataDietas = await responseDietas.json();
    const dataConsulta = await responseConsulta.json();

    const possuiConsulta = Boolean(dataConsulta?.sucesso?.possuiConsulta);
    const botaoRegistrarConsulta = !possuiConsulta
      ? `<a class="card-botoes" href="../consulta/index.html?id_cliente=${id}">Registrar Consulta</a>`
      : "";

    if (dataDietas.erro) {
      listaDietas.innerHTML = `<p class="cards-div-message">Falha ao encontrar dietas</p>`;
      return;
    }

    const dietas = Array.isArray(dataDietas.sucesso) ? dataDietas.sucesso : [];
    if (dietas.length <= 0) {
      listaDietas.innerHTML = `<p class="cards-div-message">Nenhuma dieta cadastrada</p>
      <a class="card-botoes" href="../dieta/index.html?id_cliente=${id}">Criar Dieta</a>
      ${botaoRegistrarConsulta}
      `;
      return;
    }

    listaDietas.innerHTML = dietas.map((dieta) => `
    <div class="card-cliente card-dieta">
      <div class="card-content">
        <div class="card-texto"><span>Título:</span> ${dieta.titulo_dieta}</div>
        <div class="card-botoes-container dieta-acoes">
          ${botaoRegistrarConsulta}
          <div class="card-botoes" data-dieta-id="${dieta.id_dieta}" onclick="excluirDieta(${dieta.id_dieta}, ${id})">Excluir Dieta</div>
          <a class="card-botoes" data-dieta-id="${dieta.id_dieta}" href="../dieta/index.html?id_dieta=${dieta.id_dieta}">Atualizar Dieta</a>
        </div>
      </div>
    </div>
  `).join("");
  } catch (error) {
    console.log("Erro ao buscar dietas:", error);
    listaDietas.innerHTML = `<p class="cards-div-message">Falha ao carregar dietas</p>`;
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
    await carregarDietas(id, card);
  }
}
async function excluirDieta(dietaId, clienteId) {
  const card = document.getElementById(clienteId);
  try {
    const response = await fetch("http://localhost:3000/dieta/" + dietaId, {
      method: "DELETE",
      credentials: "include"
    });
    const data = await response.json();
    if (!data.sucesso) return;
    await carregarDietas(clienteId, card);
    alert(data.sucesso);
  } catch (error) {
    alert("Erro ao deletar dieta");
  }
}

logouBtn.addEventListener("click", logout);