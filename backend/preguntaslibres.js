const $c = document.getElementById('contenedor');

async function cargarPregunta() {
  try {
    const res = await fetch('/api/preguntas/libres/random'); // ruta relativa, mismo host/puerto
    if (!res.ok) throw new Error('No se pudo obtener la pregunta');
    const q = await res.json();

    $c.innerHTML = `
      <article class="tarjeta">
        <h2>${q.materia ? `[${q.materia}] ` : ''}${q.texto || 'Pregunta'}</h2>
        ${q.imagen ? `<img src="${q.imagen}" alt="Imagen de la pregunta" style="max-width:100%; margin:1rem 0;">` : ''}
        <form id="form-respuesta">
          <textarea name="resp_texto" rows="4" placeholder="Escribe tu respuesta..." required></textarea>
          <button type="submit">Enviar respuesta</button>
        </form>
        <div style="margin-top:1rem;">
          <button id="otra">Otra pregunta libre</button>
        </div>
      </article>
    `;

    // Enviar respuesta
    document.getElementById('form-respuesta').addEventListener('submit', async e => {
      e.preventDefault();
      const form = e.target;
      const respuesta = form.resp_texto.value.trim();

      const r = await fetch('/api/respuestas', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ pregunta_id: q.id, respuesta })
      });

      if (r.ok) {
        alert('Respuesta registrada');
        form.reset();
      } else {
        alert('No se pudo registrar la respuesta');
      }
    });

    // Pedir otra pregunta
    document.getElementById('otra').addEventListener('click', () => cargarPregunta());

  } catch (err) {
    console.error(err);
    $c.innerHTML = `<p>⚠️ No hay preguntas libres o el servidor no respondió correctamente.</p>`;
  }
}

// Cargar la primera pregunta al abrir la página
cargarPregunta();
