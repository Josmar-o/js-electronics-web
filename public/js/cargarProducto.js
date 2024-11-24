document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        fetch(`/productos/${productId}`)
            .then(response => response.json())
            .then(product => {
                // Agregar los detalles del producto
                document.getElementById('product-image').src = product.imagen_url;
                document.getElementById('product-name').textContent = product.nombre;
                document.getElementById('product-price').textContent = `$${product.precio}`;

                //Agregar los detalles del producto
                document.getElementById('spec-procesador').textContent = product.procesador;
                document.getElementById('spec-ram').textContent = `${product.ram}`;
                document.getElementById('spec-almacenamiento').textContent = `${product.rom} ${product.tipo_almacenamiento}`;
                document.getElementById('spec-tamano').textContent = product.tamano_pantalla;
                document.getElementById('spec-resolucion').textContent = product.resolucion_pantalla;
                document.getElementById('spec-sistema').textContent = product.sistema_operativo;
                document.getElementById('spec-grafica').textContent = product.tarjeta_grafica;
                document.getElementById('spec-peso').textContent = `${product.peso} kg`;
                document.getElementById('spec-dimensiones').textContent = product.dimensiones;
                document.getElementById('spec-garantia').textContent = `${product.garantia_meses} meses`;
                document.getElementById('product-description').textContent = product.descripcion;
                //Codigo que agreag el href al boton de whatsapp
                document.getElementById('link').href = `https://wa.me/50768608313?text=Hola%2C%20me%20interesa%20el%20producto%20${product.nombre}%20que%20esta%20en%20su%20web`;


                // Agregar el ID del producto al formulario de agregar al carrito
                document.getElementById('productValue').value = product.id;
            })
            .catch(err => console.error('Error', err));
    } else {
        console.error('No hay ID en el HTTP.');
    }
});
