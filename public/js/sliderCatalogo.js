document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('price-slider');
    const minPriceDisplay = document.getElementById('min-price');
    const maxPriceDisplay = document.getElementById('max-price');
    const minPriceInput = document.getElementById('min-price-input');
    const maxPriceInput = document.getElementById('max-price-input');

    // Crear el slider
    noUiSlider.create(slider, {
        start: [0, 3000], 
        connect: true, 
        range: {
            'min': 0,
            'max': 3000
        },
        step: 100 // Incrementos de precio en 100
    });

    // Actualizar valores mostrados y los inputs ocultos
    slider.noUiSlider.on('update', (values) => {
        const [min, max] = values.map(v => Math.round(v));
        minPriceDisplay.textContent = min;
        maxPriceDisplay.textContent = max;
        minPriceInput.value = min;
        maxPriceInput.value = max;
    });
});
