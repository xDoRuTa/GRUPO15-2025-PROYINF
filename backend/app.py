from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)

# Lista en memoria de preguntas
preguntas = []

@app.route("/api/preguntas", methods=["GET", "POST"])
def preguntas_endpoint():
    if request.method == "POST":
        data = request.get_json()

        # Validar campos requeridos
        required_fields = ["texto", "materia", "alternativaA", "alternativaB",
                           "alternativaC", "alternativaD", "correcta", "libre"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Faltan datos requeridos: {field}"}), 400

        # Crear objeto de pregunta
        pregunta = {
            "id": len(preguntas) + 1,
            "texto": data["texto"],
            "materia": data["materia"],
            "alternativas": {
                "A": data["alternativaA"],
                "B": data["alternativaB"],
                "C": data["alternativaC"],
                "D": data["alternativaD"]
            },
            "correcta": data["correcta"],
            "libre": data["libre"],
            "imagen": data.get("imagen"),  # puede ser None si no se envía
            "fechaCreacion": datetime.now().isoformat()
        }

        # Agregar pregunta a la lista
        preguntas.append(pregunta)
        return jsonify(pregunta), 201

    elif request.method == "GET":
        # Devolver todas las preguntas
        return jsonify(preguntas), 200

if __name__ == "__main__":
    app.run(debug=True)
