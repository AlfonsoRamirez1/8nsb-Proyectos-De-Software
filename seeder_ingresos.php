<?php
/**
 * Seeder para el módulo de Ingresos y Egresos
 * Ejecutar con: php seeder_ingresos.php
 */

require_once __DIR__ . '/config/database.php';

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    echo "=== Iniciando Seeder de Ingresos y Egresos ===\n";

    // Insertar Hospital H001 si no existe
    $pdo->exec("INSERT IGNORE INTO hospital (UNI_ORG, NOMUO, DIRECCION) VALUES ('H001', 'Hospital General de Prueba', 'Centro')");
    
    // Insertar Areas
    $pdo->exec("INSERT IGNORE INTO areas (ID, UBICACION, NOMBREAREA, ID1, HOSPITAL_UNI_ORG) VALUES (1, 'Piso 1', 'Urgencias', 1, 'H001')");
    $pdo->exec("INSERT IGNORE INTO areas (ID, UBICACION, NOMBREAREA, ID1, HOSPITAL_UNI_ORG) VALUES (2, 'Piso 2', 'Terapia Intensiva', 2, 'H001')");
    $pdo->exec("INSERT IGNORE INTO areas (ID, UBICACION, NOMBREAREA, ID1, HOSPITAL_UNI_ORG) VALUES (3, 'Piso 3', 'Piso General', 3, 'H001')");

    // Insertar Habitaciones
    $pdo->exec("INSERT IGNORE INTO habitaciones (ID, NOMBREHABITACION, UBICACION, EQUIPAMIENTO, AREAS_ID) VALUES 
        (101, 'Cama 1 Urgencias', 'Piso 1', 'Monitor Signos Vitales', 1),
        (102, 'Cama 2 Urgencias', 'Piso 1', 'Monitor Signos Vitales', 1),
        (103, 'Cama 3 Urgencias', 'Piso 1', 'Basico', 1),
        (201, 'UCI 1', 'Piso 2', 'Ventilador Mecánico', 2),
        (202, 'UCI 2', 'Piso 2', 'Ventilador Mecánico', 2),
        (301, 'Habitación 301', 'Piso 3', 'Cama Hospitalaria B', 3),
        (302, 'Habitación 302', 'Piso 3', 'Cama Hospitalaria B', 3),
        (303, 'Habitación 303', 'Piso 3', 'Cama Hospitalaria B', 3),
        (304, 'Habitación 304', 'Piso 3', 'Cama Hospitalaria B', 3)
    ");

    // Insertar Especialidad y Médico
    $pdo->exec("INSERT IGNORE INTO especialidades (ID, ESPECIALIDAD) VALUES (1, 'Medicina Interna')");
    $pdo->exec("INSERT IGNORE INTO medicos (EXPEDIENTE, APELLIDOPATERNO, NOMBRE, ESPECIALIDADES_ID, HOSPITAL_UNI_ORG) VALUES (9999, 'Perez', 'Dr. Juan', 1, 'H001')");
    $pdo->exec("INSERT IGNORE INTO medicos (EXPEDIENTE, APELLIDOPATERNO, NOMBRE, ESPECIALIDADES_ID, HOSPITAL_UNI_ORG) VALUES (8888, 'Gomez', 'Dra. Maria', 1, 'H001')");

    // Limpiar ingresos y egresos actuales para empezar de cero
    $pdo->exec("SET FOREIGN_KEY_CHECKS=0; TRUNCATE TABLE egresos; TRUNCATE TABLE ingresos; SET FOREIGN_KEY_CHECKS=1;");

    // Generar fechas
    $today = date('Y-m-d H:i:s');
    $yesterday = date('Y-m-d H:i:s', strtotime('-1 day'));
    $twoDaysAgo = date('Y-m-d H:i:s', strtotime('-2 days'));
    $threeDaysAgo = date('Y-m-d H:i:s', strtotime('-3 days'));

    // Insertar Ingresos
    $stmt = $pdo->prepare("INSERT INTO ingresos (ID, TIPO, FECHAINGRESO, OBSERVACIONES, MEDICOS_EXPEDIENTE, HABITACIONES_ID) VALUES (?, ?, ?, ?, ?, ?)");
    
    $ingresos = [
        [1, 1, $threeDaysAgo, 'Paciente con trauma craneal leve.', 9999, 101], // Egreso programado
        [2, 1, $yesterday, 'Apendicitis aguda en observación.', 8888, 102], // Ocupada
        [3, 1, $today, 'Dolor torácico a descartar IAM.', 9999, 103], // Ocupada
        
        [4, 1, $twoDaysAgo, 'Neumonía atípica severa.', 8888, 201], // Ocupada
        [5, 1, $yesterday, 'Post-operatorio de cirugía cardiovascular.', 9999, 202], // Egreso programado
        
        [6, 1, $threeDaysAgo, 'Dengue con signos de alarma.', 8888, 301], // Ocupada
        [7, 1, $twoDaysAgo, 'Infección urinaria complicada.', 9999, 302], // Egreso programado
        [8, 1, $yesterday, 'Fractura de fémur, reposo.', 8888, 303], // Ocupada
        [9, 1, $today, 'Cuadro de deshidratación severa.', 9999, 304] // Ocupada
    ];

    foreach ($ingresos as $ing) {
        $stmt->execute($ing);
    }
    echo "✓ 9 Ingresos ficticios creados.\n";

    // Insertar Egresos (solo para los ingresos 1, 5 y 7)
    $stmtE = $pdo->prepare("INSERT INTO egresos (ID, TIPO, INGRESOS_ID, FECHAEGRESO, OBSERVACIONES, HABITACIONES_ID) VALUES (?, ?, ?, ?, ?, ?)");
    $egresos = [
        [1, 1, 1, $yesterday, 'Alta voluntaria, paciente se encuentra estable.', 101],
        [2, 1, 5, $today, 'Estable, pasa a piso general para recuperación.', 202],
        [3, 1, 7, $today, 'Alta por mejoría total, terminar esquema antibiótico.', 302]
    ];

    foreach ($egresos as $egr) {
        $stmtE->execute($egr);
    }
    echo "✓ 3 Egresos ficticios creados.\n";
    
    echo "\n✨ ¡Base de datos lista para pruebas!\n";
    echo "📊 Resumen: 9 Ingresos Históricos, 3 Egresos. Ocupación actual: 6 camas ocupadas.\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
