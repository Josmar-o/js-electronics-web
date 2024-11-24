// Función para obtener los pedidos del servidor (puedes adaptar esta parte según tu servidor)
async function obtenerPedidos() {
    try {
        const response = await fetch('/mis-pedidos'); // Suponiendo que tienes esta ruta en tu backend
        const data = await response.json();
        
        if (data.pedidos && data.pedidos.length > 0) {
            mostrarPedidos(data.pedidos);
        } else {
            Swal.fire({
                icon: 'info',
                title: 'No tienes pedidos',
                text: 'Actualmente no tienes pedidos en tu cuenta.',
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
    }
}

// Función para mostrar los pedidos en la tabla
function mostrarPedidos(pedidos) {
    const tableBody = document.querySelector('#pedidosTable tbody');
    tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos elementos
    let pedidoNum = 0;  // Variable para llevar el número de pedido secuencial
    let pedidoAnterior = null;
    let totalPorPedido = 0; // Variable para acumular el total de cada pedido

    pedidos.forEach(pedido => {
        const row = document.createElement('tr');
        row.classList.add('normalRow');

        if (pedido.pedido_id === pedidoAnterior) {
            pedido.pedidoNum = pedidoNum;
        } else {
            pedidoNum++;  
            pedido.pedidoNum = pedidoNum;

            // Mostrar el total acumulado de pedidos anteriores antes de empezar con el siguiente grupo
            if (pedidoAnterior !== null) {
                // Mostrar el total y número del pedido antes de la siguiente fila
                const totalRow = document.createElement('tr');
                totalRow.classList.add('totalRow');
                totalRow.innerHTML = `
                    <td colspan="1" style="text-align: left;">TOTAL Pedido ${pedidoNum - 1}:</td>
                    <td colspan="4" style="padding-right: 10%; text-align: right;">
                        <a href="/html/confirmacion.html?pedido_id=${pedido.pedido_id - 1}">Ver Confirmacion</a>
                    </td>
                    <td style="padding-right: 10%; text-align: right;">
                        $${totalPorPedido.toFixed(2)}
                    </td>
                    <td colspan="2" style= "padding-right: 4%; text-align: right;">${new Date(pedido.fecha_pedido).toLocaleDateString()}</td>
                `;
                tableBody.appendChild(totalRow);

                // Crear una fila vacía para crear un espacio entre los grupos de pedidos
                const spacerRow = document.createElement('tr');
                spacerRow.classList.add('spacerRow');
                spacerRow.innerHTML = `<td colspan="8" style="height: 10px;"></td>`; // Un espacio entre los grupos
                tableBody.appendChild(spacerRow);

                totalPorPedido = 0; // Reiniciar el acumulado para el siguiente grupo
            }
        }

        pedidoAnterior = pedido.pedido_id;
        totalPorPedido += pedido.cantidad * pedido.precio_unitario; // Acumular el total por pedido
        
        // Crear celdas para cada columna
        row.innerHTML = `
            <td>${pedido.pedidoNum}</td>
            <td>${pedido.producto}</td>
            <td>${pedido.cantidad}</td>
            <td>$${pedido.precio_unitario}</td>
            <td>$${(pedido.cantidad * pedido.precio_unitario).toFixed(2)}</td>
            <td>$${pedido.total}</td>
            <td>${pedido.estado}</td>
            <td>${new Date(pedido.fecha_pedido).toLocaleDateString()}</td>
        `;
        
        // Añadir la fila a la tabla
        tableBody.appendChild(row);
    });

    // Al finalizar, mostrar el total del último grupo de pedidos
    if (pedidoNum > 0) {
        const totalRow = document.createElement('tr');
        totalRow.classList.add('totalRow');
        totalRow.innerHTML = `
            <td colspan="1" style="text-align: left;">TOTAL Pedido ${pedidoNum}:</td>
            <td colspan="4" style="padding-right: 10%; text-align: right;">
                <a href="/html/confirmacion.html?pedido_id=${pedidos[pedidos.length - 1].pedido_id}">Ver Confirmacion</a>
            </td>
            <td style="padding-right: 10%; text-align: right;">
                $${totalPorPedido.toFixed(2)}
            </td>
            
            <td colspan="2" style="padding-right: 4%; text-align: right;">${new Date(pedidos[pedidos.length - 1].fecha_pedido).toLocaleDateString()}</td>
            
        `;
        tableBody.appendChild(totalRow);
    }
}

// Llamar a la función para cargar los pedidos cuando se cargue la página
document.addEventListener('DOMContentLoaded', obtenerPedidos);
