// Initialize EmailJS
emailjs.init('EV3NQx9m_jfiQEiDN'); // Replace with your actual public key

// Add event listener for form submission
window.onload = function() {
    document.getElementById('contact-form').addEventListener('submit', function(event) {
        event.preventDefault();
        // Use EmailJS to send form data
        emailjs.sendForm('service_js_electronics', 'template_io2pzbo', this)
            .then(() => {
                this.reset();
                console.log('SUCCESS!');
            }, (error) => {
                console.log('FAILED...', error);
            
            });
    });
};
