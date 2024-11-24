document.getElementById('blog-form').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const formData = new FormData(this);
    const data = {
      titulo: formData.get('titulo'),
      contenido: formData.get('contenido'),
      imagen_url: formData.get('imagen_url'),
    };
  
    fetch('/agregar-blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => response.text())
      .then((data) => {
        if (data === 'Blog agregado exitosamente') {
          Swal.fire({
            title: '¡Éxito!',
            text: 'El blog se ha agregado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            document.getElementById('blog-form').reset();
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al agregar el blog.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error en el servidor.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      });
  });
  