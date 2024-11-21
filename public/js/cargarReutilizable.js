document.addEventListener('DOMContentLoaded', function () {
    //Cargar tab icon o favicon en cada html
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = "/public/img/tab_icon/paw_tab_icon.svg"; 
        link.type = "image/x-icon";
        document.head.appendChild(link);
   
    // Load navbar
    fetch('/public/reutilizable/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;

            // After loading navbar, check session info
            fetch('/get-session-info')
                .then(response => response.json())
                .then(data => {
                    // Check if the user is an admin
                    if (data.is_admin) {
                        const navbar = document.getElementById('navbar');
                        const adminLink = document.createElement('li');
                        adminLink.innerHTML = '<a href="/html/admin/dashboard.html">ADMIN DASHBOARD</a>';
                        navbar.querySelector('ul').appendChild(adminLink);
                    }
                })
                .catch(error => console.error('Error fetching session info:', error));
        });
        fetch('/public/reutilizable/footer.html')
        .then(response => response.text())
        .then(data => {
            document.ge4tElementById('footer').innerHTML = data;
        });
        

});
