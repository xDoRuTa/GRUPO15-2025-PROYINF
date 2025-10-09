const $c = document.getElementById('contenedor');
const BACKEND_URL = 'http://localhost:3000'; // tu backend en Docker

async function cargarPregunta() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/ensayos`);
    if (!res.ok) throw new Error('No se pudo obtener la pregunta');

    const q = await res.json();

    // Usa q.titulo o q.enunciado según tu backend
    const textoPregunta = q.titulo || q.enunciado || 'Pregunta';

    $c.innerHTML = `
      <article class="tarjeta">
        <h2>${q.materia ? `[${q.materia}] ` : ''}${textoPregunta}</h2>
        ${q.imagen ? `<img src="${q.imagen}" alt="Imagen" style="max-width:100%; margin:1rem 0;">` : ''}
        <form id="form-respuesta">
          <textarea name="resp_texto" rows="4" placeholder="Escribe tu respuesta..." required></textarea>
          <button type="submit">Enviar respuesta</button>
        </form>
        <div style="margin-top:1rem;">
          <button id="otra">Otra pregunta libre</button>
        </div>
      </article>
    `;

    // Solo mostramos alerta por ahora (aún no guardamos respuestas)
    document.getElementById('form-respuesta').addEventListener('submit', e => {
      e.preventDefault();
      const respuesta = e.target.resp_texto.value.trim();
      if (respuesta) alert(`Respuesta enviada: ${respuesta}`);
      e.target.reset();
    });

    document.getElementById('otra').addEventListener('click', cargarPregunta);

  } catch (err) {
    console.error(err);
    $c.innerHTML = `<p>⚠️ No se pudo cargar la pregunta libre</p>`;
  }
}

// Cargar la primera pregunta
cargarPregunta();
