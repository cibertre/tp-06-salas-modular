# Trabajo Práctico 06 - Salas - Modularización

## Descripción

En este trabajo hice una aplicación para reservar salas de estudio.

La aplicación permite ver las reservas que existen, consultar una reserva determinada y crear nuevas reservas. También tiene una API para consultar las reservas.

El proyecto está realizado con Node.js, Express y EJS. En esta etapa trabajé principalmente en separar el código en diferentes archivos para que cada parte de la aplicación tenga una función determinada.

La información de las reservas se mantiene en memoria, por lo que si se apaga o reinicia el servidor, las reservas nuevas que se hayan agregado se pierden.

## Instalación

Para poder ejecutar el proyecto primero hay que instalar las dependencias.

Desde la carpeta del proyecto ejecuté:

```bash
npm install
```

## Ejecución

Para iniciar el servidor:

```bash
node src/index.js
```

También se puede utilizar:

```bash
npm start
```

Una vez iniciado, la aplicación queda disponible en:

```text
http://localhost:3000
```

## Pruebas que hice

Antes de terminar la modularización fui probando las distintas rutas para comprobar que la aplicación siguiera funcionando.

Los resultados fueron:

* `GET /` → 200. Muestra la página de inicio.
* `GET /estado` → 200. Devuelve un JSON con la cantidad de reservas y un identificador de solicitud.
* `GET /reservas` → 200. Muestra la lista de reservas.
* `GET /reservas/nueva` → 200. Muestra el formulario para crear una reserva.
* `GET /reservas/1` → 200. Muestra el detalle de una reserva existente.
* `GET /reservas/999` → 404. Muestra la página de reserva no encontrada.
* `POST /reservas` válido → 302 y después 200. La reserva se crea y se vuelve a la lista.
* `POST /reservas` inválido → 400. Se muestra nuevamente el formulario con los errores y no se crea la reserva.
* `GET /css/estilos.css` → 200 o 304 si el navegador ya tenía el archivo guardado en caché.
* `GET /url-inexistente` → 404. Muestra la página de dirección no encontrada.

Durante las pruebas también encontré algunos errores de rutas y los fui corrigiendo. Por ejemplo, la ruta del formulario debía ser `/reservas/nueva` y no `/reservas/nuevo`.

El código 304 que puede aparecer al cargar el CSS no significa que haya un error. Es una respuesta del navegador indicando que el archivo no necesita volver a descargarse porque ya lo tiene en caché.

## Ruta /estado

Agregué una ruta `/estado` que devuelve información sencilla sobre el estado de la aplicación.

Por ejemplo:

```json
{
    "cantidad": 4,
    "id": "BIB-0007"
}
```

La cantidad corresponde a las reservas que existen en ese momento.

El valor `BIB-0007` es el identificador que se genera para esa solicitud.

Esta ruta la dejé directamente en `app.js` porque no pertenece solamente a las reservas. Si la hubiera puesto dentro del router de reservas, la dirección sería `/reservas/estado`.

## Rutas principales

La aplicación tiene las siguientes rutas:

`GET /`

Muestra la página principal.

`GET /estado`

Muestra la cantidad de reservas y el identificador de la solicitud en formato JSON.

`GET /reservas`

Muestra todas las reservas.

`GET /reservas/nueva`

Muestra el formulario para agregar una nueva reserva.

`GET /reservas/:id`

Busca una reserva por su número. Si existe, muestra sus datos. Si no existe, responde con 404.

`POST /reservas`

Recibe los datos del formulario y primero los valida. Si están correctos, crea la reserva y redirige a `/reservas`.

`GET /api/reservas`

Devuelve las reservas en formato JSON.

## Cómo organicé el proyecto

Para que el código no quedara todo junto en `index.js`, fui separando las diferentes partes.

En `index.js` dejé los datos iniciales de las reservas y la configuración principal para iniciar la aplicación.

En `app.js` armé la aplicación de Express y agregué los middlewares y las rutas generales.

En `controlReserva.js` están las funciones que se encargan de recibir las solicitudes y decidir qué respuesta enviar.

En `rutasReserva.js` están las rutas relacionadas con las reservas.

En `serviceReserva.js` puse las funciones que trabajan con las reservas, por ejemplo listar, buscar y crear.

En `reservas.js` están los middlewares relacionados con las reservas y la validación de los datos.

En `solicitudes.js` están los middlewares que generan el identificador de cada solicitud y calculan cuánto tarda en responder.

De esta forma cada archivo tiene una tarea más específica y es más fácil encontrar dónde hacer cambios.

## Middlewares

Durante este trabajo utilicé distintos tipos de middleware.

Uno de los middlewares que ya viene con Express es:

```js
express.urlencoded({ extended: false })
```

Lo utilizo para poder recibir los datos enviados desde los formularios.

También utilizo:

```js
express.json()
```

para poder recibir información enviada en formato JSON.

Otro middleware incorporado es:

```js
express.static(...)
```

que permite acceder a los archivos estáticos, como el CSS.

También utilicé el middleware externo `morgan`, que permite mostrar en consola información sobre las solicitudes que recibe el servidor.

Por último, hice mis propios middlewares para este trabajo.

## Identificador de solicitudes

Uno de los middlewares que hice genera un identificador para cada solicitud.

El identificador tiene este formato:

```text
BIB-0001
BIB-0002
BIB-0003
```

Esto me permite reconocer fácilmente cada solicitud cuando miro la consola.

Por ejemplo:

```text
[BIB-0007] GET /estado 200 1.23 ms
```

De esta forma puedo saber qué solicitud se hizo, qué ruta se utilizó, qué código HTTP devolvió y cuánto tardó.

## Medición del tiempo

También agregué un middleware que mide cuánto tarda cada solicitud.

Para hacerlo utilizo `process.hrtime.bigint()` y cuando termina la respuesta uso el evento `finish`.

Por ejemplo, en la consola puedo ver algo como:

```text
[BIB-0007] GET /reservas 200 3.45 ms
```

El `200` indica que la solicitud terminó correctamente y el valor final indica aproximadamente cuánto tardó.

## Uso de next()

En los middlewares utilizo `next()` para indicar que la solicitud puede continuar.

Por ejemplo:

```js
function prepararAreaReservas(req, res, next) {
    res.locals.seccion = "Reservas de salas";
    next();
}
```

Primero se guarda la información y después `next()` permite que la solicitud continúe hacia el siguiente middleware o hacia la ruta correspondiente.

En la validación, en cambio, si hay errores no se llama a `next()`, porque en ese caso se vuelve a mostrar el formulario con el código 400.

## Validación de las reservas

Antes de crear una reserva se revisan los datos recibidos.

Se controla que:

* el nombre del estudiante no esté vacío;
* el email tenga un formato básico válido;
* la sala sea una de las permitidas;
* se haya ingresado una fecha;
* el turno sea válido;
* la cantidad de personas sea un número entero entre 1 y 6.

Si algún dato es incorrecto, se responde con:

```text
400 Bad Request
```

y se vuelve a mostrar el formulario indicando los errores.

Si los datos son correctos, se crea la reserva.

## Qué pasa cuando se crea una reserva

Cuando se envía correctamente el formulario, el servidor crea la reserva y responde con:

```text
302 Found
```

Después el navegador sigue la redirección y realiza:

```text
GET /reservas
```

que responde:

```text
200 OK
```

Por eso al crear una reserva se pueden observar dos solicitudes en la consola.

## Servicio de reservas

En `serviceReserva.js` están las funciones que trabajan con los datos.

Por ejemplo:


listar()


devuelve las reservas.

obtenerPorId(id)


busca una reserva determinada.

crear(datosValidados)


crea una nueva reserva y le asigna un ID.

El servicio trabaja con una copia de los datos iniciales. Por eso las reservas que se agregan durante la ejecución se mantienen mientras el servidor está funcionando, pero se pierden al reiniciarlo.

## Manejo de errores 404

Si se solicita una reserva que no existe, por ejemplo:


/reservas/999


la aplicación responde:


404


y muestra la página de reserva no encontrada.

Lo mismo ocurre si se ingresa una dirección que no existe, por ejemplo:


/url-inexistente


En ese caso se muestra la página general de dirección no encontrada.

## Estructura del proyecto

La estructura principal quedó de esta manera:


src/
│
├── index.js
├── app.js
│
├── configuracion.js
│
├── controladores/
│   └── controlReserva.js
│
├── rutas/
│   └── rutasReserva.js
│
├── middlewares/
│   ├── reservas.js
│   └── solicitudes.js
│
└── servicios/
    └── serviceReserva.js

views/
├── layouts/
│   └── main.ejs
│
├── reservas/
│   ├── lista.ejs
│   ├── nueva.ejs
│   └── detalle.ejs
│
├── inicio.ejs
└── no-encontrado.ejs

public/
└── css/
    └── estilos.css


## Algunas cosas que tuve que corregir

Durante el desarrollo fui encontrando algunos problemas.

Uno de ellos fue una diferencia entre el nombre de la ruta y el nombre que utilizaba el enlace del formulario. La ruta correcta quedó como:


/reservas/nueva


También tuve que corregir el enlace de la página de error para que volviera a `/reservas` y no a una ruta que ya no existía.

Otro problema apareció cuando intenté colocar `/estado` dentro del router de reservas. En ese caso la aplicación esperaba una función llamada `mostrarEstado` que no existía y además la ruta habría quedado como `/reservas/estado`.

Finalmente dejé `/estado` directamente en `app.js`, que es donde corresponde porque es una ruta general de la aplicación.

## Conclusión

Con este trabajo pude separar el código que antes estaba concentrado en un solo lugar.

Ahora las rutas, los controladores, los servicios y los middlewares están separados y cada uno cumple una función determinada.

También pude trabajar con validaciones, códigos de estado HTTP, redirecciones, middleware, identificadores de solicitudes y medición del tiempo de respuesta.

Las reservas siguen siendo temporales porque se guardan en memoria y no en una base de datos o archivo. Por eso, cuando se reinicia el servidor, vuelven a quedar solamente las reservas iniciales.

