function renderDietas(container, dietas) {
  if (!container) return;

  if (!dietas || dietas.length <= 0) {
    container.innerHTML = "<p class='subtitle'>Nenhuma dieta encontrada.</p>";
    return;
  }

  container.innerHTML = dietas.map((dieta) => {
    const refeicoesHtml = (dieta.refeicoes || []).map((refeicao) => (
      `<li><strong>${refeicao.nome_refeicao}</strong> ${refeicao.horario ? `(${refeicao.horario})` : ""} - ${refeicao.detalhes_alimentos || "Sem detalhes"}</li>`
    )).join("");

    return `
      <article class="card-dieta">
        <h4>${dieta.titulo_dieta || "Dieta sem titulo"}</h4>
        <p><strong>Inicio:</strong> ${String(dieta.data_inicio).slice(0, 10)}</p>
        <p><strong>Fim:</strong> ${dieta.data_fim ? String(dieta.data_fim).slice(0, 10) : "-"}</p>
        <p><strong>Objetivos:</strong> ${dieta.objetivos || "-"}</p>
        <p><strong>Observacoes:</strong> ${dieta.observacoes_gerais || "-"}</p>
        <ul>${refeicoesHtml}</ul>
      </article>
    `;
  }).join("");
}

function criarBlocoRefeicao(indice) {
  return `
    <div class="rede-item refeicao-item">
      <div class="input-box">
        <input type="text" class="nome-refeicao" required>
        <label>Nome da Refeicao ${indice}</label>
      </div>
      <div class="input-box">
        <input type="time" class="horario-refeicao">
        <label>Horario</label>
      </div>
      <div class="input-box">
        <input type="text" class="detalhes-refeicao">
        <label>Detalhes dos Alimentos</label>
      </div>
    </div>
  `;
}

const formDieta = document.getElementById("formDieta");
const listaRefeicoes = document.getElementById("listaRefeicoes");
const btnAdicionarRefeicao = document.getElementById("adicionarRefeicao");
const messageNutri = document.getElementById("messageNutri");
const listaDietasNutri = document.getElementById("listaDietasNutri");
const btnCarregarDietasNutri = document.getElementById("carregarDietasNutri");

if (formDieta && listaRefeicoes && btnAdicionarRefeicao) {
  let totalRefeicoes = 0;

  const adicionarRefeicao = () => {
    totalRefeicoes += 1;
    listaRefeicoes.insertAdjacentHTML("beforeend", criarBlocoRefeicao(totalRefeicoes));
  };

  adicionarRefeicao();

  btnAdicionarRefeicao.addEventListener("click", adicionarRefeicao);

  formDieta.addEventListener("submit", async (e) => {
    e.preventDefault();

    const refeicoes = Array.from(document.querySelectorAll(".refeicao-item")).map((item) => ({
      nome_refeicao: item.querySelector(".nome-refeicao")?.value?.trim(),
      horario: item.querySelector(".horario-refeicao")?.value || null,
      detalhes_alimentos: item.querySelector(".detalhes-refeicao")?.value?.trim() || null
    })).filter((item) => item.nome_refeicao);

    const payload = {
      id_cliente: Number(document.getElementById("idCliente").value),
      data_inicio: document.getElementById("dataInicio").value,
      data_fim: document.getElementById("dataFim").value || null,
      titulo_dieta: document.getElementById("tituloDieta").value.trim() || null,
      objetivos: document.getElementById("objetivos").value.trim() || null,
      observacoes_gerais: document.getElementById("observacoesGerais").value.trim() || null,
      refeicoes
    };

    try {
      const req = await fetch("http://localhost:3000/dieta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const response = await req.json();

      if (response.erro) {
        messageNutri.textContent = response.erro;
        return;
      }

      messageNutri.textContent = response.sucesso;
      formDieta.reset();
      listaRefeicoes.innerHTML = "";
      totalRefeicoes = 0;
      adicionarRefeicao();
    } catch (error) {
      messageNutri.textContent = "Erro ao cadastrar dieta";
    }
  });

  if (btnCarregarDietasNutri) {
    btnCarregarDietasNutri.addEventListener("click", async () => {
      try {
        const idCliente = document.getElementById("idCliente").value;
        if (!idCliente) {
          messageNutri.textContent = "Informe o ID do cliente para carregar dietas";
          return;
        }

        const req = await fetch(`http://localhost:3000/dietas?id_cliente=${idCliente}`, {
          method: "GET",
          credentials: "include"
        });

        const response = await req.json();

        if (response.erro) {
          messageNutri.textContent = response.erro;
          return;
        }

        renderDietas(listaDietasNutri, response.sucesso);
      } catch (error) {
        messageNutri.textContent = "Erro ao carregar dietas";
      }
    });
  }
}

const btnCarregarMinhasDietas = document.getElementById("loginBtn");
const listaDietasCliente = document.getElementById("listaDietasCliente");
const messageCliente = document.getElementById("messageCliente");

if (btnCarregarMinhasDietas && listaDietasCliente) {
  btnCarregarMinhasDietas.addEventListener("click", async () => {
    try {
      const req = await fetch("http://localhost:3000/dietas", {
        method: "GET",
        credentials: "include"
      });

      const response = await req.json();

      if (response.erro) {
        if (messageCliente) messageCliente.textContent = response.erro;
        return;
      }

      renderDietas(listaDietasCliente, response.sucesso);
    } catch (error) {
      if (messageCliente) messageCliente.textContent = "Erro ao carregar dietas";
    }
  });
}
