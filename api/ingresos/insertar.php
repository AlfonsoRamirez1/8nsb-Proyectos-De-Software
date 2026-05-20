<?php
require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../helpers/auth.php";
require_once __DIR__ . "/../../helpers/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    jsonResponse(405, [
        "ok" => false,
        "message" => "Método no permitido"
    ]);
}

requireRole("Administrador");

$input = json_decode(file_get_contents("php://input"), true);

$tipo = $input["tipo"] ?? null;
$fechaIngreso = trim($input["fechaIngreso"] ?? "");
$observaciones = trim($input["observaciones"] ?? "");
$medicosExpediente = $input["medicosExpediente"] ?? null;
$habitacionesId = $input["habitacionesId"] ?? null;

if (
    $medicosExpediente === null || !is_numeric($medicosExpediente) ||
    $habitacionesId === null || !is_numeric($habitacionesId)
) {
    jsonResponse(400, [
        "ok" => false,
        "message" => "Médico y habitación son obligatorios"
    ]);
}

if ($tipo !== null && $tipo !== "" && !is_numeric($tipo)) {
    jsonResponse(400, [
        "ok" => false,
        "message" => "El tipo debe ser numérico"
    ]);
}

try {
    $database = new Database();
    $conn = $database->getConnection();


    $sqlCheckMedico = "SELECT EXPEDIENTE
                       FROM MEDICOS
                       WHERE EXPEDIENTE = :expediente
                       LIMIT 1";
    $stmtCheckMedico = $conn->prepare($sqlCheckMedico);
    $stmtCheckMedico->execute([
        ":expediente" => (int)$medicosExpediente
    ]);

    if (!$stmtCheckMedico->fetch()) {
        jsonResponse(400, [
            "ok" => false,
            "message" => "El médico seleccionado no existe"
        ]);
    }

    $sqlCheckHabitacion = "SELECT ID
                           FROM HABITACIONES
                           WHERE ID = :id
                           LIMIT 1";
    $stmtCheckHabitacion = $conn->prepare($sqlCheckHabitacion);
    $stmtCheckHabitacion->execute([
        ":id" => (int)$habitacionesId
    ]);

    if (!$stmtCheckHabitacion->fetch()) {
        jsonResponse(400, [
            "ok" => false,
            "message" => "La habitación seleccionada no existe"
        ]);
    }

    $sqlCheckDisponibilidad = "SELECT i.ID 
                               FROM INGRESOS i
                               LEFT JOIN EGRESOS e ON i.ID = e.INGRESOS_ID
                               WHERE i.HABITACIONES_ID = :habitacionesId 
                               AND e.ID IS NULL
                               LIMIT 1";
    $stmtCheckDisponibilidad = $conn->prepare($sqlCheckDisponibilidad);
    $stmtCheckDisponibilidad->execute([
        ":habitacionesId" => (int)$habitacionesId
    ]);

    if ($stmtCheckDisponibilidad->fetch()) {
        jsonResponse(409, [
            "ok" => false,
            "message" => "La habitación seleccionada ya se encuentra ocupada por otro paciente activo."
        ]);
    }

    $sql = "INSERT INTO INGRESOS (
                TIPO,
                FECHAINGRESO,
                OBSERVACIONES,
                MEDICOS_EXPEDIENTE,
                HABITACIONES_ID
            ) VALUES (
                :tipo,
                :fechaIngreso,
                :observaciones,
                :medicosExpediente,
                :habitacionesId
            )";

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ":tipo" => ($tipo === "" ? null : $tipo),
        ":fechaIngreso" => ($fechaIngreso === "" ? null : $fechaIngreso),
        ":observaciones" => ($observaciones === "" ? null : $observaciones),
        ":medicosExpediente" => (int)$medicosExpediente,
        ":habitacionesId" => (int)$habitacionesId
    ]);

    jsonResponse(201, [
        "ok" => true,
        "message" => "Ingreso insertado correctamente"
    ]);
} catch (Throwable $e) {
    jsonResponse(500, [
        "ok" => false,
        "message" => "Error al insertar ingreso",
        "error" => $e->getMessage()
    ]);
}
?>