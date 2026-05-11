const quantidadeRefeicoes = document.getElementById("nRefeicoesInput");
const cadastrarDietaBtn = document.getElementById("cadastrarDietaBtn");
const refeicoesContainer = document.querySelector(".refeicoes-container");
const voltar = document.getElementById("voltarBtn");

document.addEventListener("DOMContentLoaded", () => {
    const param = new URLSearchParams(window.location.search);
    if (param || param.get("id_cliente")) {
        document.getElementById("idCliente").value = param.get("id_cliente");
    }
    carregarDieta();
});
quantidadeRefeicoes.addEventListener("input", (e) => {
    carregarCardRefeicao(e.target.value);
});
function carregarCardRefeicao(quantidade, refeicoes = []) {
    const totalRefeicoes = Math.min(Number(quantidade) || 0, 6);
    if (quantidadeRefeicoes.value !== totalRefeicoes) {
        quantidadeRefeicoes.value = totalRefeicoes;
    }
    refeicoesContainer.innerHTML = "";
    let i = 0;
    while (i < totalRefeicoes) {
        const refeicaoAtual = refeicoes[i] || {};
        refeicoesContainer.innerHTML += `<div class="refeicao-box">
          <div class="input-box">
                        <input type="text" class="tituloRefeicao" value="${refeicaoAtual.nome_refeicao || ""}">
            <label class="input-label">Título da Refeição ${i + 1}</label>
          </div>
          <div class="input-box">
                        <input type="time" class="horarioRefeicao" value="${refeicaoAtual.horario || ""}">
            <label class="input-label">Horário da Refeição</label>
          </div>
        </div> `;
        i += 1;
    }
}
function formatSqlDateToInput(dateValue) {
    if (!dateValue) return "";
    const asString = String(dateValue);
    if (asString.includes("T")) return asString.split("T")[0];
    if (asString.includes(" ")) return asString.split(" ")[0];
    return asString;
}
async function atualizarDieta(e) {
    e.preventDefault();
    const id_cliente = document.getElementById("idCliente").value;
    const data_inicio = document.getElementById("dataInicio").value;
    const data_fim = document.getElementById("dataFim").value;
    const titulo_dieta = document.getElementById("tituloDieta").value;
    const objetivos = document.getElementById("objetivosDieta").value;

    const refeicoes = [];

    if (document.querySelector(".refeicao-box")) {
        const parent = document.querySelectorAll(".refeicao-box");
        for (p of parent) {
            const nome_refeicao = p.querySelector(".tituloRefeicao").value;
            const horario = p.querySelector(".horarioRefeicao").value;
            const refeicao = {
                nome_refeicao,
                horario
            }
            refeicoes.push(refeicao);
        };
    }

    const dieta = {
        id_cliente,
        data_inicio,
        data_fim,
        titulo_dieta,
        objetivos,
        refeicoes
    };

    const param = new URLSearchParams(window.location.search);
    if (!param || !param.get("id_dieta")) return;

    try {
        const req = await fetch("http://localhost:3000/dieta/" + param.get("id_dieta"), {
            method: "PUT",
            body: JSON.stringify(dieta),
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include"
        });

        const response = await req.json();
        if (response.sucesso) {
            window.location.href = "../dashboards/dashboardnutricionista.html";
        }
    } catch (error) {
        console.log(error);
    }
}
async function carregarDieta() {
    const param = new URLSearchParams(window.location.search);
    if (!param || !param.get("id_dieta")) {
        cadastrarDietaBtn.onclick = cadastrarDieta;
        voltar.onclick = () => sairSemSalvar("Tem certeza que deseja sair?");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/dieta/${param.get("id_dieta")}`, {
            credentials: "include"
        });
        const data = await response.json();
        if (data.error) return;
        const dados = data.sucesso;
        document.getElementById("idCliente").value = dados.id_cliente;
        document.getElementById("dataInicio").value = formatSqlDateToInput(dados.data_inicio);
        document.getElementById("dataFim").value = formatSqlDateToInput(dados.data_fim);
        document.getElementById("tituloDieta").value = dados.titulo_dieta;
        document.getElementById("objetivosDieta").value = dados.objetivos;
        quantidadeRefeicoes.value = dados.refeicoes.length;
        carregarCardRefeicao(dados.refeicoes.length, dados.refeicoes);
        cadastrarDietaBtn.textContent = "Atualizar";
        cadastrarDietaBtn.onclick = atualizarDieta;
        voltar.onclick = () => sairSemSalvar("Tem certeza que deseja sair? (alterações feitas não serão salvas)");
    } catch (error) {
        console.log(error);
    }
}
async function cadastrarDieta(e) {
    e.preventDefault();
    const id_cliente = document.getElementById("idCliente").value;
    const data_inicio = document.getElementById("dataInicio").value;
    const data_fim = document.getElementById("dataFim").value;
    const titulo_dieta = document.getElementById("tituloDieta").value;
    const objetivos = document.getElementById("objetivosDieta").value;

    const refeicoes = [];

    if (document.querySelector(".refeicao-box")) {
        const parent = document.querySelectorAll(".refeicao-box");
        for (p of parent) {
            const nome_refeicao = p.querySelector(".tituloRefeicao").value;
            const horario = p.querySelector(".horarioRefeicao").value;
            const refeicao = {
                nome_refeicao,
                horario
            }
            refeicoes.push(refeicao);
        };
    }

    const dieta = {
        id_cliente,
        data_inicio,
        data_fim,
        titulo_dieta,
        objetivos,
        refeicoes
    };
    
    try {
        const req = await fetch("http://localhost:3000/dieta", {
            method: "POST",
            body: JSON.stringify(dieta),
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include"
        });

        const response = await req.json();
        if (response.sucesso) {
            window.location.href = "../dashboards/dashboardnutricionista.html";
        }
    } catch (error) {
        console.log(error);
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

function sairSemSalvar(descricao) {
    abrirModal("Sair", descricao);
    if (!document.getElementById("modalAcceptBtn")) return;
    document.getElementById("modalAcceptBtn").onclick = () => {
        return window.location.href = "../dashboards/dashboardnutricionista.html";
    }
}