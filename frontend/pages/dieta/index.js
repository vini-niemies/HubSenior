const form = document.getElementById("dietaForm");
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

async function cadastrarDieta(event) {
  event.preventDefault();

  const idCliente = getTrimmedValue("id_cliente");
  const dataInicio = getTrimmedValue("data_inicio");

  if (!idCliente || !dataInicio) {
    showMessage("Preencha id_cliente e data_inicio.");
    return;
  }

  const dieta = {
    id_cliente: Number(idCliente),
    data_inicio: dataInicio,
    data_fim: getTrimmedValue("data_fim") || null,
    titulo_dieta: getTrimmedValue("titulo_dieta") || null,
    refeicao1: getTrimmedValue("refeicao1") || null,
    refeicao2: getTrimmedValue("refeicao2") || null,
    refeicao3: getTrimmedValue("refeicao3") || null,
    refeicao4: getTrimmedValue("refeicao4") || null,
    detalhes_alimentos: getTrimmedValue("detalhes_alimentos") || null,
    objetivos: getTrimmedValue("objetivos") || null
  };

  if (Number.isNaN(dieta.id_cliente) || dieta.id_cliente <= 0) {
    showMessage("id_cliente precisa ser um numero valido.");
    return;
  }

  try {
    const req = await fetch("http://localhost:3000/dieta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(dieta)
    });

    const response = await req.json();

    if (!req.ok || response.erro) {
      showMessage(response.erro || "Erro ao cadastrar dieta.");
      return;
    }

    showMessage(`Dieta cadastrada com sucesso. ID: ${response.id_dieta}`, false);
    if (form) form.reset();
  } catch (error) {
    showMessage("Nao foi possivel conectar ao servidor.");
  }
}

if (form) {
  form.addEventListener("submit", cadastrarDieta);
} else {
  console.warn("Formulario de dieta nao encontrado (id esperado: dietaForm).");
}
