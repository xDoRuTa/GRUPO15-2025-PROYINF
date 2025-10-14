import unittest
import json

from app import app, preguntas

class TestPreguntaLibreAPI(unittest.TestCase):
    
    

    @classmethod
    def setUpClass(cls):
   
        print("\n[+] Iniciando set de pruebas para preguntas 'libres'...")
        cls.client = app.test_client()
        
        
        cls.base_payload = {
            "texto": "¿Cuánto es 7 por 8?",
            "materia": "CM1",
            "alternativaA": "54",
            "alternativaB": "56",
            "alternativaC": "62",
            "alternativaD": "64",
            "correcta": "B"
        }

    @classmethod
    def tearDownClass(cls):
        print("[+] Finalizado el set de pruebas para preguntas 'libres'.")

    def setUp(self):
     
        preguntas.clear()

    def test_crear_pregunta_marcada_como_libre(self):

        payload = self.base_payload.copy()
        payload["libre"] = True

        response = self.client.post("/api/preguntas", data=json.dumps(payload), content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertTrue(data['libre'])
        print(f" -> test_crear_pregunta_marcada_como_libre: Recibido código {response.status_code}")

    def test_crear_pregunta_marcada_como_no_libre(self):
     
        payload = self.base_payload.copy()
        payload["libre"] = False

        response = self.client.post("/api/preguntas", data=json.dumps(payload), content_type='application/json')

        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertFalse(data['libre'])
        print(f" -> test_crear_pregunta_marcada_como_no_libre: Recibido código {response.status_code}")

    def test_crear_pregunta_sin_especificar_libre_usa_default(self):
      
        payload = self.base_payload.copy()

        response = self.client.post("/api/preguntas", data=json.dumps(payload), content_type='application/json')

        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('libre', data)
        self.assertFalse(data['libre'])
        print(f" -> test_crear_pregunta_sin_especificar_libre_usa_default: Recibido código {response.status_code}")


if __name__ == "__main__":
    unittest.main()