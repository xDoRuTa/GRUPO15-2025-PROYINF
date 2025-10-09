import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function ClassroomCourses() {
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState('cargando'); // 'ok' | 'no-auth' | 'error'

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/classroom/courses`, {
          credentials: 'include' // importante para enviar la cookie de sesión
        });
        if (res.status === 401) { setStatus('no-auth'); return; }
        if (!res.ok) { setStatus('error'); return; }
        const data = await res.json();
        setCourses(data || []);
        setStatus('ok');
      } catch {
        setStatus('error');
      }
    };
    fetchCourses();
  }, []);

  if (status === 'cargando') return <p>Cargando cursos…</p>;
  if (status === 'no-auth') return <p>No estás conectado. Vuelve y presiona “Conectar con Google Classroom”.</p>;
  if (status === 'error') return <p>Ocurrió un error al obtener los cursos.</p>;
  if (courses.length === 0) return <p>No hay cursos activos.</p>;

  return (
    <div style={{ display:'grid', gap:10 }}>
      <h3>Mis cursos de Classroom</h3>
      <ul>
        {courses.map(c => (
          <li key={c.id}>
            <strong>{c.name}</strong> {c.section ? `— ${c.section}` : ''} <br/>
            <small>ID: {c.id}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
