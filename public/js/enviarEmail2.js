// Public Key
emailjs.init("EV3NQx9m_jfiQEiDN"); 

const contactForm = document.getElementById("contact-form");


contactForm.addEventListener("submit", (event) => {
    event.preventDefault(); 

    // Send the form using EmailJS
    emailjs.sendForm('service_js_electronics', 'template_io2pzbo', contactForm)
    // Colocar el service id y template id correspondiente
    
        .then(() => {
            // Show success message
            Swal.fire({
                icon: "success",
                title: "Mensaje enviado",
                text: "Tu mensaje ha sido enviado con éxito. Nos pondremos en contacto contigo pronto.",
            });

            // Reset the form fields
            contactForm.reset();
        })
        .catch((error) => {
            // Show error message
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un problema al enviar tu mensaje. Por favor, inténtalo nuevamente.",
            });
            console.error("EmailJS Error:", error);
        });
});
