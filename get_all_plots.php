<?php

header("Content-Type: application/json");
require_once "db.php";

try {

    $result = $conn->query(
        "SELECT id, name, district, state, latitude, longitude, area_acres, status FROM plots"
    );

    $plots = [];

    while ($row = $result->fetch_assoc()) {
        $plots[] = $row;
    }

    echo json_encode([
        "success" => true,
        "plots" => $plots
    ]);

} catch (Throwable $e) {

    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);

}

$conn->close();

?>