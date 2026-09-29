<?php
/*
| Mirrors the real deployed backend at
| C:/xampp/htdocs/sunshine-api/api/contact_message_reply.php
*/

require_once __DIR__ . '/../config/auth.php';
require_admin();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/db.php';

$conn->query("ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS reply_message TEXT NULL");
$conn->query("ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP NULL");

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    echo json_encode(["success" => false, "message" => "Only POST requests are allowed."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    $input = $_POST;
}

$id = (int) ($input['id'] ?? 0);
$reply = trim((string) ($input['reply_message'] ?? ''));

if ($id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid message ID."]);
    exit;
}

if ($reply === '') {
    echo json_encode(["success" => false, "message" => "Reply message is required."]);
    exit;
}

$stmt = $conn->prepare("SELECT name, email FROM contact_messages WHERE id = ? LIMIT 1");
$stmt->bind_param("i", $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(["success" => false, "message" => "Message not found."]);
    exit;
}

$updateStmt = $conn->prepare("
    UPDATE contact_messages
    SET reply_message = ?, status = 'replied', replied_at = NOW()
    WHERE id = ?
");
$updateStmt->bind_param("si", $reply, $id);
$updateStmt->execute();
$updateStmt->close();

/*
|--------------------------------------------------------------------------
| EMAIL (best-effort - reply is saved regardless of email outcome)
|--------------------------------------------------------------------------
*/

$emailSent = false;
$recipientEmail = trim((string) ($row['email'] ?? ''));

if ($recipientEmail !== '' && filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
    $subject = "Reply from Sunshine Education";
    $body = "Dear " . ($row['name'] ?? '') . ",\n\n" . $reply . "\n\nRegards,\nSunshine Education";
    $mailFrom = str_replace(["\r", "\n"], '', (string) (getenv('SUNSHINE_MAIL_FROM') ?: 'sunshinebd2020@gmail.com'));
    if (!filter_var($mailFrom, FILTER_VALIDATE_EMAIL)) {
        $mailFrom = 'sunshinebd2020@gmail.com';
    }
    $headers = "From: Sunshine Education <{$mailFrom}>\r\n";

    $emailSent = @mail($recipientEmail, $subject, $body, $headers);
}

echo json_encode([
    "success" => true,
    "message" => "Reply saved successfully.",
    "email_sent" => $emailSent,
]);
