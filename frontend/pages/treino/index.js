const voltar = document.getElementById("voltarBtn");
const exercicioItems = document.querySelectorAll(".exercise-item");
const criarTreinoForm = document.getElementById("form-treino");

function formatSqlDateToInput(dateValue) {
    if (!dateValue) return "";
    const asString = String(dateValue);
    if (asString.includes("T")) return asString.split("T")[0];
    if (asString.includes(" ")) return asString.split(" ")[0];
    return asString;
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
        return window.location.href = "../dashboards/dashboardpersonal.html";
    }
}

criarTreinoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const exercicios = [];
    for (const item of exercicioItems) {
        const checkbox = item.querySelector('.exercicio');
        if (!checkbox || !checkbox.checked) continue;

        const grupoEl = item.querySelector('.grupo');
        const descansoEl = item.querySelector('.descanso');
        const repeticoesEl = item.querySelector('.repeticoes');
        const cargaEl = item.querySelector('.carga');
        const videoLinkEl = item.querySelector('.video-link');

        const exercicio = {
            nome: checkbox.value || '',
            grupo_muscular: grupoEl ? grupoEl.value : '',
            tempo_descanso: descansoEl ? descansoEl.value : '',
            repeticoes: repeticoesEl ? repeticoesEl.value : '',
            carga: cargaEl ? cargaEl.value : '',
            link_video: videoLinkEl ? videoLinkEl.href : ''
        };

        exercicios.push(exercicio);
    }

    const objetivos = document.getElementById("objetivosTreino");
    const nome = document.getElementById("tituloDieta");
    const id_cliente = document.getElementById("idCliente");
    const diaSemana = document.querySelector('input[name="diaSemana"]:checked');

    const treino = {
        id_cliente: id_cliente ? id_cliente.value : "",
        nome_treino: nome ? nome.value : "",
        dia_semana: diaSemana ? diaSemana.value : "",
        objetivos: objetivos ? objetivos.value : "",
        exercicios: exercicios ? exercicios : []
    };

    const req = await fetch("http://localhost:3000/treino", {
        method: "POST",
        body: JSON.stringify(treino),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    })
    const data = await req.json();
    if (data.sucesso) {
        window.location.href = "../dashboards/dashboardpersonal.html";
        return;
    }

    if (data.erro) {
        alert(typeof data.erro === "string" ? data.erro : "Erro ao cadastrar treino");
    }
});
voltar.addEventListener("click", () => sairSemSalvar("Deseja voltar ao Dashboard?"));