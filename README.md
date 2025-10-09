Este es el repositorio del *Grupo 4*, cuyos integrantes son:

* Nicolás Ortiz - 202273528-7
* Domingo Ruiz-Tagle - 202273648-8
* Sebastian Jaña - 202273618-6
* Ignacio Casanova - 202273631-3

(Se mantienen los mismos integrantes del semestre pasado)

## Wiki
* Puede acceder a la Wiki desde el siguiente [enlace](https://github.com/xDoRuTa/GRUPO15-2025-PROYINF/wiki)

## Multimedia
* [🎥- Video Presentación Cliente](https://aula.usm.cl/mod/resource/view.php?id=6322574)
* [🎥- Video Prototipo - Hito 3 (2025-1)](https://youtu.be/MSrKbSECel8)
* [🌐- Evidencia Uso Firebase](https://github.com/xDoRuTa/GRUPO15-2025-PROYINF/discussions/8)
* [🌐- Consideraciones Hito 5 (2025-1)](https://github.com/xDoRuTa/GRUPO15-2025-PROYINF/discussions/10)
* [🎥- Video Presentacion - Hito 5 (2025-1)](https://youtu.be/Zz3AJAsyoBA)
## Instrucciones Página

* Hay que asegurarse de tener todos los archivos que estan en este github que son:
    * Carpeta Frontend
    * Carpeta Backend
    * docker.compose.yml
* Posteriormente es importante tener en cuenta que el proyecto está implementado en el entorno virtual de Ubuntu, con el uso de WSL.
* También es importante que se utilice la versión 2 de Ubuntu, para verificar la versión, se debe ingresar el siguiente comando en la PowerShell (de Windows) "wsl --list --verbose", y en caso de ser necesario utilizar "--set-version Ubuntu 2" para cambiar la versión de Ubuntu a la correspondiente para la ejecución del proyecto.
* Debe instalarse la aplicación "Docker Desktop", una vez dentro de la misma, se debe seguir el siguiente patrón de instrucciones: Settings -> Resources -> WSL integration -> "habilitar Ubuntu".
* Es importante tener docker y docker compose en el dispositivo (En el entorno de programación, en nuestro caso, dentro de la terminal de VSC pero conectada a WSL), esto para la creación de los contenedores.
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

## Identificación Proyecto Base 2025-1
* El proyecto que se realizará durante este semestre 2025-2 corresponde a la continuación del establecido durante el primer semestre de este mismo año, el cual consiste en la realización de una plataforma "interactiva" con fines educativos, la cual tiene una estricta relación con la prueba de admisión universitaria, con el fin de poder brindar diversas instancias de práctica para los alumnos de enseñanza media, los cuales se encuentran a escazos momentos rendir la misma para poder optar a la educación superior.
* Esta plataforma está pensada para que los mismos docentes que les hacen clases a estos alumnos sean los encargados de la creación de los ensayos, con el fin de que puedan reforzar de mejor manera las dificultades de sus alumnos. Y es debido a esto que la misma cuenta con las siguientes caracteristicas:
   * Verificación de cuentas, lo que conlleva a diferentes vistas según corresponda a su debido "rol". (Profesores, Alumnos, Administrador).
   * Banco de preguntas, el cual permite el almacenamiento de preguntas separadas en sus correspondientes materias.
   * Creación de preguntas.
   * Realización de ensayos.
