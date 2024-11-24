document.addEventListener('DOMContentLoaded', function () {
    // Cargar el favicon
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = "/public/img/tab_icon/paw_tab_icon.svg"; 
    link.type = "image/x-icon";
    document.head.appendChild(link);

    // Cargar la navbar
    fetch('/public/reutilizable/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
            
            // Verificar la existencia de los botones
            const logoutButton = document.getElementById('logout-button');
            const loginButton = document.getElementById('login-button');
            const misPedidosButton = document.getElementById('misPedidos-button');
            const searchButton = document.getElementById('search-button');
            const perfilButton = document.getElementById('perfil-button');
            const searchInput = document.getElementById('header-search-input');

            // Agregar event listener al botón de búsqueda solo si existe
            if (searchButton && searchInput) {
                searchButton.addEventListener('click', function(event) {
                    event.preventDefault();  
                    const searchQuery = searchInput.value.trim();
                    if (searchQuery) {
                        window.location.href = `/html/catalog.html?search=${encodeURIComponent(searchQuery)}`;
                    }
                });
            }

            // Función para alternar los botones según el estado de inicio de sesión
            function toggleButtons(isLoggedIn) {
                if (logoutButton && loginButton) {
                    if (isLoggedIn) {
                        logoutButton.style.display = 'inline-block'; // Mostrar "Cerrar sesión"
                        misPedidosButton.style.display = 'inline-block'; // Mostrar "Mis pedidos"
                        perfilButton.style.display = 'inline-block'; // Mostrar "Perfil"
                        loginButton.style.display = 'none'; // Ocultar "Iniciar sesión"


                    } else {
                        logoutButton.style.display = 'none'; // Ocultar "Cerrar sesión"
                        misPedidosButton.style.display = 'none'; // Ocultar "Mis pedidos"
                        loginButton.style.display = 'inline-block'; // Mostrar "Iniciar sesión"
                    }
                }
            }

            // Verificar si el usuario está logueado
            fetch('/isLoggedIn')
                .then(response => response.json())
                .then(data => {
                    if (data.logged_in) {
                        toggleButtons(true); // Usuario está logueado
                        // Agregar evento al botón de "Cerrar sesión"
                        logoutButton.addEventListener('click', function(event) {
                            event.preventDefault();
                            fetch('/logout', { method: 'POST' })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.message === 'Logout successful') {
                                        Swal.fire({
                                            title: '¡Sesión cerrada!',
                                            text: 'Has cerrado sesión exitosamente.',
                                            icon: 'success',
                                            confirmButtonText: 'Aceptar',
                                        }).then(() => {
                                            window.location.href = '/html/home.html';
                                        });
                                    }
                                })
                                .catch(error => {
                                    Swal.fire({
                                        title: 'Error',
                                        text: 'Ocurrió un error durante el proceso de cierre de sesión.',
                                        icon: 'error',
                                        confirmButtonText: 'Aceptar',
                                    });
                                });
                        });
                    } else {
                        toggleButtons(false); // Usuario no está logueado
                    }
                })
                .catch(error => console.error('Error fetching session info:', error));

            // Verificar si el usuario es admin
            fetch('/get-session-info')
                .then(response => response.json())
                .then(data => {
                    if (data.is_admin) {
                        const navbar = document.getElementById('navbar');
                        const adminLink = document.createElement('li');
                        adminLink.innerHTML = '<a href="/admin/dashboard.html">ADMIN DASHBOARD</a>';
                        navbar.querySelector('ul').appendChild(adminLink);
                    }
                })
                .catch(error => console.error('Error fetching session info:', error));

        })
        .catch(error => console.error('Error fetching header:', error));

    // Cargar el footer
    fetch('/public/reutilizable/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer').innerHTML = data;
        })
        .catch(error => console.error('Error fetching footer:', error));
});
