document.addEventListener("DOMContentLoaded", async () => {
    const responseRole = await fetch("http://localhost:3000/auth/me", {
        method: "POST"
    });
    const data = await responseRole.json();
    if (!data.sucesso) return;
    const response = await fetch(data.sucesso.role === "nutricionista" ? "http://localhost:3000/user/nutricionista" : "http://localhost:3000/user/cliente");
    const dataDados = await response.json();
    if (!dataDados.sucesso) return;
    const dados = dataDados.sucesso;
    if (data.sucesso.role === "nutricionista") {
        document.querySelector(".login-box").innerHTML += `
            <form id="formAtualizarNutricionista">
                    <div class="input-box">
                        <input type="text" id="nomeNutriInput" name="nome" required value="${dados.nome}">
                        <label>Nome Completo</label>
                    </div>

                    <div class="input-box">
                        <input type="email" id="emailNutriInput" name="email" required value="${dados.email}">
                        <label>E-mail</label>
                    </div>

                    <div class="input-box">
                        <input type="text" id="telefoneNutriInput" name="telefone" required value="${dados.telefone}">
                        <label>Telefone</label>
                    </div>

                    <div class="input-box">
                        <input type="text" id="instagramNutriInput" name="instagram" required value="${dados.instagram}">
                        <label>Instagram</label>
                    </div>

                    <div class="input-box">
                        <input type="text" id="enderecoNutriInput" name="endereco" required value="${dados.endereco}">
                        <label>Endereco</label>
                    </div>

                    <button id="loginBtn" type="submit">Salvar</button>
                    <button class=ancoraBtn id="voltarBtn">Voltar</button>
                    <button id="excluirContaBtnCliente" type="button" onclick="excluirConta()">Excluir Conta</button>
                </form>
        `;

        document.getElementById("voltarBtn").onclick = (e) => {
            e.preventDefault();
            abrirModal("Sair", "Deseja sair?");
            if (!document.getElementById("modalAcceptBtn")) return;
            document.getElementById("modalAcceptBtn").onclick = () => {
                window.location.href = "../dashboards/dashboardnutricionista.html";
            }
        }

        const formAtualizarNutricionista = document.getElementById("formAtualizarNutricionista");
        formAtualizarNutricionista.addEventListener("submit", async (event) => {
            event.preventDefault();

            const payload = {
                nome: document.getElementById("nomeNutriInput").value,
                email: document.getElementById("emailNutriInput").value,
                telefone: document.getElementById("telefoneNutriInput").value,
                instagram: document.getElementById("instagramNutriInput").value,
                endereco: document.getElementById("enderecoNutriInput").value
            };

            abrirModal("Salvar Alterações", "Deseja salvar as alterações?");
            if (!document.getElementById("modalAcceptBtn")) return;
            document.getElementById("modalAcceptBtn").onclick = async () => {
                const resultado = await atualizarDadosNutricionista(payload);
                if (resultado?.sucesso) {
                    return window.location.href = "../dashboards/dashboardnutricionista.html";
                } else {
                    return alert(resultado?.erro || "Erro ao atualizar dados");
                }
            }
        });
    } else if (data.sucesso.role === "cliente") {
        document.querySelector(".login-box").innerHTML += `<form id="formAtualizarCliente">
                    <div class="input-box">
                        <input type="text" id="nomeInput" name="nome" required value="${dados.nome}">
                        <label>Nome Completo</label>
                    </div>

                    <div class="input-box">
                        <input type="email" id="emailInput" name="email" required value="${dados.email}">
                        <label>E-mail</label>
                    </div>

                    <div class="input-box">
                        <input type="date" id="dataNascimentoInput" name="data_nascimento" required value="${formatSqlDateToInput(dados.data_nascimento)}">
                        <label>Data de Nascimento</label>
                    </div>

                    <div class="input-box">
                        <input type="text" id="enderecoInput" name="endereco" required value="${dados.endereco}">
                        <label>Endereco</label>
                    </div>

                    <div class="input-box">
                        <input type="text" id="objetivoInput" name="objetivo" required value="${dados.objetivo}">
                        <label>Objetivo</label>
                    </div>

                    <button id="loginBtn" type="submit">Salvar</button>
                    <button class=ancoraBtn id="voltarBtn">Voltar</button>
                    <button id="excluirContaBtnCliente" type="button" onclick="excluirConta()">Excluir Conta</button>
                </form>`;

        document.getElementById("voltarBtn").onclick = (e) => {
            e.preventDefault();
            abrirModal("Sair", "Deseja sair?");
            if (!document.getElementById("modalAcceptBtn")) return;
            document.getElementById("modalAcceptBtn").onclick = () => {
                window.location.href = "../dashboards/dashboardcliente.html";
            }
        }

        const formAtualizarCliente = document.getElementById("formAtualizarCliente");
        formAtualizarCliente.addEventListener("submit", async (event) => {
            event.preventDefault();
            const payload = {
                nome: document.getElementById("nomeInput").value,
                email: document.getElementById("emailInput").value,
                data_nascimento: document.getElementById("dataNascimentoInput").value,
                endereco: document.getElementById("enderecoInput").value,
                objetivo: document.getElementById("objetivoInput").value
            };
            abrirModal("Salvar Alterações", "Deseja salvar as alterações?");
            if (!document.getElementById("modalAcceptBtn")) return;
            document.getElementById("modalAcceptBtn").onclick = async () => {
                const resultado = await atualizarDadosCliente(payload);
                if (resultado?.sucesso) {
                    return window.location.href = "../dashboards/dashboardcliente.html";
                } else {
                    return alert(resultado?.erro || "Erro ao atualizar dados");
                }
            }
        });
    }
});
///funcao pra colocar a data do sql em formato do input do html
function formatSqlDateToInput(dateValue) {
    if (!dateValue) return "";
    const asString = String(dateValue);
    if (asString.includes("T")) return asString.split("T")[0];
    if (asString.includes(" ")) return asString.split(" ")[0];
    return asString;
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
        }
    };
}
async function excluirConta() {
    try {
        abrirModal("Excluir Conta", "Tem certeza que deseja excluir sua conta? (essa ação não pode ser desfeita)");
        if (!document.getElementById("modalAcceptBtn")) return;
        document.getElementById("modalAcceptBtn").onclick = async () => {
            const response = await fetch("http://localhost:3000/auth/me", {
                method: "POST",
                credentials: "include"
            });
            const data = await response.json();
            if (data.erro) return console.log(reqData.erro);;
            const URI = data.sucesso.role === "nutricionista"
                ? "http://localhost:3000/user/nutricionista"
                : "http://localhost:3000/user/cliente";
            const req = await fetch(URI, {
                method: "DELETE",
                credentials: "include"
            });
            const reqData = await req.json();
            if (reqData.erro) return console.log(reqData.erro);
            window.location.href = "../home/index.html";
        }
    } catch (error) {
        console.log(error);
    }
}
async function atualizarDadosCliente(payload) {
    const response = await fetch("http://localhost:3000/user/cliente", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        credentials: "include"
    });

    return await response.json();
}
async function atualizarDadosNutricionista(payload) {
    const response = await fetch("http://localhost:3000/user/nutricionista", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
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