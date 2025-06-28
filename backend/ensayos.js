const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

router.post('/crearEnsayo', (req, res) => {
  const { materia, preguntas } = req.body;

  if (!materia || !Array.isArray(preguntas)) {
    console.error('❌ Datos inválidos al crear ensayo');
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  const plantillaPath = path.join(__dirname, '../frontend/src/ensayo_base.html');
  const destinoPath = path.join(__dirname, '../frontend', `ensayo_${materia}.html`);

  const preguntasJSON = preguntas.map(p => ({
    question: p.texto,
    options: [p.alternativa_a, p.alternativa_b, p.alternativa_c, p.alternativa_d],
    answer: p.correcta
  }));

  fs.readFile(plantillaPath, 'utf8', (err, plantilla) => {
    if (err) {
      console.error('❌ No se pudo leer la plantilla:', err);
      return res.status(500).json({ error: 'Error al leer plantilla base' });
    }

    if (!plantilla.includes('/*__PREGUNTAS__*/')) {
      console.error('❌ Marcador de preguntas no encontrado en la plantilla');
      return res.status(500).json({ error: 'Marcador de preguntas no encontrado' });
    }

    const contenidoFinal = plantilla.replace(
      'const questions = /*__PREGUNTAS__*/;',
      `const questions = ${JSON.stringify(preguntasJSON, null, 2)};`
    ).replace(/Ensayo/g, `Ensayo ${materia}`);

    fs.writeFile(destinoPath, contenidoFinal, err => {
      if (err) {
        console.error('❌ Error al guardar el ensayo:', err);
        return res.status(500).json({ error: 'No se pudo guardar el archivo HTML' });
      }

      console.log('✅ Ensayo generado:', destinoPath);
      res.json({ mensaje: 'Ensayo creado exitosamente' });
    });
  });
});

module.exports = router;
