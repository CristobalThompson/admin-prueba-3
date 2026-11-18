# Admin · Sala de estudio

Sitio estático en español para preparar la Cátedra 3 de Administración de Empresas (ICA 4121, unidades 3 a 5). Las preguntas se elaboraron a partir de las fotos de la cátedra, los apuntes y las presentaciones del curso.

- **Frases:** 50 ejercicios. En fácil se elige entre cuatro opciones y en difícil se escribe el término. Se aceptan variantes previstas, diferencias de mayúsculas, tildes y espacios.
- **Alternativas:** 100 preguntas, con opciones mezcladas y explicación después de confirmar.
- **Desafío:** las 150 preguntas se mezclan sin repetición. Las frases se escriben. Un error termina el intento y el próximo comienza en cero. El récord se guarda en el navegador.

## Abrir en local

Abre `public/index.html` directamente o, desde la raíz del repositorio, ejecuta `python -m http.server 8000 --bind 127.0.0.1 --directory public` y visita [localhost:8000](http://127.0.0.1:8000).

## Publicar en Vercel

1. Crea un repositorio vacío en GitHub y sube este Git local:

   ```sh
   git remote add origin https://github.com/TU-USUARIO/estudio-admin.git
   git push -u origin main
   ```

2. En [Vercel](https://vercel.com/new), importa el repositorio. Deja la raíz del proyecto en `.` y pulsa **Deploy**.

`vercel.json` indica que se sirva `public/` sin comando de compilación. El sitio no requiere dependencias, servidor de aplicación ni variables de entorno. Consulta la [documentación de configuración de Vercel](https://vercel.com/docs/builds/configure-a-build).

El banco se edita en `public/banco.js`.
