function irParaPlataforma() {
    window.location.href = '../home/index.html';
}

document.addEventListener('DOMContentLoaded', function () {
    const heroLeft = document.querySelector('.hero-left');
    const heroRight = document.querySelector('.hero-right');

    if (heroLeft && heroRight) {
        heroLeft.style.opacity = '0';
        heroLeft.style.transform = 'translateX(-30px)';
        heroRight.style.opacity = '0';
        heroRight.style.transform = 'translateX(30px)';

        setTimeout(() => {
            heroLeft.style.transition = 'all 0.8s ease-out';
            heroLeft.style.opacity = '1';
            heroLeft.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            heroRight.style.transition = 'all 0.8s ease-out';
            heroRight.style.opacity = '1';
            heroRight.style.transform = 'translateX(0)';
        }, 200);
    }
});

function verificarSessao() {
    const token = localStorage.getItem('token');
    const tipoUsuario = localStorage.getItem('tipoUsuario');

    if (token && tipoUsuario) {
        const dashboards = {
            'cliente': '../dashboards/dashboardcliente.html',
            'nutricionista': '../dashboards/dashboardnutricionista.html',
            'personal': '../dashboards/dashboardpersonal.html'
        };

        const dashboard = dashboards[tipoUsuario] || '../home/index.html';
        window.location.href = dashboard;
    }
}
verificarSessao();
