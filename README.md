Este es el repositorio del *Grupo 15*, cuyos integrantes son:

* Nicolás Ortiz - 202273528-7
* Ignacio Casanova - 202273631-3
* Domingo Ruiz-Tagle - 202273648-8
* Sebastian Jaña - 202273618-6

## Wiki
* Puede acceder a la Wiki desde el siguiente [enlace](https://github.com/xDoRuTa/GRUPO15-2025-PROYINF/wiki)

## Multimedia
* [Video presentación cliente](https://aula.usm.cl/mod/resource/view.php?id=6322574)
* [Video prototipo hito 3](https://youtu.be/MSrKbSECel8)
* [Evidencia Uso Firebase](https://github.com/xDoRuTa/GRUPO15-2025-PROYINF/discussions/8)
## Instrucciones Página

* Hay que asegurarse de tener todos los archivos que estan en este github que son:
    * Carpeta Frontend
    * Carpeta Backend
    * docker.compose.yml
* Posteriormente se requiere el uso de comandos para acceder a un sistema linux, en nuestro caso,
  se uso WSL.
* Es importante tener docker y docker compose en el dispositivo, esto para la creación de los contenedores.
* Tambien se requiere vite y node.js, instalando todo lo necesario para ello.
* Tras ello, se debe usar los comandos para levantar los contenedores propios del sistema de docker (es necesario aclarar que,
  para este caso, se usan puertos por defecto, el 5173,3000 y el 5432 para el frontend, el backend y la bd respectivamente).
  NOTA: En el video (y para efectos practicos), sugerimos que al levantar la pagina se use el comando npm run dev --5174, por seguridad.
* Verificar (si usted así lo desea) que se haya subido su pregunta a la BD.

## Instrucciones Página (Parte II)
* Para este nuevo avance, se usó firebase para la creación de un login básico, por tanto se recomienda tener ciertas nociones del mismo (aunque es bastante intuitivo la verdad)
* Se requiere tener una cuenta de google para un mejor uso de la misma.
* Se requiere tambien cierta sincronizacion con los documentos a trabajar, así como bien una key para el correcto direccionamiento al sistema de cuentas. (Aunque la key nombrada está en el archivo llamado config.js)

## Instrucciones Página (Parte III)
* Para el avance de este hito, se trabajaron 4 aspectos importantes:
   * Se mejoraron aspectos respecto al frontend de la página.
   * Se trabajó en conjunto con la base de datos.
   * Se creó una sección en la que los docentes pueden revisar las preguntas disponibles y seleccionar preguntas para crear ensayos.
   * Se enlazó la selección de preguntas con la creación de ensayos, es decir, se crean ensayos con las preguntas seleccionadas, las cuales incluyen imagenes, temporizador, puntaje final y su respectivo diseño llamativo.
* Consideraciones importantes para el correcto funcionamiento de la página:
   * Para que todo funcione como se debe, es importante que las tablas de la base de datos se creen de manera correcta, para esto es importante tener en cuenta que estamos utilizando postgreSQL.
   * Al momento de subir preguntas, estas se pueden ver inmediatamente reflejadas en la página, es decir, se actualizan en el mismo instante en que se suben.
   * Caso contrario al momento de crear ensayos, cuando se crean estos es necesario bajar y volver a subir el proyecto, ya que se reemplaza código y es necesario que este se actualice (Aspecto a mejorar para proximos avances).
* Comandos de interés para utilizar en terminal:
   * docker-compose down (Baja/cierra el proyecto).
   * docker-compose up --build (Levanta/abre el proyecto).
   * docker-compose exec db psql -U postgres midb (Acceder a la base de datos).
        * \q (Salir de la base de datos).
        * \p (Muestra el contenido actual de la base de datos / buffer de consultas).
        * \d (Muestra una lista de todas las tablas, puede ser más especifico con \d (nombre de la tabla)).
