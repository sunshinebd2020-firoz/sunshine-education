<?php
/*
| Mirrors the real deployed backend at
| C:/xampp/htdocs/sunshine-api/api/get_site_settings.php
*/

// Public endpoint - hotline number and banner visibility for the homepage.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$conn->query("
    CREATE TABLE IF NOT EXISTS site_settings (
        setting_key VARCHAR(191) NOT NULL PRIMARY KEY,
        setting_value TEXT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$data = [
    'hotline_number' => '',
    'banner_enabled' => '1',
];

$keys = array_keys($data);
$placeholders = implode(',', array_fill(0, count($keys), '?'));

$stmt = $conn->prepare("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ($placeholders)");
$types = str_repeat('s', count($keys));
$stmt->bind_param($types, ...$keys);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $data[$row['setting_key']] = $row['setting_value'] ?? '';
}

$stmt->close();

echo json_encode([
    "success" => true,
    "settings" => $data,
]);
