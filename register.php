<?php

header("Content-Type: application/json");
require_once "db.php";

try {

    $data = json_decode(file_get_contents("php://input"), true);

    $role = $data["role"] ?? "";
    $department = $data["department"] ?? null;
    $position = $data["position"] ?? null;
    $uniqueId = $data["uniqueId"] ?? null;
    $governmentId = $data["governmentId"] ?? null;
    $name = $data["name"] ?? "";
    $email = strtolower(trim($data["email"] ?? ""));
    $phone = $data["phone"] ?? null;
    $password = $data["password"] ?? "";

    if (!$role || !$name || !$email || !$password) {
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields."
        ]);
        exit;
    }

    $checkStmt = $conn->prepare(
        "SELECT id FROM users WHERE email = ? OR (government_id = ? AND government_id IS NOT NULL AND government_id != '')"
    );
    $checkStmt->bind_param("ss", $email, $governmentId);
    $checkStmt->execute();
    $checkStmt->store_result();

    if ($checkStmt->num_rows > 0) {
        echo json_encode([
            "success" => false,
            "message" => "An account with this email or Government ID already exists."
        ]);
        $checkStmt->close();
        exit;
    }

    $checkStmt->close();

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $insertStmt = $conn->prepare(
        "INSERT INTO users (role, department, position, unique_id, government_id, name, email, phone, password)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $insertStmt->bind_param(
        "sssssssss",
        $role, $department, $position, $uniqueId, $governmentId, $name, $email, $phone, $hashedPassword
    );

    $insertStmt->execute();

    if ($role === "landowner") {

        $notifTitle = "New Land Owner Registered";
        $notifMessage = $name . " just registered.";
        $notifType = "registration";
        $notifRole = "government";

        $notifStmt = $conn->prepare(
            "INSERT INTO notifications (target_role, type, title, message)
             VALUES (?, ?, ?, ?)"
        );
        $notifStmt->bind_param(
            "ssss",
            $notifRole, $notifType, $notifTitle, $notifMessage
        );
        $notifStmt->execute();
        $notifStmt->close();

    }

    echo json_encode([
        "success" => true,
        "message" => "Account created successfully."
    ]);

    $insertStmt->close();

} catch (mysqli_sql_exception $e) {

    if (str_contains($e->getMessage(), "Duplicate entry")) {
        echo json_encode([
            "success" => false,
            "message" => "An account with this email or Government ID already exists."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Database error: " . $e->getMessage()
        ]);
    }

} catch (Throwable $e) {

    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);

}

$conn->close();

?>