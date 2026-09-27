<?php
/*
| Mirrors the real deployed backend at
| C:/xampp/htdocs/sunshine-api/api/update_site_settings.php
*/

require_once __DIR__ . '/../config/auth.php';
require_login();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/db.php';

$conn->query("
    CREATE TABLE IF NOT EXISTS site_settings (
        setting_key VARCHAR(191) NOT NULL PRIMARY KEY,
        setting_value TEXT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

/*
|--------------------------------------------------------------------------
| ALLOW: true admins, OR staff granted the 'setting' module permission
|--------------------------------------------------------------------------
*/

$sessionRole = strtolower(trim((string) ($_SESSION['role'] ?? '')));
$isAdmin = in_array($sessionRole, ['admin', 'administrator', 'super admin', 'superadmin'], true);

if (!$isAdmin) {
    $allowed = false;
    $adminId = (int) ($_SESSION['admin_id'] ?? 0);

    if ($adminId > 0) {
        $stmt = $conn->prepare("
            SELECT can_view, can_add, can_edit
            FROM user_permissions
            WHERE admin_id = ? AND permission IN ('all', 'setting')
            LIMIT 1
        ");
        $stmt->bind_param("i", $adminId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        $allowed = $row && (
            (int) ($row['can_view'] ?? 0) === 1 ||
            (int) ($row['can_add'] ?? 0) === 1 ||
            (int) ($row['can_edit'] ?? 0) === 1
        );
    }

    if (!$allowed) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Administrator permission is required."
        ]);
        exit;
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    echo json_encode(["success" => false, "message" => "Only POST requests are allowed."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    $input = $_POST;
}

function saveSiteSetting(mysqli $conn, string $key, string $value): void
{
    $stmt = $conn->prepare("
        INSERT INTO site_settings (setting_key, setting_value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    ");

    $stmt->bind_param("ss", $key, $value);
    $stmt->execute();
    $stmt->close();
}

if (array_key_exists('hotline_number', $input)) {
    saveSiteSetting($conn, 'hotline_number', trim((string) $input['hotline_number']));
}

if (array_key_exists('banner_enabled', $input)) {
    $bannerEnabled = ((string) $input['banner_enabled'] === '1' || $input['banner_enabled'] === true) ? '1' : '0';
    saveSiteSetting($conn, 'banner_enabled', $bannerEnabled);
}

echo json_encode([
    "success" => true,
    "message" => "Settings saved successfully.",
]);
