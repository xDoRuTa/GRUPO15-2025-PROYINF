// GET /api/preguntas/libres/random
app.get('/api/preguntas/libres/random', async (req, res) => {
  try {
    const row = await db.oneOrNone(`
      SELECT id, titulo, enunciado, materia, alternativas_json
      FROM preguntas
      WHERE is_libre = TRUE
      ORDER BY RANDOM()  -- RAND() si usas MySQL
      LIMIT 1
    `);

    if (!row) return res.status(404).json({error: 'No hay preguntas libres'});

    const q = {
      id: row.id,
      titulo: row.titulo,
      enunciado: row.enunciado,
      materia: row.materia,
      alternativas: row.alternativas_json ? JSON.parse(row.alternativas_json) : null
    };
    res.json(q);
  } catch (e) {
    res.status(500).json({error: 'Error obteniendo pregunta libre'});
  }
});

// GET /api/preguntas/:id (opcional, si usas ?id=)
app.get('/api/preguntas/:id', async (req, res) => {
  const { id } = req.params;
  const row = await db.oneOrNone(`
    SELECT id, titulo, enunciado, materia, alternativas_json
    FROM preguntas
    WHERE id = $1
  `, [id]);
  if (!row) return res.sendStatus(404);
  res.json({
    id: row.id,
    titulo: row.titulo,
    enunciado: row.enunciado,
    materia: row.materia,
    alternativas: row.alternativas_json ? JSON.parse(row.alternativas_json) : null
  });
});

// POST /api/respuestas
app.post('/api/respuestas', async (req, res) => {
  const { pregunta_id, respuesta } = req.body;
  // inserta y asocia al alumno autenticado (si ya tienes auth)
  await db.none(`
    INSERT INTO respuestas (pregunta_id, respuesta, created_at)
    VALUES ($1, $2, NOW())
  `, [pregunta_id, respuesta]);
  res.sendStatus(201);
});

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { Pregunta } = require('../models/Pregunta'); // ajusta ruta

router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const body = req.body || {};
    if (Object.keys(body).length === 0 && !req.file) {
      return res.status(400).json({ error: 'Cuerpo vacío. Revisa Content-Type / parser.' });
    }

    if (req.file && !body.imagen) {
      body.imagen = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const p = new Pregunta(body);
    p.validarPregunta();

    // TODO: guarda en DB con p.toJSON()
    res.status(201).json({ ok: true, data: p.toJSON() });
  } catch (err) {
    console.error('Error al guardar pregunta:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;