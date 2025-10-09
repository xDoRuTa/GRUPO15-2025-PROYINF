import React from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function ClassroomConnect() {
  const handleConnect = () => {
    // redirige al flujo OAuth del backend
    window.location.href = `${API_BASE}/auth/google`;
  };

  return (
    <div style={{ display:'grid', gap:12, placeItems:'start' }}>
      <h2>Integración con Google Classroom</h2>
      <p>Conecta tu cuenta para ver tus cursos y trabajos.</p>
      <button
        onClick={handleConnect}
        style={{
          padding:'10px 14px',
          borderRadius:8,
          border:'1px solid #ccc',
          cursor:'pointer',
          fontWeight:600
        }}
      >
        Conectar con Google Classroom
      </button>
    </div>
  );
}