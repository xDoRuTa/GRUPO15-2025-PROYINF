const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { Pregunta } = require('./Clases')

const app = express();
app.use(cors());
app.use(express.json());

// Configura la conexión (asegúrate que coincida con tu docker-compose)
const pool = new Pool({
    user: 'postgres',
    host: 'db',
    database: 'midb',
    password: 'postgres',
    port: 5432,
});

app.get('/api/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
});

app.listen(3000, () => {
    console.log('Backend escuchando en http://localhost:3000');
});

app.post('/api/preguntas', async (req, res) => {
    try {
        const { texto, materia, imagen, alternativaA, alternativaB, alternativaC, alternativaD, correcta } = req.body;

        const pregunta = new Pregunta(
            null, texto, materia, imagen, alternativaA, alternativaB, alternativaC, alternativaD, correcta
        );

        pregunta.validarPregunta();

        // Insertar en PostgreSQL
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