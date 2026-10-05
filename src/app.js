const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const path = require("node:path");
const { crearIdentificadorSolicitud, medirDuracion } = require("./middlewares/solicitudes");
const { crearControladorReservas, } = require("./controladores/controlReserva");
const { crearRouterReservas } = require("./rutas/rutasReserva");
function crearApp({ servicioReservas, formatoRegistro, salasPermitidas, turnosPermitidos }) {
    const app = express();
    const controladorReservas = crearControladorReservas(servicioReservas, salasPermitidas, turnosPermitidos);
    const reservasRouter = crearRouterReservas(controladorReservas, salasPermitidas, turnosPermitidos);
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "..", "views"));
    app.set("layout", "layouts/main");
    app.use(morgan(formatoRegistro));
    app.use(crearIdentificadorSolicitud());
    app.use(medirDuracion);
    app.use(expressLayouts);
    app.use(express.static(path.join(__dirname, "..", "public")));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.get("/", (req, res) => {
        res.render("inicio", { titulo: "Salas de estudio" });
    });
    app.get("/estado", (req, res) => {
        res.json({
            cantidad: servicioReservas.listar().length,
            id: res.locals.solicitudId
        });
    });
    app.get("/api/reservas", controladorReservas.listarApi);
    app.use("/reservas", reservasRouter);
    app.use((req, res) => {
        res.status(404).render("no-encontrado", {
            titulo: "Página no encontrada",
            mensaje: "La dirección solicitada no existe.",
        });
    });
    return app;
}
module.exports = { crearApp };