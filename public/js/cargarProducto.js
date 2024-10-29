document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        fetch(`/productos/${productId}`)
            .then(response => response.json())
            .then(product => {
                // Populate the HTML with the product details
                document.getElementById('product-image').src = product.imagen_url;
                document.getElementById('product-name').textContent = product.nombre;
                document.getElementById('product-price').textContent = `$${product.precio}`;

                // Populate specifications dynamically
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
            })
            .catch(err => console.error('Error fetching product details:', err));
    } else {
        console.error('No product ID provided in URL.');
    }
});
