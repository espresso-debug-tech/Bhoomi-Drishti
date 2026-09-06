<?php

header("Content-Type: application/json");
require_once "db.php";

try {

    $data = json_decode(file_get_contents("php://input"), true);
    $role = $data["role"] ?? "";

    if (!$role) {
        echo json_encode([
            "success" => false,
            "message" => "Missing role."
        ]);
        exit;
    }

    $stmt = $conn->prepare(
        "UPDATE notifications SET is_read = 1 WHERE target_role = ?"
    );
    $stmt->bind_param("s", $role);
    $stmt->execute();

    echo json_encode([
        "success" => true
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