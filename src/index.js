const { leerConfiguracion } = require("./configuracion");
const { crearServicioReservas } = require("./servicios/serviceReserva");
const { crearApp } = require("./app");

/* D A T O S */

const salasPermitidas = [
    "Sala Norte",
    "Sala Sur",
    "Sala Multimedia"
];

const turnosPermitidos = [
    "Mañana",
    "Tarde",
    "Noche"
];

const reservas = [
    {
        id: 1,
        estudiante: "Miguel Merentiel",
        email: "miguel.merentiel@gmail.com",
        sala: "Sala Norte",
        fecha: "2026-09-23",
        turno: "Mañana",
        personas: 3
    },
    {
        id: 2,
        estudiante: "Lautaro Blanco",
        email: "lautaro_blanco@yahoo.com.ar",
        sala: "Sala Sur",
        fecha: "2026-09-24",
        turno: "Tarde",
        personas: 5
    },
    {
        id: 3,
        estudiante: "Santiago Ascacibar",
        email: "santiago.ascacibar@hotmail.com",
        sala: "Sala Multimedia",
        fecha: "2026-09-24",
        turno: "Noche",
        personas: 6
    },
    {
        id: 4,
        estudiante: "Leandro Paredes",
        email: "leandro.paredes@outlook.com",
        sala: "Sala Multimedia",
        fecha: "2026-09-25",
        turno: "Mañana",
        personas: 3
    }
];

async function main() {
    const { puerto, formatoRegistro } = leerConfiguracion();

    const servicioReservas = crearServicioReservas(reservas);

    const app = crearApp({
        servicioReservas,
        formatoRegistro,
        salasPermitidas,
        turnosPermitidos
    });

    app.listen(puerto, () => {
        console.log(`Aplicación disponible en http://localhost:${puerto}`);
    });
}

main().catch((error) => {
    console.error("No se pudo iniciar la aplicación:", error);
    process.exitCode = 1;
});

module.exports = {
    reservas,
    salasPermitidas,
    turnosPermitidos
};
