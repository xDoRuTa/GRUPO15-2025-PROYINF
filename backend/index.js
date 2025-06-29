const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Pregunta } = require('./Clases');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const pool = new Pool({
    user: 'postgres',
    host: 'db',
    database: 'midb',
    password: 'postgres',
    port: 5432,
});

// ==========================
// ENDPOINTS
// ==========================

app.get('/api/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
});

app.get('/api/preguntas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM preguntas ORDER BY fecha_creacion DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener preguntas:', error);
        res.status(500).json({ error: 'Error al obtener preguntas' });
    }
});

app.get('/api/preguntas/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    try {
        const result = await pool.query('SELECT * FROM preguntas WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Pregunta no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener la pregunta:', error);
        res.status(500).json({ error: 'Error al obtener la pregunta' });
    }
});

app.post('/api/preguntas', async (req, res) => {
    try {
        const { texto, materia, imagen, alternativaA, alternativaB, alternativaC, alternativaD, correcta } = req.body;

        const pregunta = new Pregunta(
            null, texto, materia, imagen, alternativaA, alternativaB, alternativaC, alternativaD, correcta
        );

        pregunta.validarPregunta();

        const query = `
            INSERT INTO preguntas (texto, materia, imagen, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correcta)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
        `;

        const values = [
            pregunta.texto,
            pregunta.materia,
            pregunta.imagen,
            pregunta.alternativaA,
            pregunta.alternativaB,
            pregunta.alternativaC,
            pregunta.alternativaD,
            pregunta.correcta
        ];

        const result = await pool.query(query, values);

        res.status(201).json({ mensaje: 'Pregunta guardada en la base de datos', pregunta: result.rows[0] });
    } catch (error) {
        console.error('Error al guardar pregunta:', error);
        res.status(400).json({ error: error.message });
    }
});

// ==========================
// CREAR ENSAYO (usa plantilla dinámica)
// ==========================
app.post('/api/crearEnsayo', (req, res) => {
    const { materia, preguntas } = req.body;

    if (!materia || !Array.isArray(preguntas)) {
        console.error('❌ Datos inválidos al crear ensayo');
        return res.status(400).json({ error: 'Datos inválidos' });
    }

    const plantillaPath = path.join(__dirname, '../frontend/src/ensayo_base.html');
    const destinoPath = path.join(__dirname, `../frontend/ensayo_${materia}.html`);

    console.log(`📝 Usando plantilla: ${plantillaPath}`);
    console.log(`📄 Guardando ensayo generado en: ${destinoPath}`);

const preguntasJSON = preguntas.map(p => {
  const opciones = [p.alternativa_a, p.alternativa_b, p.alternativa_c, p.alternativa_d];
  const letras = ['A', 'B', 'C', 'D'];
  const indiceCorrecto = letras.indexOf(p.correcta);

  return {
    question: p.texto,
    options: opciones,
    answer: opciones[indiceCorrecto],
    image: p.imagen?.startsWith('data:image') ? p.imagen : (p.imagen ? `data:image/png;base64,${p.imagen}` : null)
  };
});

    fs.readFile(plantillaPath, 'utf8', (err, plantilla) => {
        if (err) {
            console.error('❌ No se pudo leer la plantilla:', err);
            return res.status(500).json({ error: 'Error al leer plantilla base' });
        }

        const marcador = 'const questions = /*__PREGUNTAS__*/;';
        if (!plantilla.includes(marcador)) {
            console.error('❌ Marcador no encontrado en plantilla');
            return res.status(500).json({ error: 'Marcador de preguntas no encontrado en la plantilla' });
        }

        const contenidoFinal = plantilla.replace(
            marcador,
            `const questions = ${JSON.stringify(preguntasJSON, null, 2)};`
        ).replace(/Ensayo/g, `Ensayo ${materia}`);

        console.log('🧪 Contenido generado (primeros 500 chars):\n', contenidoFinal.substring(0, 500), '...');

        fs.writeFile(destinoPath, contenidoFinal, err => {
            if (err) {
                console.error('❌ Error al guardar el ensayo:', err);
                return res.status(500).json({ error: 'No se pudo guardar el archivo HTML' });
            }

            console.log('✅ Ensayo generado correctamente:', destinoPath);
            res.json({ mensaje: 'Ensayo creado exitosamente' });
        });
    });
});

// ==========================
// ELIMINAR PREGUNTA
// ==========================
app.delete('/api/preguntas/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const result = await pool.query('DELETE FROM preguntas WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pregunta no encontrada' });
        }

        res.status(200).json({
            mensaje: 'Pregunta eliminada correctamente',
            preguntaEliminada: result.rows[0]
        });
    } catch (error) {
        console.error('Error al eliminar la pregunta:', error);
        res.status(500).json({ error: 'Error al eliminar la pregunta' });
    }
});

// ==========================
// INICIAR SERVIDOR
// ==========================
app.listen(3000, () => {
    console.log('🚀 Backend escuchando en http://localhost:3000');
});
