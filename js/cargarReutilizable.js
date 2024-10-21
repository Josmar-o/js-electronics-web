
document.addEventListener('DOMContentLoaded', function () {
    // Load navbar
    fetch('../reutilizable/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
        });

    // Load footer
    // fetch('reutilizable/footer.html')
    //     .then(response => response.text())
    //     .then(data => {
    //         document.getElementById('footer').innerHTML = data;
    //     });
});