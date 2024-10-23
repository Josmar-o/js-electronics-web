
document.addEventListener('DOMContentLoaded', function () {
    // Load navbar
    fetch('/public/reutilizable/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
        });

});