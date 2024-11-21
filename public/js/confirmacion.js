document.addEventListener("DOMContentLoaded", () => {
    // Obtener el pedido_id de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const pedido_id = urlParams.get("pedido_id");

    if (!pedido_id) {
        console.error("No se encontró un pedido_id en la URL.");
        document.body.innerHTML = "<p>Error: No se pudo cargar la información del pedido.URL</p>";
        return;
    }

    // Solicitar los datos del pedido al backend
    fetch(`/api/pedido/confirmacion?pedido_id=${pedido_id}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error al cargar el pedido:", data.error);
                document.body.innerHTML = `<p>Error: ${data.error}</p>`;
                return;
            }

            // Mostrar los datos del pedido
            document.getElementById("usuario-nombre").textContent = data.usuario;

            const orderDetails = document.getElementById("order-details");
            data.productos.forEach(producto => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <span>${producto.nombre} (x${producto.cantidad})</span>
                    <span>$${producto.precio_total.toFixed(2)}</span>
                `;
                orderDetails.appendChild(listItem);
            });

            document.getElementById("total-amount").textContent = `$${data.total.toFixed(2)}`;
        })
        .catch(error => {
            console.error("Error al cargar los datos del pedido:", error);
            // Mostrar SweetAlert con el mensaje de error
            Swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: 'No se pudo cargar la información del pedido.',
            }).then(() => {
                window.location.href = '/html/home.html';
            });
           
        });
});
