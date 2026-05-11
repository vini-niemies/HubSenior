document.addEventListener("DOMContentLoaded", async () => {
  
  const paginasNutri = [
    "http://localhost:3000/pages/dashboards/dashboardnutricionista.html",
    "http://localhost:3000/pages/dieta/index.html"
  ];

  const paginasCliente = [
    "http://localhost:3000/pages/dashboards/dashboardcliente.html"
  ];
  
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
  if (dados.role === "nutricionista") {
    if (paginasCliente.includes(window.location.href)) {
      return window.location.href = "../pages/dashboards/dashboardnutricionista.html";
    }
  } else if (dados.role === "cliente") {
    if (paginasNutri.includes(window.location.href)) {
      return window.location.href = "../pages/dashboards/dashboardcliente.html";
    }
  } else {
    return window.location.href = "../pages/home/index.html";
  }
});