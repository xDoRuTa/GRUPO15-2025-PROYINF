// Cualquier componente donde quieras cerrar sesión
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

function Navbar() {
  const handleLogout = () => {
    signOut(auth)
      .then(() => alert("Sesión cerrada"))
      .catch((err) => console.error("Error cerrando sesión:", err));
  };

  return <button onClick={handleLogout}>Cerrar sesión</button>;
}
