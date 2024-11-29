document.addEventListener('DOMContentLoaded', function() {

    fetch('/news')
        .then(response => response.json())
        .then(data => {
            const catalogSection = document.querySelector('.news-content');
            data.forEach(news => {
                // maybe in a future <a href="#" class="news-link"> </a> para que sean links a las noticias
                const newsElement = `
                
                        <div class="news-item">
                            <div class="news-item-img">
                            <img src="${news.imagen_url}" alt="">
                            </div>
                            <div class="news-item-desc">
                            <h3>${news.titulo}</h3>
                            <p>${news.contenido}</p>
                            </div>
                        </div>
                   
                `;
                catalogSection.innerHTML += newsElement;
            });
        })
        .catch(err => console.error(err));
});
