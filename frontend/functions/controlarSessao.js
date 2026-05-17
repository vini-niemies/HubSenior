document.addEventListener("DOMContentLoaded", async () => {

  const response = await fetch("http://localhost:3000/auth/me", {
    method: "POST",
    credentials: "include"
  });
  const data = await response.json();
  if (data.erro) {
    const responseRefresh = await fetch("http://localhost:3000/auth/refresh", {
      method: "POST",
      credentials: "include"
    });
    const dataRefresh = await responseRefresh.json();
    if (dataRefresh.erro) return window.location.href = "../home/index.html";
    window.location.reload();
  }
  const dados = data.sucesso;
});