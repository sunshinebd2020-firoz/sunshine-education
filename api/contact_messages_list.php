<?php
/*
| Mirrors the real deployed backend at
| C:/xampp/htdocs/sunshine-api/api/contact_messages_list.php
*/

require_once __DIR__ . '/../config/auth.php';
require_admin();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/db.php';

$conn->query("ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS reply_message TEXT NULL");
$conn->query("ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP NULL");

$result = $conn->query("
    SELECT
        cm.id,
        cm.branch_id,
        cm.name,
        cm.mobile,
        cm.email,
        cm.message,
        cm.status,
        cm.reply_message,
        cm.replied_at,
        cm.created_at,
        b.branch_name
    FROM contact_messages cm
    LEFT JOIN branches b ON b.id = cm.branch_id
    ORDER BY cm.created_at DESC
");

$messages = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }
}

echo json_encode([
    "success" => true,
    "data" => $messages,
]);
