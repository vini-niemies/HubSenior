const consultaForm = document.getElementById("consultaForm");

document.addEventListener("DOMContentLoaded", () => {
  const param = new URLSearchParams(window.location.search);
  const idClienteParam = param.get("id_cliente");
  if (idClienteParam) {
    document.getElementById("idCliente").value = idClienteParam;
  }
});

function normalizarDataConsulta(dataConsulta) {
  if (!dataConsulta) return "";
  return dataConsulta.replace("T", " ") + ":00";
}

function fecharModal() {
  const modal = document.querySelector(".modal");
  if (modal) {
    modal.classList.remove("is-active");
    modal.innerHTML = "";
  }
}

function abrirAlerta(titulo, descricao, onVoltarDashboard = false) {
  const modal = document.querySelector(".modal");
  if (!modal) return;
  modal.classList.add("is-active");
  const buttonHtml = onVoltarDashboard 
    ? `<button onclick="window.location.href='../dashboards/dashboardnutricionista.html'">OK</button>`
    : `<button onclick="fecharModal()">Fechar</button>`;
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${titulo}</h2>
      <p>${descricao}</p>
      <div>${buttonHtml}</div>
    </div>
  `;
}

async function cadastrarConsulta(e) {
  e.preventDefault();

  const id_cliente = document.getElementById("idCliente").value;
  const data_consulta = normalizarDataConsulta(document.getElementById("dataConsulta").value);
  const peso_atual = document.getElementById("pesoAtual").value;
  const altura = document.getElementById("altura").value;
  const alergias = document.getElementById("alergias").value.trim();
  const restricoes_alimentares = document.getElementById("restricoesAlimentares").value.trim();
  const historico_familiar = document.getElementById("historicoFamiliar").value.trim();
  const observacoes = document.getElementById("observacoes").value.trim();
  const metodos_utilizados = document.getElementById("metodosUtilizados").value.trim();

  const consulta = {
    id_cliente,
    data_consulta,
    peso_atual,
    altura,
    alergias,
    restricoes_alimentares,
    historico_familiar,
    observacoes,
    metodos_utilizados
  };

  try {
    const req = await fetch("http://localhost:3000/consulta", {
      method: "POST",
      body: JSON.stringify(consulta),
      headers: {
        "Content-type": "application/json"
      },
      credentials: "include"
    });

    const response = await req.json();
    if (response.erro) {
      return abrirAlerta("Erro", response.erro);
    }

    if (response.sucesso) {
      abrirAlerta("Sucesso", response.sucesso, true);
    }
  } catch (error) {
    console.log(error);
    abrirAlerta("Erro", "Erro ao cadastrar consulta");
  }
}

consultaForm.addEventListener("submit", cadastrarConsulta);
