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

// Filtro opcional por área
$area_id = $_GET["area_id"] ?? null;

try {
    $database = new Database();
    $conn = $database->getConnection();

    $whereClause = "WHERE 1=1";
    $params = [];

    if ($area_id && $area_id !== "") {
        $whereClause .= " AND h.AREAS_ID = :area_id";
        $params[":area_id"] = $area_id;
    }

    $sql = "SELECT 
                h.ID AS habitacion_id, 
                h.NOMBREHABITACION, 
                a.NOMBREAREA,
                CASE WHEN i.ID IS NOT NULL AND e.ID IS NULL THEN 1 ELSE 0 END AS ocupada,
                i.ID AS ingreso_id,
                i.FECHAINGRESO as fecha_ingreso,
                DATEDIFF(NOW(), i.FECHAINGRESO) as dias_estancia,
                m.NOMBRE as medico_nombre,
                m.APELLIDOPATERNO as medico_apellido
            FROM HABITACIONES h
            JOIN AREAS a ON h.AREAS_ID = a.ID
            LEFT JOIN INGRESOS i ON h.ID = i.HABITACIONES_ID AND i.ID NOT IN (SELECT INGRESOS_ID FROM EGRESOS)
            LEFT JOIN EGRESOS e ON i.ID = e.INGRESOS_ID
            LEFT JOIN MEDICOS m ON i.MEDICOS_EXPEDIENTE = m.EXPEDIENTE
            $whereClause
            ORDER BY a.NOMBREAREA ASC, h.NOMBREHABITACION ASC";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    
    $habitaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Agrupar por áreas para facilitar el renderizado en el frontend
    $agrupado = [];
    foreach ($habitaciones as $hab) {
        $area = $hab['NOMBREAREA'];
        if (!isset($agrupado[$area])) {
            $agrupado[$area] = [];
        }
        $agrupado[$area][] = $hab;
    }

    jsonResponse(200, [
        "ok" => true,
        "data" => $agrupado
    ]);
} catch (Throwable $e) {
    jsonResponse(500, [
        "ok" => false,
        "message" => "Error al obtener la ocupación detallada",
        "error" => $e->getMessage()
    ]);
}
?>
