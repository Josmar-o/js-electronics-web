document.addEventListener("DOMContentLoaded", () => { 
    // La URL ahora apunta a la ruta que devuelve los datos del usuario
    fetch('/perfil')
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    // Si el usuario no está autenticado, mostrar un SweetAlert y redirigir al login
                    return Swal.fire({
                        icon: 'error',
                        title: 'Error al cargar los datos',
                        text: 'No estás autenticado. Redirigiendo al login...'
                    }).then(() => {
                        // Redirige al login después de cerrar el Swal
                        window.location.href = '/html/login.html';
                    });
                }
                throw new Error('No se pudo obtener los datos del usuario');
            }
            return response.text(); // Leemos la respuesta como texto
        })
        .then(text => {
            try {
                
                const data = JSON.parse(text); // Intentamos convertir el texto en JSON
                const isoDate = data.fecha_registro;
                const date = new Date(isoDate);

                // Usar toLocaleString para formatear la fecha a un formato más legible
                const normalDate = date.toLocaleString('es-ES', {
                    weekday: 'long', // Día de la semana
                    year: 'numeric', // Año
                    month: 'long', // Mes
                    day: 'numeric', // Día
                    hour: '2-digit', // Hora
                    minute: '2-digit', // Minuto
                    second: '2-digit' // Segundo
                });

                // Si la respuesta es válida, se muestran los datos
                document.getElementById("nombre").textContent = data.nombre;
                document.getElementById("apellido").textContent = data.apellido;
                document.getElementById("email").textContent = data.email;
                document.getElementById("date").textContent = normalDate;
            } catch (error) {
                // Si no se puede convertir el texto en JSON, mostramos un error
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cargar los datos',
                    text: 'Respuesta inesperada del servidor.'
                });
            }
        })
        .catch(error => {
            // Muestra el error usando SweetAlert
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar los datos',
                text: error.message
            });
        });
});
