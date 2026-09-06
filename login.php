<?php

header("Content-Type: application/json");

require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid data received."
    ]);
    exit;
}

$role = strtolower(trim($data["role"] ?? ""));
$identifier = trim($data["identifier"] ?? "");
$password = $data["password"] ?? "";

if (!in_array($role, ["government", "landowner"], true)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid account role."
    ]);
    exit;
}

if (!$identifier || !$password) {
    echo json_encode([
        "success" => false,
        "message" => "Please enter your login details."
    ]);
    exit;
}

$identifier = strtolower($identifier);

if ($role === "government") {

    $stmt = $conn->prepare(
        "SELECT id, role, department, position, unique_id,
                government_id, name, email, phone, password, created_at
         FROM users
         WHERE role = 'government'
           AND (LOWER(email) = ? OR LOWER(unique_id) = ?)
         LIMIT 1"
    );

    $stmt->bind_param("ss", $identifier, $identifier);

} else {

    $stmt = $conn->prepare(
        "SELECT id, role, department, position, unique_id,
                government_id, name, email, phone, password, created_at
         FROM users
         WHERE role = 'landowner'
           AND (LOWER(email) = ? OR LOWER(government_id) = ?)
         LIMIT 1"
    );

    $stmt->bind_param("ss", $identifier, $identifier);
}

$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows !== 1) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid login details. Please check your credentials."
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

$user = $result->fetch_assoc();

if (!password_verify($password, $user["password"])) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid login details. Please check your credentials."
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

unset($user["password"]);

echo json_encode([
    "success" => true,
    "message" => "Login successful.",
    "user" => $user
]);

$stmt->close();
$conn->close();

?>