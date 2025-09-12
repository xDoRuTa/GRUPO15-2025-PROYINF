const express = require('express');
const { Pool } = require('pg');

const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Pregunta } = require('./Clases');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET','POST','DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

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
    const {
      texto, materia, imagen,
      alternativaA, alternativaB, alternativaC, alternativaD,
      correcta,
      libre, is_libre
    } = req.body;

    const libreBool =
      typeof libre !== 'undefined'
        ? (libre === true || libre === 'true' || libre === '1' || libre === 'si' || libre === 'sí')
        : (is_libre === true || is_libre === 'true');

    const pregunta = new Pregunta({
      id: null,
      texto, materia, imagen,
      alternativaA, alternativaB, alternativaC, alternativaD,
      correcta,
      libre: libreBool
    });

    pregunta.validarPregunta();

    const query = `
      INSERT INTO preguntas
        (texto, materia, imagen, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correcta, libre)
      VALUES
        ($1,   $2,     $3,    $4,            $5,            $6,            $7,            $8,       $9)
      RETURNING *;
    `;
    const values = [
      pregunta.texto, pregunta.materia, pregunta.imagen,
      pregunta.alternativaA, pregunta.alternativaB, pregunta.alternativaC, pregunta.alternativaD,
      pregunta.correcta, pregunta.libre
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
  const destinoPath   = path.join(__dirname, `../frontend/ensayo_${materia}.html`);

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

    const contenidoFinal = plantilla
      .replace(marcador, `const questions = ${JSON.stringify(preguntasJSON, null, 2)};`)
      .replace(/Ensayo/g, `Ensayo ${materia}`);

    console.log('🧪 Contenido generado (primeros 500 chars):\n', contenidoFinal.substring(0, 500), '...');

    fs.writeFile(destinoPath, contenidoFinal, err2 => {
      if (err2) {
        console.error('❌ Error al guardar el ensayo:', err2);
        return res.status(500).json({ error: 'No se pudo guardar el archivo HTML' });
      }
      console.log('✅ Ensayo generado correctamente:', destinoPath);
      res.json({ mensaje: 'Ensayo creado exitosamente' });
    });
  });
});

// ==========================
// PREGUNTAS LIBRES
// ==========================

// Random: trae una pregunta marcada como "libre"
app.get('/api/preguntas/libres/random', async (req, res) => {
  try {
    const q = await pool.query(`
      SELECT id, texto, materia,
             alternativa_a, alternativa_b, alternativa_c, alternativa_d,
             correcta, imagen
      FROM preguntas
      WHERE
        (CAST(libre AS TEXT) = 't' OR CAST(libre AS TEXT) = 'true')
        OR (LOWER(CAST(libre AS TEXT)) IN ('true','t','1','yes','y','si','sí'))
        OR (CAST(libre AS TEXT) ~ '^[1-9][0-9]*$')
      ORDER BY RANDOM()
      LIMIT 1
    `);

    if (q.rowCount === 0) {
      return res.status(404).json({ error: 'No hay preguntas libres' });
    }

    const r = q.rows[0];
    const alternativas = [r.alternativa_a, r.alternativa_b, r.alternativa_c, r.alternativa_d].filter(Boolean);

    // 🔁 Respuesta “compatible” con tu front:
    return res.json({
      id: r.id,
      // ambos nombres para el enunciado
      titulo: r.texto,
      enunciado: r.texto,
      materia: r.materia,
      // ambos nombres para las opciones
      alternativas,        // ← muchos de tus componentes esperan esto
      opciones: alternativas,
      correcta: r.correcta, // 'A'|'B'|'C'|'D'
      imagen: r.imagen || null
    });
  } catch (error) {
    console.error('Error obteniendo libre:', error);
    return res.status(500).json({ error: 'Error obteniendo pregunta libre' });
  }
});
// Diagnóstico: cuenta cuántas "libres" hay y muestra DB/puerto
app.get('/api/debug/libres', async (req, res) => {
  try {
    const countSql = `
      SELECT COUNT(*)::int AS libres
      FROM preguntas
      WHERE
        (CAST(libre AS TEXT) = 't' OR CAST(libre AS TEXT) = 'true')
        OR (LOWER(CAST(libre AS TEXT)) IN ('true','t','1','yes','y','si','sí'))
        OR (CAST(libre AS TEXT) ~ '^[1-9][0-9]*$')
    `;
    const sampleSql = `
      SELECT id FROM preguntas
      WHERE
        (CAST(libre AS TEXT) = 't' OR CAST(libre AS TEXT) = 'true')
        OR (LOWER(CAST(libre AS TEXT)) IN ('true','t','1','yes','y','si','sí'))
        OR (CAST(libre AS TEXT) ~ '^[1-9][0-9]*$')
      ORDER BY RANDOM() LIMIT 1
    `;
    const dbInfoSql = `SELECT current_database() AS db, inet_server_port() AS port`;

    const [{ rows: [c] }, { rows: s }, { rows: [info] }] = await Promise.all([
      pool.query(countSql),
      pool.query(sampleSql),
      pool.query(dbInfoSql),
    ]);

    res.json({
      libres: c?.libres ?? 0,
      sample_id: s?.[0]?.id ?? null,
      db: info?.db,
      port: info?.port
    });
  } catch (e) {
    console.error('ERROR /api/debug/libres:', e);
    res.status(500).json({ error: e.message });
  }
});

// Fallback JSON para rutas /api que no existan (evita devolver HTML)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada', path: req.path });
});

// ==========================
// INICIAR SERVIDOR
// ==========================
app.listen(3000, () => {
  console.log('🚀 Backend escuchando en http://localhost:3000');
});
