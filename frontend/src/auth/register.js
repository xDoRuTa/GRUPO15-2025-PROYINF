import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

createUserWithEmailAndPassword(auth, email, password)
  .then(userCredential => {
    console.log("Usuario registrado:", userCredential.user);
  })
  .catch(error => {
    console.error("Error en registro:", error.message);
  });