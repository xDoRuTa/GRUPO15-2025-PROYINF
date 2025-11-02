// ────────────────────────────────────────────────────────────────
//  CARGA BÁSICA Y CONFIG
// ────────────────────────────────────────────────────────────────
require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const session = require('cookie-session');
const { google } = require('googleapis');

const { Pregunta } = require('./Clases');

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// ────────────────────────────────────────────────────────────────
//  MIDDLEWARES
// ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET','POST','DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Sesión para guardar tokens OAuth (en dev está ok; en prod considera DB)
app.use(session({
  name: 'gc_session',
  keys: [process.env.SESSION_SECRET || 'dev_secret_change_me'],
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: 'lax'
}));

// ────────────────────────────────────────────────────────────────
//  BASE DE DATOS
// ────────────────────────────────────────────────────────────────
const pool = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'midb',
  password: 'postgres',
  port: 5432,
});

// ────────────────────────────────────────────────────────────────
//  HELPERS GOOGLE OAUTH + CLASSROOM
// ────────────────────────────────────────────────────────────────
function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.OAUTH_REDIRECT_URI
  );
}

const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly'
];

function classroomClientFromSession(req) {
  if (!req.session || !req.session.gcTokens) return null;
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(req.session.gcTokens);
  return google.classroom({ version: 'v1', auth: oauth2Client });
}

// ────────────────────────────────────────────────────────────────
//  RUTAS OAUTH
// ────────────────────────────────────────────────────────────────
app.get('/auth/google', (req, res) => {
  const oauth2Client = getOAuth2Client();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES
  });
  return res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(req.query.code);
    req.session.gcTokens = tokens; // ← si quieres, persiste en PostgreSQL
    return res.redirect('/auth/success');
  } catch (e) {
    console.error('OAuth callback error:', e);
    return res.status(500).send('Error en autenticación con Google');
  }
});

// Página simple para confirmar login rápido
app.get('/auth/success', (_req, res) => {
  res.send('✅ Autenticado con Google. Ahora prueba GET /api/classroom/courses');
});

// ────────────────────────────────────────────────────────────────
//  ENDPOINTS GOOGLE CLASSROOM
// ────────────────────────────────────────────────────────────────
app.get('/api/classroom/courses', async (req, res) => {
  try {
    const classroom = classroomClientFromSession(req);
    if (!classroom) return res.status(401).json({ error: 'No autenticado con Google' });

    const { data } = await classroom.courses.list({ courseStates: ['ACTIVE'] });
    return res.json(data.courses || []);
  } catch (e) {
    console.error('courses error:', e);
    return res.status(500).json({ error: 'No se pudieron obtener los cursos' });
  }
});

app.get('/api/classroom/courses/:courseId/courseWork', async (req, res) => {
  try {
    const classroom = classroomClientFromSession(req);
    if (!classroom) return res.status(401).json({ error: 'No autenticado con Google' });

    const { courseId } = req.params;
    const { data } = await classroom.courses.courseWork.list({ courseId });
    return res.json(data.courseWork || []);
  } catch (e) {
    console.error('courseWork error:', e);
    return res.status(500).json({ error: 'No se pudo obtener el coursework' });
  }
});

app.get('/api/classroom/courses/:courseId/students', async (req, res) => {
  try {
    const classroom = classroomClientFromSession(req);
    if (!classroom) return res.status(401).json({ error: 'No autenticado con Google' });

    const { courseId } = req.params;
    const { data } = await classroom.courses.students.list({ courseId });
    return res.json(data.students || []);
  } catch (e) {
    console.error('students error:', e);
    return res.status(500).json({ error: 'No se pudo obtener la lista de estudiantes' });
  }
});

// ────────────────────────────────────────────────────────────────
//  ENDPOINTS EXISTENTES
// ────────────────────────────────────────────────────────────────
app.get('/api/usuarios', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
});

app.get('/api/preguntas', async (_req, res) => {
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

    // ESTO ESTABA SEPARADO POR EL CÓDIGO MAL PEGADO
    pregunta.validarPregunta();

    const query = `
      INSERT INTO preguntas
        (texto, materia, imagen, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correcta, libre)
      VALUES
        ($1,   $2,     $3,    $4,            $5,            $6,            $7,            $8,       $9)
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
}); // <-- AQUÍ TERMINA /api/preguntas


// ────────────────────────────────────────────────────────────────
//  ENDPOINT PARA RECIBIR RESPUESTAS (¡ESTE ES EL CORREGIDO!)
// ────────────────────────────────────────────────────────────────
app.post('/api/respuestas', async (req, res) => {
  try {
    const { pregunta_id, respuesta } = req.body;

    // Validación simple
    if (!pregunta_id || typeof respuesta === 'undefined') {
      return res.status(400).json({ error: 'Faltan datos (pregunta_id o respuesta)' });
    }

    console.log(`✅ Respuesta recibida para pregunta ID [${pregunta_id}]: ${respuesta}`);

    // --- IMPORTANTE ---
    // Aquí es donde, en el futuro, guardaremos la respuesta en la base de datos.
    // Por ahora, solo confirmamos que la recibimos.
    /*
    const result = await pool.query(
      'INSERT INTO respuestas_usuarios (pregunta_id, respuesta_dada, fecha) VALUES ($1, $2, NOW()) RETURNING *',
      [pregunta_id, respuesta]
    );
    */
    // --- Fin del ejemplo ---

    // Respondemos con 201 (Created) para que el frontend sepa que todo salió bien.
    res.status(201).json({ mensaje: 'Respuesta recibida correctamente' });

  } catch (error) {
    console.error('Error al guardar respuesta:', error);
    res.status(500).json({ error: 'Error interno al procesar la respuesta' });
  }
});


// Crear Ensayo (usa plantilla dinámica)
app.post('/api/crearEnsayo', (req, res) => {
  const { materia, preguntas } = req.body;

  if (!materia || !Array.isArray(preguntas)) {
    console.error('❌ Datos inválidos al crear ensayo');
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  const plantillaPath = path.join(__dirname, '../frontend/src/ensayo_base.html');
  const destinoPath   = path.join(__dirname, `../frontend/ensayo_${materia}.html`);

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

    fs.writeFile(destinoPath, contenidoFinal, err2 => {
      if (err2) {
        console.error('❌ Error al guardar el ensayo:', err2);
        return res.status(500).json({ error: 'No se pudo guardar el archivo HTML' });
      }
      console.log('✅ Ensayo generado:', destinoPath);
      res.json({ mensaje: 'Ensayo creado exitosamente' });
    });
  });
});

// Pregunta libre aleatoria (¡CON LÓGICA DE RESPUESTA CORREGIDA!)
app.get('/api/preguntas/libres/random', async (_req, res) => {
  try {
    const q = await pool.query(`
      SELECT id, texto, materia,
             alternativa_a, alternativa_b, alternativa_c, alternativa_d,
             correcta, imagen
      FROM preguntas
      WHERE libre = true
      ORDER BY RANDOM()
      LIMIT 1
    `);

    if (q.rowCount === 0) {
      return res.status(404).json({ error: 'No hay preguntas libres en la BD' });
    }

    const r = q.rows[0];
    
    // Filtramos alternativas vacías (null o "")
    const alternativas = [r.alternativa_a, r.alternativa_b, r.alternativa_c, r.alternativa_d].filter(Boolean);

    // --- INICIO DE LA CORRECCIÓN ---
    // Traducimos la letra (ej: "C") al valor real (ej: "4")
    let valorCorrecto = null;
    if (r.correcta === 'A') {
      valorCorrecto = r.alternativa_a;
    } else if (r.correcta === 'B') {
      valorCorrecto = r.alternativa_b;
    } else if (r.correcta === 'C') {
      valorCorrecto = r.alternativa_c;
    } else if (r.correcta === 'D') {
      valorCorrecto = r.alternativa_d;
    }
    // --- FIN DE LA CORRECCIÓN ---

    return res.json({
      id: r.id,
      titulo: r.texto,
      enunciado: r.texto,
      materia: r.materia,
      alternativas: alternativas,
      opciones: alternativas,
      correcta: valorCorrecto, // <-- ¡AHORA ENVIAMOS EL VALOR!
      imagen: r.imagen || null
    });
    
  } catch (error) {
    console.error('Error obteniendo libre:', error);
    return res.status(500).json({ error: 'Error obteniendo pregunta libre' });
  }
});

// Diagnóstico libres
app.get('/api/debug/libres', async (_req, res) => {
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

// ────────────────────────────────────────────────────────────────
/** Fallback JSON para rutas /api que no existan */
// ────────────────────────────────────────────────────────────────
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada', path: req.path });
});

// ────────────────────────────────────────────────────────────────
//  ARRANQUE
// ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
});