
function crearControladorReservas(servicioReservas, salasPermitidas, turnosPermitidos) {
    function listar(req, res) {
        res.render("reservas/lista", {
            titulo: "Reservas de salas",
            reservas: servicioReservas.listar(),
        });
    }
   
    function mostrarFormulario(req, res) {
        res.render("reservas/nueva", {
            titulo: "Nueva reserva",
            errores: null,
            valores: {},
            salas: salasPermitidas,
            turnos: turnosPermitidos,
        });
    }
    function mostrarDetalle(req, res) {
        const id = Number(req.params.id);
        const reserva = servicioReservas.obtenerPorId(id);
        if (!reserva) {
            return res.status(404).render("no-encontrado", {
                titulo: "Reserva no encontrada",
                mensaje: "No existe una reserva con ese identificador.",
            });
        }
        res.render("reservas/detalle", {
            titulo: reserva.estudiante,
            reserva,
        });
    }
    function crear(req, res) {
        servicioReservas.crear(req.reservaValidada);
        res.redirect("/reservas");
    }
    function listarApi(req, res) {
        res.json(servicioReservas.listar());
    }
    return { listar, mostrarFormulario, mostrarDetalle, crear, listarApi };
}
module.exports = { crearControladorReservas };