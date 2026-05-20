<?php
require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../helpers/auth.php";
require_once __DIR__ . "/../../helpers/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    jsonResponse(405, [
        "ok" => false,
        "message" => "Método no permitido"
    ]);
}

requireLogin();

try {
    $database = new Database();
    $conn = $database->getConnection();

    $sql = "SELECT 
                i.ID as INGRESO_ID,
                h.NOMBREHABITACION,
                a.NOMBREAREA,
                ho.NOMUO as HOSPITAL,
                m.NOMBRE as MEDICO_NOMBRE,
                m.APELLIDOPATERNO as MEDICO_PATERNO,
                i.FECHAINGRESO,
                e.FECHAEGRESO,
                i.OBSERVACIONES as OBS_INGRESO,
                e.OBSERVACIONES as OBS_EGRESO,
                CASE 
                    WHEN e.FECHAEGRESO IS NOT NULL THEN DATEDIFF(e.FECHAEGRESO, i.FECHAINGRESO)
                    ELSE DATEDIFF(NOW(), i.FECHAINGRESO)
                END as DIAS_ESTANCIA,
                CASE
                    WHEN e.ID IS NOT NULL THEN 'Alta'
                    ELSE 'En Hospitalización'
                END as ESTADO
            FROM INGRESOS i
            INNER JOIN HABITACIONES h ON h.ID = i.HABITACIONES_ID
            INNER JOIN AREAS a ON a.ID = h.AREAS_ID
            INNER JOIN HOSPITAL ho ON ho.UNI_ORG = a.HOSPITAL_UNI_ORG
            INNER JOIN MEDICOS m ON m.EXPEDIENTE = i.MEDICOS_EXPEDIENTE
            LEFT JOIN EGRESOS e ON e.INGRESOS_ID = i.ID
            ORDER BY i.FECHAINGRESO DESC";

    $stmt = $conn->query($sql);
    $data = $stmt->fetchAll();

    jsonResponse(200, [
        "ok" => true,
        "data" => $data
    ]);
} catch (Throwable $e) {
    jsonResponse(500, [
        "ok" => false,
        "message" => "Error al obtener historial",
        "error" => $e->getMessage()
    ]);
}
?>
