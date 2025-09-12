// backend/routes/preguntas.js
const express = require('express');
const router = express.Router();

// Si usas pg-promise:
const db = require('../db'); 

// (Opcional) endpoint para saber si hay stock
router.get('/libres/exists', async (_req, res) => {
  try {
    const row = await db.one(`SELECT COUNT(*)::int AS count FROM preguntas WHERE is_libre = TRUE`);
    if (row.count === 0) return res.sendStatus(204);
    return res.json({ count: row.count });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error comprobando disponibilidad' });
  }
});

// GET /api/preguntas/libres/random
router.get('/libres/random', async (_req, res) => {
  try {
    const row = await db.oneOrNone(`
      SELECT
        id,
        titulo,
        enunciado,
        materia,
        alternativa_a,
        alternativa_b,
        alternativa_c,
        alternativa_d,
        correcta,
        is_libre,
        imagen_url
      FROM preguntas
      WHERE is_libre = TRUE
      ORDER BY RANDOM()
      LIMIT 1
    `);

    if (!row) return res.status(404).json({ error: 'No hay preguntas libres' });

    // Normaliza el shape para el front
    const q = {
      id: row.id,
      titulo: row.titulo,
      enunciado: row.enunciado,
      materia: row.materia,
      opciones: [
        row.alternativa_a,
        row.alternativa_b,
        row.alternativa_c,
        row.alternativa_d,
      ].filter(Boolean),
      correcta: row.correcta,           // 'A' | 'B' | 'C' | 'D'
      imagen: row.imagen_url || null,
    };

    return res.json(q);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error obteniendo pregunta libre' });
  }
});

// (Opcional) GET /api/preguntas/:id
router.get('/:id', async (req, res) => {
  try {
    const row = await db.oneOrNone(`
      SELECT
        id, titulo, enunciado, materia,
        alternativa_a, alternativa_b, alternativa_c, alternativa_d,
        correcta, imagen_url
      FROM preguntas
      WHERE id = $1
    `, [req.params.id]);

    if (!row) return res.sendStatus(404);

    return res.json({
      id: row.id,
      titulo: row.titulo,
      enunciado: row.enunciado,
      materia: row.materia,
      opciones: [
        row.alternativa_a,
        row.alternativa_b,
        row.alternativa_c,
        row.alternativa_d,
      ].filter(Boolean),
      correcta: row.correcta,
      imagen: row.imagen_url || null,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error cargando pregunta' });
  }
});

module.exports = router;
