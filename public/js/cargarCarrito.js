document.addEventListener('DOMContentLoaded', () => {
    const cartContent = document.getElementById('cartContent');
    const authMessage = document.getElementById('authMessage'); // Contenedor para el mensaje de autenticación

    // Obtener los productos del carrito al cargar la página
    fetch('/carrito')
        .then((response) => {
            if (!response.ok) {
                if (response.status === 401) {
                    // Mostrar mensaje de autenticación
                    authMessage.innerHTML = '<p>Necesitas iniciar sesión para ver el carrito.</p>';
                }
                throw new Error('No Autorizado');
            }
            return response.json();
        })
        .then((data) => {
            if (data.length === 0) {
                cartContent.innerHTML = '<p>No tienes productos en el carrito.</p>';
            } else {
                data.forEach((product) => {
                    // Crear elementos HTML para cada producto
                    const cartItem = document.createElement('div');
                    cartItem.classList.add('cart-item');
                    cartItem.innerHTML = `
                        <div class="cart-item-img">
                            <img src="${product.imagen_url}" alt="${product.nombre}">
                        </div>
                        <div class="cart-item-desc">
                            <h2>${product.nombre}</h2>
                            <p>${product.procesador} | ${product.ram} RAM | ${product.rom} ${product.tipo_almacenamiento}</p>
                            <div class="price-row">
                                <h3>Precio:</h3>
                                <span class="price">$${product.precio}</span>
                            </div>
                            <div class="cant-row">
                                <h3>Cantidad:</h3>
                                <div class="quantity-control">
                                    <button class="decrease-quantity" data-id="${product.id}">-</button>
                                    <span class="quantity">${product.cantidad}</span>
                                    <button class="increase-quantity" data-id="${product.id}">+</button>
                                    <button class="delete-item" data-id="${product.id}"></button>
                                </div>
                            </div>
                        </div>
                    `;
                    cartContent.appendChild(cartItem);
                });

                // Agregar eventos a los botones
                attachEventListeners();
            }
        })
        .catch((error) => {
            console.error('Error al cargar el carrito:', error);
        });

    function attachEventListeners() {
        // Botones para aumentar cantidad
        document.querySelectorAll('.increase-quantity').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const productId = button.getAttribute('data-id');
                try {
                    const response = await fetch('/carrito/increase', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ producto_id: productId }),
                    });

                    const result = await response.json();

                    if (result.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Producto añadido',
                            text: 'Se ha añadido un producto al carrito.',
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: result.message,
                        });
                    }
                } catch (error) {
                    console.error('Error al aumentar cantidad:', error);
                }
            });
        });

        // Botones para disminuir cantidad
        document.querySelectorAll('.decrease-quantity').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const productId = button.getAttribute('data-id');
                try {
                    const response = await fetch('/carrito/decrease', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ producto_id: productId }),
                    });

                    const result = await response.json();

                    if (result.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Cantidad actualizada',
                            text: 'Se ha disminuido la cantidad del producto.',
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: result.message,
                        });
                    }
                } catch (error) {
                    console.error('Error al disminuir cantidad:', error);
                }
            });
        });

        // Botones para eliminar producto
        document.querySelectorAll('.delete-item').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const productId = button.getAttribute('data-id');
                try {
                    const response = await fetch('/carrito/delete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ producto_id: productId }),
                    });

                    const result = await response.json();

                    if (result.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Producto eliminado',
                            text: 'El producto ha sido eliminado del carrito.',
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: result.message,
                        });
                    }
                } catch (error) {
                    console.error('Error al eliminar el producto:', error);
                }
            });
        });
    }
});
