const form = document.getElementById("dietaForm");
const messageField = document.querySelector(".messageField");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const refeicoes = [
      document.getElementById("refeicao1")?.value?.trim(),
      document.getElementById("refeicao2")?.value?.trim(),
      document.getElementById("refeicao3")?.value?.trim(),
      document.getElementById("refeicao4")?.value?.trim()
    ]
      .filter(Boolean)
      .map((descricao, index) => ({
        nome_refeicao: `Refeicao ${index + 1}`,
        horario: null,
        detalhes_alimentos: descricao
      }));

    const payload = {
      id_cliente: Number(document.getElementById("id_cliente").value),
      data_inicio: document.getElementById("data_inicio").value,
      data_fim: document.getElementById("data_fim").value || null,
      titulo_dieta: document.getElementById("titulo_dieta").value.trim() || null,
      objetivos: document.getElementById("objetivos").value.trim() || null,
      observacoes_gerais: document.getElementById("detalhes_alimentos").value.trim() || null,
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
        messageField.textContent = response.erro;
        return;
      }

      messageField.textContent = response.sucesso;
      form.reset();
    } catch (error) {
      messageField.textContent = "Erro ao cadastrar dieta";
    }
  });
}
