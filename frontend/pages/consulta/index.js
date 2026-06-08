const consultaForm = document.getElementById("consultaForm");

document.addEventListener("DOMContentLoaded", async () => {
  const param = new URLSearchParams(window.location.search);
  const idClienteParam = param.get("id_cliente");
  const idConsultaParam = param.get("id_consulta");

  if (idClienteParam) {
    document.getElementById("idCliente").value = idClienteParam;
  }

  if (idConsultaParam) {
    try {
      const response = await fetch(`http://localhost:3000/consultas/${idConsultaParam}`, {
        credentials: "include"
      });
      const data = await response.json();
      if (data.sucesso) {
        preencherFormularioConsulta(data.sucesso);
        alterarBotoesParaEdicao(idConsultaParam);
      }
    } catch (error) {
      console.error("Erro ao carregar consulta", error);
    }
  }
});

function normalizarDataParaInput(dataIso) {
  if (!dataIso) return "";
  const data = new Date(dataIso);
  const offset = data.getTimezoneOffset() * 60000;
  const dataLocal = new Date(data.getTime() - offset);
  return dataLocal.toISOString().slice(0, 16);
}

function preencherFormularioConsulta(consulta) {
  document.getElementById("idCliente").value = consulta.id_cliente;
  document.getElementById("dataConsulta").value = normalizarDataParaInput(consulta.data_consulta);
  document.getElementById("pesoAtual").value = consulta.peso_atual || "";
  document.getElementById("altura").value = consulta.altura || "";
  document.getElementById("alergias").value = consulta.alergias || "";
  document.getElementById("restricoesAlimentares").value = consulta.restricoes_alimentares || "";
  document.getElementById("historicoFamiliar").value = consulta.historico_familiar || "";
  document.getElementById("observacoes").value = consulta.observacoes || "";
  document.getElementById("metodosUtilizados").value = consulta.metodos_utilizados || "";
}

function alterarBotoesParaEdicao(idConsulta) {
  const submitBtn = document.getElementById("cadastrarConsultaBtn");
  submitBtn.textContent = "Atualizar Consulta";
  
  const formBox = submitBtn.parentElement;
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Deletar Consulta";
  deleteBtn.type = "button";
  deleteBtn.id = "deletarConsultaBtn";
  deleteBtn.onclick = () => deletarConsulta(idConsulta);
  formBox.appendChild(deleteBtn);

  consultaForm.removeEventListener("submit", cadastrarConsulta);
  consultaForm.addEventListener("submit", (e) => atualizarConsulta(e, idConsulta));
}

async function atualizarConsulta(e, id_consulta) {
  e.preventDefault();

  const data_consulta = normalizarDataConsulta(document.getElementById("dataConsulta").value);
  const peso_atual = document.getElementById("pesoAtual").value;
  const altura = document.getElementById("altura").value;
  const alergias = document.getElementById("alergias").value.trim();
  const restricoes_alimentares = document.getElementById("restricoesAlimentares").value.trim();
  const historico_familiar = document.getElementById("historicoFamiliar").value.trim();
  const observacoes = document.getElementById("observacoes").value.trim();
  const metodos_utilizados = document.getElementById("metodosUtilizados").value.trim();

  const consulta = {
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
    const req = await fetch(`http://localhost:3000/consultas/${id_consulta}`, {
      method: "PUT",
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
    abrirAlerta("Erro", "Erro ao atualizar consulta");
  }
}

async function deletarConsulta(id_consulta) {
  abrirModal("Deletar", "Deseja realmente deletar esta consulta?");
  const btnAccept = document.getElementById("modalAcceptBtn");
  if (!btnAccept) return;
  btnAccept.onclick = async () => {
    try {
      const req = await fetch(`http://localhost:3000/consultas/${id_consulta}`, {
        method: "DELETE",
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
      abrirAlerta("Erro", "Erro ao deletar consulta");
    }
  }
}

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

const voltar = document.getElementById("voltarBtn");

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

function sairSemSalvar(descricao) {
  abrirModal("Sair", descricao);
  if (!document.getElementById("modalAcceptBtn")) return;
  document.getElementById("modalAcceptBtn").onclick = () => {
    return window.location.href = "../dashboards/dashboardnutricionista.html";
  }
}
voltar.addEventListener("click", () => sairSemSalvar("Deseja voltar ao Dashboard?"));

consultaForm.addEventListener("submit", cadastrarConsulta);

