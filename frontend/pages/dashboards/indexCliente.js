const listaDietasCliente = document.getElementById("listaDietasCliente");
const messageCliente = document.getElementById("messageCliente");
const logoutBtn = document.getElementById("logoutBtn");

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
	if (!dietas || dietas.length === 0) {
		return listaDietasCliente.innerHTML = '<p class="cards-div-message">Nenhuma dieta encontrada.</p>';
	}

	listaDietasCliente.innerHTML = dietas.map((dieta) => {
		const refeicoes = dieta.refeicoes && dieta.refeicoes.length > 0
			? dieta.refeicoes.map((refeicao) => `
					<div class="card-texto">
						<span>${refeicao.nome_refeicao}:</span> ${formatarHorario(refeicao.horario)}
					</div>
				`).join("")
			: '<div class="card-texto">Nenhuma refeicao cadastrada.</div>';

		return `
			<div class="card-cliente card-dieta" data-dieta="${dieta.id_dieta}">
				<div class="card-content">
					<div class="card-texto"><span>Titulo:</span> ${dieta.titulo_dieta}</div>
					<div class="card-texto"><span>Inicio:</span> ${formatarData(dieta.data_inicio)}</div>
					<div class="card-texto"><span>Fim:</span> ${formatarData(dieta.data_fim)}</div>
					<div class="card-texto"><span>Objetivos:</span> ${dieta.objetivos || "Nao informado"}</div>
					<div class="card-info card-info-visible">
						<div class="card-texto"><span>Refeicoes:</span></div>
						${refeicoes}
					</div>
				</div>
			</div>
		`;
	}).join("");
}

async function carregarDietasCliente() {
	const response = await fetch("http://localhost:3000/dieta", {
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

		const dataDietas = await carregarDietasCliente();
		if (dataDietas.erro) {
			listaDietasCliente.innerHTML = '<p class="cards-div-message">Erro ao carregar dietas.</p>';
			return;
		}

		renderizarDietas(dataDietas.sucesso || []);
	} catch (error) {
		listaDietasCliente.innerHTML = '<p class="cards-div-message">Erro ao carregar dietas.</p>';
	}
});

logoutBtn.addEventListener("click", () => {
	abrirModal("Sair", "Tem certeza que deseja sair?");
	if (!document.getElementById("modalAcceptBtn")) return;
	document.getElementById("modalAcceptBtn").onclick = async () => {
		await logout();
	}
});