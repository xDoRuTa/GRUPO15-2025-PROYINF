//------------------------------------------------------------------------------------------------{}
class Pregunta {
    constructor(id, texto, materia, imagen, alternativaA, alternativaB, alternativaC, alternativaD, correcta) {
        this.id = id;
        this.texto = texto;
        this.materia = materia;
        this.imagen = imagen;
        this.alternativaA = alternativaA;
        this.alternativaB = alternativaB;
        this.alternativaC = alternativaC;
        this.alternativaD = alternativaD;
        this.correcta = correcta;
    }

    validarPregunta() {
        if (!this.texto || !this.materia || !this.alternativaA || !this.alternativaB || !this.alternativaC || !this.alternativaD || !this.correcta) {
            throw new Error("Todos los campos son obligatorios");
        }
        if (!['A', 'B', 'C', 'D'].includes(this.correcta)) {
            throw new Error("La alternativa correcta debe ser A, B, C o D");
        }
    }

    toJSON() {
        return {
            id: this.id,
            texto: this.texto,
            materia: this.materia,
            imagen: this.imagen,
            alternativas: {
                A: this.alternativaA,
                B: this.alternativaB,
                C: this.alternativaC,
                D: this.alternativaD
            },
            correcta: this.correcta
        };
    }
}

module.exports = { Pregunta };