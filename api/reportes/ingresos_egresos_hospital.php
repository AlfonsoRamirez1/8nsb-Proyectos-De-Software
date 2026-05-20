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

// Filtros opcionales
$hospital_id = $_GET["hospital_id"] ?? null;
$fecha_desde = $_GET["fecha_desde"] ?? null;
$fecha_hasta = $_GET["fecha_hasta"] ?? null;

try {
    $database = new Database();
    $conn = $database->getConnection();

    $whereClause = "WHERE 1=1";
    $params = [];

    // Validar y aplicar filtros de hospital
    if ($hospital_id && $hospital_id !== "") {
        $whereClause .= " AND a.HOSPITAL_UNI_ORG = :hospital_id";
        $params[":hospital_id"] = $hospital_id;
    }

    $whereIngreso = $whereClause;
    $whereEgreso = $whereClause;

    // Aplicar filtros de fecha para ingresos
    if ($fecha_desde && $fecha_desde !== "") {
        $whereIngreso .= " AND DATE(i.FECHAINGRESO) >= :fecha_desde";
    }
    if ($fecha_hasta && $fecha_hasta !== "") {
        $whereIngreso .= " AND DATE(i.FECHAINGRESO) <= :fecha_hasta";
    }

    // Aplicar filtros de fecha para egresos
    if ($fecha_desde && $fecha_desde !== "") {
        $whereEgreso .= " AND DATE(e.FECHAEGRESO) >= :fecha_desde";
    }
    if ($fecha_hasta && $fecha_hasta !== "") {
        $whereEgreso .= " AND DATE(e.FECHAEGRESO) <= :fecha_hasta";
    }

    // Preparar parámetros comunes para la ejecución si hay fechas
    $paramsDates = $params;
    if ($fecha_desde && $fecha_desde !== "") $paramsDates[":fecha_desde"] = $fecha_desde;
    if ($fecha_hasta && $fecha_hasta !== "") $paramsDates[":fecha_hasta"] = $fecha_hasta;

    // 1. Ingresos por área
    $sqlIngresosArea = "SELECT a.NOMBREAREA, COUNT(*) as total_ingresos 
                        FROM INGRESOS i 
                        JOIN HABITACIONES h ON i.HABITACIONES_ID = h.ID 
                        JOIN AREAS a ON h.AREAS_ID = a.ID 
                        $whereIngreso
                        GROUP BY a.ID, a.NOMBREAREA";
    
    $stmtIng = $conn->prepare($sqlIngresosArea);
    $stmtIng->execute($paramsDates);
    $ingresos_por_area = $stmtIng->fetchAll(PDO::FETCH_ASSOC);

    // 2. Egresos por área
    $sqlEgresosArea = "SELECT a.NOMBREAREA, COUNT(*) as total_egresos 
                       FROM EGRESOS e 
                       JOIN HABITACIONES h ON e.HABITACIONES_ID = h.ID 
                       JOIN AREAS a ON h.AREAS_ID = a.ID 
                       $whereEgreso
                       GROUP BY a.ID, a.NOMBREAREA";
    
    $stmtEgr = $conn->prepare($sqlEgresosArea);
    $stmtEgr->execute($paramsDates);
    $egresos_por_area = $stmtEgr->fetchAll(PDO::FETCH_ASSOC);

    // 3. Historial de Registros Combinado (Ingresos y Egresos)
    $sqlRegistros = "SELECT 'Ingreso' as TIPO_MOV, i.FECHAINGRESO as FECHA, a.NOMBREAREA, h.NOMBREHABITACION 
                     FROM INGRESOS i
                     JOIN HABITACIONES h ON i.HABITACIONES_ID = h.ID 
                     JOIN AREAS a ON h.AREAS_ID = a.ID 
                     $whereIngreso
                     UNION ALL
                     SELECT 'Egreso' as TIPO_MOV, e.FECHAEGRESO as FECHA, a.NOMBREAREA, h.NOMBREHABITACION 
                     FROM EGRESOS e
                     JOIN HABITACIONES h ON e.HABITACIONES_ID = h.ID 
                     JOIN AREAS a ON h.AREAS_ID = a.ID 
                     $whereEgreso
                     ORDER BY FECHA DESC LIMIT 100";
    
    // Necesitamos duplicar los parámetros para el UNION ALL
    $unionParams = [];
    foreach ($paramsDates as $key => $value) {
        $unionParams[$key . "1"] = $value;
        $unionParams[$key . "2"] = $value;
        
        $sqlRegistros = preg_replace("/$key\b/", $key . "1", $sqlRegistros, 1); // Replace in first query
        $sqlRegistros = preg_replace("/$key\b/", $key . "2", $sqlRegistros, 1); // Replace in second query
    }

    $stmtRec = $conn->prepare($sqlRegistros);
    $stmtRec->execute($unionParams ?: $paramsDates); // Si no hay fechas, $paramsDates podría estar vacío
    $registros = $stmtRec->fetchAll(PDO::FETCH_ASSOC);

    // 4. Ocupación actual por área (Ingresos sin Egreso)
    // Para la ocupación actual no se aplican filtros de fecha de la interfaz, 
    // solo se evalúa el estado presente en el hospital filtrado.
    $sqlOcupacion = "SELECT a.NOMBREAREA, COUNT(i.ID) as total_ocupacion 
                     FROM INGRESOS i 
                     JOIN HABITACIONES h ON i.HABITACIONES_ID = h.ID 
                     JOIN AREAS a ON h.AREAS_ID = a.ID 
                     LEFT JOIN EGRESOS e ON i.ID = e.INGRESOS_ID
                     $whereClause AND e.ID IS NULL
                     GROUP BY a.ID, a.NOMBREAREA";
    
    $stmtOcu = $conn->prepare($sqlOcupacion);
    $stmtOcu->execute($params);
    $ocupacion_actual = $stmtOcu->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(200, [
        "ok" => true,
        "data" => [
            "ingresos_por_area" => $ingresos_por_area,
            "egresos_por_area" => $egresos_por_area,
            "registros" => $registros,
            "ocupacion_actual" => $ocupacion_actual
        ]
    ]);
} catch (Throwable $e) {
    jsonResponse(500, [
        "ok" => false,
        "message" => "Error al obtener reporte de hospitalización",
        "error" => $e->getMessage(),
        "trace" => $e->getTraceAsString()
    ]);
}
?>
