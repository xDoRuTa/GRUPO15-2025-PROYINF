// src/scripts/login.js
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form["email"].value;
    const password = form["password"].value;

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      alert("Login exitoso como: " + userCred.user.email);
      window.location.href = "bancodepreguntas.html"; 
    } catch (error) {
      alert("Error: " + error.message);
    }
  });
});
