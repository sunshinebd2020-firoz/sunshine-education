<?php
/*
| Mirrors the real deployed backend at
| C:/xampp/htdocs/sunshine-api/api/get_director_info.php
*/

// Public endpoint - Director info shown on the homepage.
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

/*
| site_settings may already exist from older features (e.g. hotline_number)
| with setting_value as a short VARCHAR, which silently truncates long
| text like the director message. Widen it to TEXT if needed.
*/
$columnInfo = $conn->query("SHOW COLUMNS FROM site_settings LIKE 'setting_value'")->fetch_assoc();
if ($columnInfo && stripos($columnInfo['Type'], 'text') === false) {
    $conn->query("ALTER TABLE site_settings MODIFY COLUMN setting_value TEXT NULL");
}

$keys = ['director_name', 'director_designation', 'director_message', 'director_photo'];
$placeholders = implode(',', array_fill(0, count($keys), '?'));

$data = [
    'director_name' => '',
    'director_designation' => '',
    'director_message' => '',
    'director_photo' => '',
];

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
    "director" => $data,
]);
