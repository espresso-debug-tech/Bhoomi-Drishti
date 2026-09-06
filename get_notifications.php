<?php

header("Content-Type: application/json");
require_once "db.php";

try {

    $role = $_GET["role"] ?? "";

    if (!$role) {
        echo json_encode([
            "success" => false,
            "message" => "Missing role."
        ]);
        exit;
    }

    $stmt = $conn->prepare(
        "SELECT id, type, title, message, is_read, created_at
         FROM notifications
         WHERE target_role = ?
         ORDER BY created_at DESC
         LIMIT 20"
    );
    $stmt->bind_param("s", $role);
    $stmt->execute();
    $result = $stmt->get_result();

    $notifications = [];
    $unreadCount = 0;

    while ($row = $result->fetch_assoc()) {

        $notifications[] = $row;

        if ($row["is_read"] == 0) {
            $unreadCount++;
        }

    }

    echo json_encode([
        "success" => true,
        "unread_count" => $unreadCount,
        "notifications" => $notifications
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