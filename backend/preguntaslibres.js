const $c = document.getElementById('contenedor');
const BACKEND_URL = 'http://localhost:3000'; // Ajusta según tu backend

async function cargarPregunta() {
  try {
    $c.innerHTML = '<p>Cargando pregunta libre...</p>';

    const res = await fetch(`${BACKEND_URL}/api/preguntas/libres/random`);
    if (!res.ok) throw new Error('No se pudo obtener la pregunta');

    const q = await res.json();
    const textoPregunta = q.titulo || q.enunciado || 'Pregunta libre';

    // Generar HTML según tipo de pregunta
    let htmlOpciones = '';
    if (q.opciones && q.opciones.length > 0) {
      q.opciones.forEach((op, i) => {
        htmlOpciones += `
          <label>
            <input type="radio" name="resp_opcion" value="${op}" required>
            <span>${op}</span>
          </label>
        `;
      });
    }

    $c.innerHTML = `
      <article class="tarjeta">
        <h2>${q.materia ? `[${q.materia}] ` : ''}${textoPregunta}</h2>
        ${q.imagen ? `<img src="${q.imagen}" alt="Imagen" style="max-width:100%; margin:1rem 0;">` : ''}
        <form id="form-respuesta">
          ${htmlOpciones ? `<div id="opciones">${htmlOpciones}</div>` : 
            `<textarea name="resp_texto" rows="4" placeholder="Escribe tu respuesta..." required></textarea>`}
          <button type="submit" class="btn-primario">Enviar respuesta</button>
        </form>
        <div class="contenedor-otra">
          <button id="otra" type="button" class="btn-secundario">Otra pregunta libre</button>
        </div>
      </article>
    `;

    // Enviar respuesta
    document.getElementById('form-respuesta').addEventListener('submit', async e => {
      e.preventDefault();

      let respuesta;
      if (q.opciones && q.opciones.length > 0) {
        const formData = new FormData(e.target);
        respuesta = formData.get('resp_opcion');
      } else {
        respuesta = e.target.resp_texto.value.trim();
        if (!respuesta) return alert('✏️ Escribe una respuesta antes de enviar');
      }

      try {
        const resp = await fetch(`${BACKEND_URL}/api/respuestas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pregunta_id: q.id,
            respuesta
          })
        });

        if (!resp.ok) throw new Error('Error al guardar la respuesta');

        alert('✅ Respuesta enviada correctamente');
        e.target.reset();
      } catch (err) {
        console.error('Error al enviar la respuesta:', err);
        alert('⚠️ No se pudo enviar la respuesta');
      }
    });

    document.getElementById('otra').addEventListener('click', cargarPregunta);

  } catch (err) {
    console.error(err);
    $c.innerHTML = `<p>⚠️ No se pudo cargar la pregunta libre</p>`;
  }
}

// Cargar la primera pregunta
cargarPregunta();
