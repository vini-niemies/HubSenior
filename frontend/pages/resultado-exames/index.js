const form = document.getElementById("resultadoExamesForm");
const messageField = document.querySelector(".messageField");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      id_cliente: Number(document.getElementById("id_cliente").value),
      data_realizacao: document.getElementById("data_realizacao").value,
      percentual_gordura: document.getElementById("percentual_gordura").value || null,
      massa_magra: document.getElementById("massa_magra").value || null,
      gordura_visceral: document.getElementById("gordura_visceral").value || null,
      taxa_metabolica_basal: document.getElementById("taxa_metabolica_basal").value || null,
      colesterol_total: document.getElementById("colesterol_total").value || null,
      glicemia_jejum: document.getElementById("glicemia_jejum").value || null,
      outros_marcadores: document.getElementById("outros_marcadores").value || null
    };

    try {
      const req = await fetch("http://localhost:3000/resultado-exames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const response = await req.json();

      if (response.erro) {
        messageField.textContent = response.erro;
        return;
      }

      messageField.textContent = response.sucesso;
      form.reset();
    } catch (error) {
      messageField.textContent = "Erro ao cadastrar resultado de exames";
    }
  });
}
