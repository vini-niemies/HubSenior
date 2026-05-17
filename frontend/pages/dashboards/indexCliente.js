const messageCliente = document.getElementById("messageCliente");
const logoutBtn = document.getElementById("logoutBtn");
const associarForm = document.getElementById("associarCodigo");

function formatarData(data) {
	if (!data) return "Nao definida";
	const dataNormalizada = String(data).includes("T") ? String(data).split("T")[0] : String(data);
	const [ano, mes, dia] = dataNormalizada.split("-");
	if (!ano || !mes || !dia) return dataNormalizada;
	return `${dia}/${mes}/${ano}`;
}

function formatarHorario(horario) {
	if (!horario) return "Horario livre";
	return String(horario).slice(0, 5);
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

function renderizarDietas(dietas) {
	if (!dietas) {
		return;
	}
	const listaDietas = document.querySelector(".dieta-container-list");
	listaDietas.innerHTML = "";
	if (dietas.length < 1) {
		const li = document.createElement("li");
		li.className = "dieta-item";
		li.innerHTML = `
			<div class="dieta-item-header">
                <div class="dieta-item-text dieta-item-title">Sem dietas <i class="fa-solid fa-face-sad-cry" style="color: rgba(242,113,33,0.8);"></i></div>
            </div>
		`
		listaDietas.appendChild(li);
	}
	
	dietas.forEach(d => {
		const li = document.createElement("li");
		li.className = "dieta-item";
		li.innerHTML = `
            <div class="dieta-item-header">
                <div class="dieta-item-text dieta-item-title">${d.titulo_dieta}</div>
                <button class="btn-interact"><i class="fa-solid fa-caret-right" style="color: rgb(255, 255, 255);"></i></button>
            </div>
            <div class="dieta-item-mais">
                <div class="dieta-item-text">Início: ${formatarData(d.data_inicio)}</div>
                <div class="dieta-item-text">Fim: ${formatarData(d.data_fim)}</div>
                ${d.refeicoes.map(r => `
                <div class="dieta-item-dieta">
                    <div class="dieta-item-dieta-title">${r.nome_refeicao}</div>
                    <div class="dieta-item-dieta-hour">Horário: ${formatarHorario(r.horario)}</div>
                </div>`).join("")}
                <div class="dieta-item-subtext">Objetivo: ${d.objetivos}</div>
            </div>
        `;
		listaDietas.appendChild(li);
	});
}

function renderizarTreinos(treinos) {
	if (!treinos) {
		return;
	}
	const listaTreinos = document.querySelector(".treinos-container-list");
	listaTreinos.innerHTML = "";
	if (treinos.length < 1) {
		const li = document.createElement("li");
		li.className = "treino-item";
		li.innerHTML = `
			<div class="dieta-item-header">
                <div class="dieta-item-text dieta-item-title">Sem treinos <i class="fa-solid fa-face-sad-cry" style="color: rgba(242,113,33,0.8);"></i></div>
            </div>
		`
		listaTreinos.appendChild(li);
	}
	
	treinos.forEach(t => {
		const li = document.createElement("li");
		li.className = "dieta-item";
		li.innerHTML = `
            <div class="dieta-item-header">
                <div class="dieta-item-text dieta-item-title">${t.nome_treino}</div>
                <button class="btn-interact"><i class="fa-solid fa-caret-right" style="color: rgb(255, 255, 255);"></i></button>
            </div>
            <div class="dieta-item-mais">
                <div class="dieta-item-text">Dia: ${t.dia_semana}</div>
                ${t.exercicios.map(e => `
                <div class="dieta-item-dieta">
                    <div class="dieta-item-dieta-title">${e.nome}</div>
                    <div class="dieta-item-dieta-hour">Grupo: ${e.grupo_muscular}</div>
                    <div class="dieta-item-text">Repetições: ${e.repeticoes} | Carga: ${e.carga}kg</div>
                    <div class="dieta-item-text">Descanso: ${e.tempo_descanso}s</div>
                    ${e.link_video ? `<div class="dieta-item-subtext"><a class="treino-video-link" href="${e.link_video}" target="_blank" rel="noopener">Video</a></div>` : ""}
                </div>`).join("")}
                <div class="dieta-item-subtext">Objetivo: ${t.objetivos || "Não definido"}</div>
            </div>
        `;
		listaTreinos.appendChild(li);
	});
}

document.querySelector(".dieta-container-list").addEventListener("click", (e) => {
	const btn = e.target.closest(".btn-interact");
	if (!btn) return;

	const item = btn.closest(".dieta-item");
	const mais = item.querySelector(".dieta-item-mais");
	const icon = btn.querySelector("i");

	mais.classList.toggle("active");
	if (mais.classList.contains("active")) {
		icon.classList.replace("fa-caret-right", "fa-caret-down");
	} else {
		icon.classList.replace("fa-caret-down", "fa-caret-right");
	}
});

document.querySelector(".treinos-container-list").addEventListener("click", (e) => {
	const btn = e.target.closest(".btn-interact");
	if (!btn) return;

	const item = btn.closest(".dieta-item");
	const mais = item.querySelector(".dieta-item-mais");
	const icon = btn.querySelector("i");

	mais.classList.toggle("active");
	if (mais.classList.contains("active")) {
		icon.classList.replace("fa-caret-right", "fa-caret-down");
	} else {
		icon.classList.replace("fa-caret-down", "fa-caret-right");
	}
});

async function carregarDietasCliente() {
	const response = await fetch("http://localhost:3000/dieta", {
		method: "GET",
		credentials: "include"
	});
	return await response.json();
}

async function carregarTreinosCliente() {
	const response = await fetch("http://localhost:3000/treino", {
		method: "GET",
		credentials: "include"
	});
	return await response.json();
}

function renderizarAssociados(associados) {
	if (!associados) return;
	const usersList = document.querySelector(".usuarios-list");
	usersList.innerHTML = "";

	const associadosChaves = Object.keys(associados);
	let hasAssociados = false;
	
	associadosChaves.forEach(a => {
		if (associados[a] === null) return;
		hasAssociados = true;
		const li = document.createElement("li");
		li.classList.add("usuario-item");
		if (a.includes("nutricionista")) {
			li.innerHTML = `<span class="usuario-name"><i class="fa-solid fa-user" style="color: #f27121;"></i>Nutricionista ${associados[a]}</span>`;
		} else if (a.includes("personal")) {
			li.innerHTML = `<span class="usuario-name"><i class="fa-solid fa-user" style="color: #f27121;"></i>Personal ${associados[a]}</span>`;
		}
		usersList.appendChild(li);
	});

	if (!hasAssociados) {
		const li = document.createElement("li");
		li.classList.add("usuario-item");
		li.innerHTML = "Sem usuários associados";
		usersList.appendChild(li);
	}
}

async function carregarAssociadosCliente() {
	const response = await fetch("http://localhost:3000/user/cliente/associados", {
		method: "GET",
		credentials: "include"
	});
	return await response.json(); 
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

document.addEventListener("DOMContentLoaded", async () => {
	try {
		const responseCliente = await fetch("http://localhost:3000/user/cliente", {
			method: "GET",
			credentials: "include"
		});
		const dataCliente = await responseCliente.json();

		if (dataCliente?.sucesso?.nome) {
			messageCliente.innerHTML = `Olá, ${dataCliente.sucesso.nome}<p>Bem-Vindo de volta!</p>`;
		}

		const dietas = await carregarDietasCliente();
		if (dietas.sucesso) {
			renderizarDietas(dietas.sucesso);
		}

		const treinos = await carregarTreinosCliente();
		if (treinos.sucesso) {
			renderizarTreinos(treinos.sucesso);
		}

		const associados = await carregarAssociadosCliente();
		if (associados.sucesso) {
			renderizarAssociados(associados.sucesso);
		}
	} catch (error) {
		console.error("Erro ao carregar dados do dashboard:", error);
	}
});

logoutBtn.addEventListener("click", () => {
	abrirModal("Sair", "Tem certeza que deseja sair?");
	if (!document.getElementById("modalAcceptBtn")) return;
	document.getElementById("modalAcceptBtn").onclick = async () => {
		await logout();
	}
});

associarForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	const inputCodigo = document.getElementById("inputCodigo");
	const reqBody = {
		codigo: inputCodigo.value
	};
	const req = await fetch("http://localhost:3000/user/cliente/codigo", {
		method: "POST",
		body: JSON.stringify(reqBody),
		headers: {
			"Content-type": "application/json"
		},
		credentials: "include"
	});
	const data = await req.json();
	if (data.erro) {
		abrirModal("Erro", data.erro);
		if (document.querySelector(".modal-content")) {
			document.querySelector(".modal-content").innerHTML = `
			<h2>Erro</h2>
			<p>${data.erro}</p>
			<div>
				<button onclick=fecharModal()>Fechar</button>
			</div>
			`;
		}
	} else if (data.sucesso) {
		abrirModal("Sucesso", data.sucesso);
		if (document.querySelector(".modal-content")) {
			document.querySelector(".modal-content").innerHTML = `
			<h2>Sucesso</h2>
			<p>${data.sucesso}</p>
			<div>
				<button onclick=fecharModal()>Fechar</button>
			</div>
			`;
		}
		inputCodigo.value = "";
	}
});