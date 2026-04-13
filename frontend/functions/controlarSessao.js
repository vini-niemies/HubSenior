document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("http://localhost:3000/auth/me", {
    method: "POST"
  });
  const data = await response.json();
  if (data.erro) {
    const responseRefresh = await fetch("http://localhost:3000/auth/refresh", {
      method: "POST"
    });
    const dataRefresh = await responseRefresh.json();
    console.log(dataRefresh)
    if (dataRefresh.erro) return window.location.href = "../home/index.html";
    window.location.reload();
  }
});