// backend/Clases.js
class Pregunta {
  constructor(data) {
    const {
      id = null,
      texto = "",
      materia = "",
      imagen = null,
      alternativaA = "",
      alternativaB = "",
      alternativaC = "",
      alternativaD = "",
      correcta = "",
      libre,
      is_libre
    } = (data || {});

    this.id = id;
    this.texto = String(texto).trim();
    this.materia = String(materia).trim();
    this.imagen = imagen;

    this.alternativaA = String(alternativaA).trim();
    this.alternativaB = String(alternativaB).trim();
    this.alternativaC = String(alternativaC).trim();
    this.alternativaD = String(alternativaD).trim();

    this.correcta = String(correcta).trim().toUpperCase();

    const rawLibre = (typeof libre !== "undefined") ? libre : is_libre;
    this.libre = Pregunta._toBool(rawLibre);
  }

  static _toBool(v) {
    if (typeof v === "boolean") return v;
    if (v == null) return undefined;
    const s = String(v).toLowerCase();
    return s === "true" || s === "1" || s === "si" || s === "sí";
  }

  validarPregunta() {
    if (!this.texto) throw new Error("El campo 'texto' es obligatorio.");
    if (!this.materia) throw new Error("El campo 'materia' es obligatorio.");
    if (!this.alternativaA) throw new Error("La alternativa A es obligatoria.");
    if (!this.alternativaB) throw new Error("La alternativa B es obligatoria.");
    if (!this.alternativaC) throw new Error("La alternativa C es obligatoria.");
    if (!this.alternativaD) throw new Error("La alternativa D es obligatoria.");
    if (!this.correcta) throw new Error("El campo 'correcta' es obligatorio (A, B, C o D).");
    if (!["A","B","C","D"].includes(this.correcta)) {
      throw new Error("La alternativa correcta debe ser A, B, C o D.");
    }
    if (typeof this.libre === "undefined") {
      throw new Error("El campo 'libre' es obligatorio (true/false).");
    }
  }

  toJSON() {
    return {
      id: this.id,
      texto: this.texto,
      materia: this.materia,
      imagen: this.imagen,
      alternativaA: this.alternativaA,
      alternativaB: this.alternativaB,
      alternativaC: this.alternativaC,
      alternativaD: this.alternativaD,
      correcta: this.correcta,
      libre: this.libre
    };
  }
}

module.exports = { Pregunta };
