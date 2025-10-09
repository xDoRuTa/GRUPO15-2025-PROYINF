// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './auth/login';
import Register from './auth/register';
import Logout from './auth/logout';
import { useAuth } from './auth/useauth';
import ClassroomConnect from './components/ClassroomConnect.jsx';
import ClassroomCourses from './components/ClassroomCourses.jsx';

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

            {/* 🔽 NUEVAS RUTAS Classroom */}
            <Route path="/classroom" element={<ClassroomConnect />} />
            <Route path="/classroom/connected" element={<ClassroomCourses />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
