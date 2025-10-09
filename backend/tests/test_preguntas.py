import unittest
import json
from backend.app import app, preguntas

class TestPreguntasAPI(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()
        preguntas.clear()  # limpiar "DB" antes de cada test

    def test_agregar_pregunta_sin_imagen(self):
        payload = {
            "texto": "¿Cuál es la capital de Chile?",
            "materia": "HCS",
            "alternativaA": "Santiago",
            "alternativaB": "Buenos Aires",
            "alternativaC": "Lima",
            "alternativaD": "La Paz",
            "correcta": "A",
            "libre": False
        }
        response = self.client.post("/api/preguntas", data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['texto'], payload['texto'])
        self.assertIsNone(data['imagen'])

    def test_agregar_pregunta_con_imagen(self):
        # ejemplo de imagen pequeña en base64 (1px transparente PNG)
        imagen_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AArEB9D8kTbMAAAAASUVORK5CYII="
        payload = {
            "texto": "Pregunta con imagen",
            "materia": "CL",
            "alternativaA": "Opción A",
            "alternativaB": "Opción B",
            "alternativaC": "Opción C",
            "alternativaD": "Opción D",
            "correcta": "B",
            "libre": True,
            "imagen": imagen_base64
        }
        response = self.client.post("/api/preguntas", data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['texto'], "Pregunta con imagen")
        self.assertEqual(data['imagen'], imagen_base64)

    def test_falla_si_faltan_campos(self):
        payload = {"texto": "Pregunta incompleta"}
        response = self.client.post("/api/preguntas", data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data.decode(), 'Faltan datos requeridos')

if __name__ == "__main__":
    unittest.main()
