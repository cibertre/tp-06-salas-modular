


/* ------------------------------------------------------------------ */
/* Middleware personalizado de alcance de ROUTER (sólo /reservas/*)   */
/* ------------------------------------------------------------------ */

function prepararAreaReservas(req, res, next) {
    res.locals.seccion = "Reservas de salas";
    next();
}
/* ------------------------------------------------------------------ */
/* Middleware personalizado de alcance de RUTA (sólo POST /reservas)  */
/* ------------------------------------------------------------------ */
function validarReserva(salasPermitidas, turnosPermitidos) {

    return function (req, res, next) {
    const estudiante = String(req.body.estudiante ?? "").trim();
    const email = String(req.body.email ?? "").trim();
    const sala = String(req.body.sala ?? "").trim();
    const fecha = String(req.body.fecha ?? "").trim();
    const turno = String(req.body.turno ?? "").trim();
    const personas = Number(req.body.personas);

    const errores = [];
    if (!estudiante) errores.push("El nombre del estudiante es obligatorio.");
    if (!email || !email.includes("@")) errores.push("El email debe contener @.");
    if (!salasPermitidas.includes(sala)) errores.push("Seleccioná una sala válida.");
    if (!fecha) errores.push("La fecha es obligatoria.");
    if (!turnosPermitidos.includes(turno)) errores.push("Seleccioná un turno válido.");
    if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
        errores.push("La cantidad de personas debe ser un número entero entre 1 y 6.");
    }

    if (errores.length > 0) {
        return res.status(400).render("reservas/nueva", {
            titulo: "Nueva reserva",
            errores,
            valores: req.body,
            salas: salasPermitidas,
            turnos: turnosPermitidos,
        });
    }

    // Camino válido: se deja la reserva lista para el handler final y
    // se pasa el control con next(), sin repetir la validación.
    req.reservaValidada = { estudiante, email, sala, fecha, turno, personas };
    next();
};
}

module.exports = { prepararAreaReservas, validarReserva};