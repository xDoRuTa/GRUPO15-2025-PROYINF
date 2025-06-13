// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './auth/login';
import Register from './auth/register';
import Logout from './auth/logout';
import { useAuth } from './auth/useauth';

function App() {
  const user = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/registro" element={<Register />} />
          </>
        ) : (
          <>
            <Route path="/logout" element={<Logout />} />
            {/* Aquí irían otras rutas si usaras componentes jsx */}
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
