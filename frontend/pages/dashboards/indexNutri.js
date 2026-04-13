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
  <div class="card-cliente">
    <div class="card-content">
      <div class="card-texto"><span>Nome:</span> ${c.nome}</div>
      <div class="card-texto"><span>Email:</span> ${c.email}</div>
      <div class="card-botoes-container">
        <div class="card-botoes">Ver Dieta</div>
        <div class="card-botoes">Ver Dados</div>
      </div>
    </div>
  </div>
`);
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
  if (data.error) return;
  if (data.sucesso) {
    window.location.href = "../home/index.html";
  }
}

logouBtn.addEventListener("click", logout);