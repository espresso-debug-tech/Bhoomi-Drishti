<?php

header("Content-Type: application/json");
require_once "db.php";

try {

    $lat = $_GET["lat"] ?? null;
    $lng = $_GET["lng"] ?? null;
    $radius = $_GET["radius"] ?? 25;

    if (!$lat || !$lng) {
        echo json_encode([
            "success" => false,
            "message" => "Missing latitude or longitude."
        ]);
        exit;
    }

    // Haversine formula: calculates distance (in km) between
    // the searched point and every plot, directly in SQL.
    $sql = "
        SELECT
            id, name, district, state, latitude, longitude,
            area_acres, status,
            (
                6371 * ACOS(
                    COS(RADIANS(?)) * COS(RADIANS(latitude)) *
                    COS(RADIANS(longitude) - RADIANS(?)) +
                    SIN(RADIANS(?)) * SIN(RADIANS(latitude))
                )
            ) AS distance_km
        FROM plots
        HAVING distance_km <= ?
        ORDER BY distance_km ASC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("dddd", $lat, $lng, $lat, $radius);
    $stmt->execute();
    $result = $stmt->get_result();

    $plots = [];

    while ($row = $result->fetch_assoc()) {
        $row["distance_km"] = round($row["distance_km"], 2);
        $plots[] = $row;
    }

    echo json_encode([
        "success" => true,
        "count" => count($plots),
        "plots" => $plots
    ]);

    $stmt->close();

} catch (Throwable $e) {

    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);

}

$conn->close();

?>