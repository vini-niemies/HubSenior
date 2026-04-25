const quantidadeRefeicoes = document.getElementById("nRefeicoesInput");
const cadastrarDietaBtn = document.getElementById("cadastrarDietaBtn");
const refeicoesContainer = document.querySelector(".refeicoes-container");

quantidadeRefeicoes.addEventListener("input", (e) => {
    if (e.target.value > 6) e.target.value = 6;
    refeicoesContainer.innerHTML = "";
    let i = 0;
    while (i < e.target.value) {
        refeicoesContainer.innerHTML += `<div class="refeicao-box">
          <div class="input-box">
            <input type="text" class="tituloRefeicao">
            <label class="input-label">Título da Refeição ${i + 1}</label>
          </div>
          <div class="input-box">
            <input type="time" class="horarioRefeicao">
            <label class="input-label">Horário da Refeição</label>
          </div>
        </div> `;
        i += 1;
    }

});

async function cadastrarDieta() {
    const id_cliente = document.getElementById("idCliente").value;
    const data_inicio = document.getElementById("dataInicio").value;
    const data_fim = document.getElementById("dataFim").value;
    const titulo_dieta = document.getElementById("tituloDieta").value;
    const objetivos = document.getElementById("objetivosDieta").value;

    const refeicoes = [];

    if (document.querySelector(".refeicao-box")) {
        const parent = document.querySelectorAll(".refeicao-box");
        parent.forEach(p => {
            const nome_refeicao = p.querySelector(".tituloRefeicao").value;
            const horario = p.querySelector(".horarioRefeicao").value;
            const refeicao = {
                nome_refeicao,
                horario
            }
            refeicoes.push(refeicao);
        });
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

cadastrarDietaBtn.addEventListener("click", (e) => {
    e.preventDefault();
    cadastrarDieta();
});