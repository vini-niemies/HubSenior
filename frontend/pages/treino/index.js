const voltar = document.getElementById("voltarBtn");
const exercicioItems = document.querySelectorAll(".exercise-item");
const criarTreinoForm = document.getElementById("form-treino");
let isEditing = false;
let editingId = null;

document.addEventListener("DOMContentLoaded", () => {
    const param = new URLSearchParams(window.location.search);
    if (param || param.get("id_cliente")) {
        document.getElementById("idCliente").value = param.get("id_cliente");
    }
    carregarTreino();
});

async function carregarTreino() {
    const param = new URLSearchParams(window.location.search);
    const id_treino = param.get("id_treino");
    if (!id_treino) {
        isEditing = false;
        editingId = null;
        voltar.onclick = () => sairSemSalvar("Tem certeza que deseja sair?");
        return;
    }

    isEditing = true;
    editingId = id_treino;

    try {
        const response = await fetch(`http://localhost:3000/treino/${id_treino}`, {
            method: "GET",
            credentials: "include"
        });
        const data = await response.json();
        if (data.erro || !data.sucesso || data.sucesso.length <= 0) {
            abrirAlerta("Erro", "Falha ao carregar treino");
            return;
        }

        const treino = data.sucesso[0];

        const nomeEl = document.getElementById("tituloDieta");
        if (nomeEl) nomeEl.value = treino.nome_treino || "";

        const idClienteEl = document.getElementById("idCliente");
        if (idClienteEl) idClienteEl.value = treino.id_cliente || "";

        const objetivosEl = document.getElementById("objetivosTreino");
        if (objetivosEl) objetivosEl.value = treino.objetivos || "";

        if (treino.dia_semana) {
            const radio = document.querySelector(`input[name="diaSemana"][value="${treino.dia_semana}"]`);
            if (radio) radio.checked = true;
        }

        if (Array.isArray(treino.exercicios)) {
            exercicioItems.forEach(item => {
                const checkbox = item.querySelector('.exercicio');
                const grupoEl = item.querySelector('.grupo');
                const descansoEl = item.querySelector('.descanso');
                const repeticoesEl = item.querySelector('.repeticoes');
                const cargaEl = item.querySelector('.carga');
                const videoLinkEl = item.querySelector('.video-link');
                if (!checkbox) return;

                if (videoLinkEl) {
                    if (!videoLinkEl.dataset.defaultHref) {
                        videoLinkEl.dataset.defaultHref = videoLinkEl.getAttribute("href") || "#";
                    }
                    if (!videoLinkEl.dataset.defaultText) {
                        videoLinkEl.dataset.defaultText = videoLinkEl.textContent || "Vídeo";
                    }
                }

                const match = treino.exercicios.find(e => e.nome === checkbox.value || e.nome_exercicio === checkbox.value);
                if (match) {
                    checkbox.checked = true;
                    if (grupoEl) grupoEl.value = match.grupo_muscular || match.grupo || "";
                    if (descansoEl) descansoEl.value = match.tempo_descanso || "";
                    if (repeticoesEl) repeticoesEl.value = match.repeticoes || "";
                    if (cargaEl) cargaEl.value = match.carga || "";
                    if (videoLinkEl) {
                        if (match.link_video) {
                            videoLinkEl.href = match.link_video;
                            videoLinkEl.textContent = "Vídeo";
                        } else {
                            videoLinkEl.href = videoLinkEl.dataset.defaultHref || "#";
                            videoLinkEl.textContent = videoLinkEl.dataset.defaultText || "Vídeo";
                        }
                    }
                } else {
                    checkbox.checked = false;
                    if (grupoEl) grupoEl.value = "";
                    if (descansoEl) descansoEl.value = "";
                    if (repeticoesEl) repeticoesEl.value = "";
                    if (cargaEl) cargaEl.value = "";
                    if (videoLinkEl) {
                        videoLinkEl.href = videoLinkEl.dataset.defaultHref || "#";
                        videoLinkEl.textContent = videoLinkEl.dataset.defaultText || "Vídeo";
                    }
                }
            });
        }

        const submitBtn = criarTreinoForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = "Atualizar Treino";
        voltar.onclick = () => window.location.href = "../dashboards/dashboardpersonal.html";
    } catch (error) {
        console.log(error);
        abrirAlerta("Erro", "Erro ao carregar treino");
    }
}
function formatSqlDateToInput(dateValue) {
    if (!dateValue) return "";
    const asString = String(dateValue);
    if (asString.includes("T")) return asString.split("T")[0];
    if (asString.includes(" ")) return asString.split(" ")[0];
    return asString;
}
function abrirAlerta(titulo, descricao) {
    const modal = document.querySelector(".modal");
    if (!modal) return;
    modal.classList.add("is-active");
    modal.innerHTML = `
	<div class="modal-content">
      <h2>${titulo}</h2>
      <p>${descricao}</p>
      <div>
        <button onclick="fecharModal()">Fechar</button>
      </div>
    </div>
	`;
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

    const url = isEditing ? `http://localhost:3000/treino/${editingId}` : "http://localhost:3000/treino";
    const method = isEditing ? "PUT" : "POST";
    if (isEditing) treino.id_treino = editingId;

    const req = await fetch(url, {
        method,
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
        abrirAlerta("Erro", typeof data.erro === "string" ? data.erro : "Erro ao cadastrar treino");
    }
});
voltar.addEventListener("click", () => sairSemSalvar("Deseja voltar ao Dashboard?"));