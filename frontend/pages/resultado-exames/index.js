const form = document.getElementById("resultadoExamesForm");
const messageField = document.querySelector(".messageField");

function showMessage(message, isError = true) {
  if (!messageField) return;
  messageField.textContent = message;
  messageField.style.color = isError ? "#b91c1c" : "#166534";
}

function getTrimmedValue(id) {
  const element = document.getElementById(id);
  if (!element) return "";
  return element.value.trim();
}

function toNumberOrNull(value) {
  if (!value) return null;
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return null;
  return numberValue;
}

async function cadastrarResultadoExames(event) {
  event.preventDefault();

  const idCliente = getTrimmedValue("id_cliente");
  const dataRealizacao = getTrimmedValue("data_realizacao");

  if (!idCliente || !dataRealizacao) {
    showMessage("Preencha id_cliente e data_realizacao.");
    return;
  }

  const resultadoExames = {
    id_cliente: Number(idCliente),
    data_realizacao: dataRealizacao,
    percentual_gordura: toNumberOrNull(getTrimmedValue("percentual_gordura")),
    massa_magra: toNumberOrNull(getTrimmedValue("massa_magra")),
    gordura_visceral: toNumberOrNull(getTrimmedValue("gordura_visceral")),
    taxa_metabolica_basal: toNumberOrNull(getTrimmedValue("taxa_metabolica_basal")),
    colesterol_total: toNumberOrNull(getTrimmedValue("colesterol_total")),
    glicemia_jejum: toNumberOrNull(getTrimmedValue("glicemia_jejum")),
    outros_marcadores: getTrimmedValue("outros_marcadores") || null
  };

  if (Number.isNaN(resultadoExames.id_cliente) || resultadoExames.id_cliente <= 0) {
    showMessage("id_cliente precisa ser um numero valido.");
    return;
  }

  try {
    const req = await fetch("http://localhost:3000/resultado-exames", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(resultadoExames)
    });

    const response = await req.json();

    if (!req.ok || response.erro) {
      showMessage(response.erro || "Erro ao cadastrar resultado de exames.");
      return;
    }

    showMessage(`Resultado de exames cadastrado com sucesso. ID: ${response.id_exame}`, false);
    if (form) form.reset();
  } catch (error) {
    showMessage("Nao foi possivel conectar ao servidor.");
  }
}

if (form) {
  form.addEventListener("submit", cadastrarResultadoExames);
} else {
  console.warn("Formulario de resultado de exames nao encontrado (id esperado: resultadoExamesForm).");
}
