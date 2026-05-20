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
                h.ID as HABITACIONES_ID, 
                h.NOMBREHABITACION, 
                a.NOMBREAREA,
                ho.NOMUO as HOSPITAL,
                i.ID as INGRESO_ACTIVO_ID,
                i.FECHAINGRESO,
                m.NOMBRE as MEDICO_NOMBRE,
                m.APELLIDOPATERNO as MEDICO_PATERNO,
                DATEDIFF(NOW(), i.FECHAINGRESO) as DIAS_OCUPADA
            FROM HABITACIONES h
            INNER JOIN AREAS a ON a.ID = h.AREAS_ID
            INNER JOIN HOSPITAL ho ON ho.UNI_ORG = a.HOSPITAL_UNI_ORG
            LEFT JOIN INGRESOS i ON i.HABITACIONES_ID = h.ID 
                AND NOT EXISTS (SELECT 1 FROM EGRESOS e WHERE e.INGRESOS_ID = i.ID)
            LEFT JOIN MEDICOS m ON m.EXPEDIENTE = i.MEDICOS_EXPEDIENTE
            ORDER BY ho.NOMUO, a.NOMBREAREA, h.NOMBREHABITACION";

    $stmt = $conn->query($sql);
    $data = $stmt->fetchAll();

    // Organizar data por Area/Hospital si fuera necesario, pero lo mandamos plano.
    jsonResponse(200, [
        "ok" => true,
        "data" => $data
    ]);
} catch (Throwable $e) {
    jsonResponse(500, [
        "ok" => false,
        "message" => "Error al obtener ocupación de habitaciones",
        "error" => $e->getMessage()
    ]);
}
?>
