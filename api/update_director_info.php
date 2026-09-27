<?php
/*
| Mirrors the real deployed backend at
| C:/xampp/htdocs/sunshine-api/api/update_director_info.php
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

        /*
        | Settings has no separate add/edit distinction on the frontend
        | (sidebar only checks can_view), so any grant is enough here too.
        */
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

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    echo json_encode([
        "success" => false,
        "message" => "Only POST requests are allowed."
    ]);
    exit;
}

function saveSetting(mysqli $conn, string $key, string $value): void
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

$name = trim((string) ($_POST['director_name'] ?? ''));
$designation = trim((string) ($_POST['director_designation'] ?? ''));
$message = trim((string) ($_POST['director_message'] ?? ''));

$messageWords = preg_split('/\s+/', $message, -1, PREG_SPLIT_NO_EMPTY);
if (count($messageWords) > 1000) {
    $message = implode(' ', array_slice($messageWords, 0, 1000));
}

saveSetting($conn, 'director_name', $name);
saveSetting($conn, 'director_designation', $designation);
saveSetting($conn, 'director_message', $message);

/*
|--------------------------------------------------------------------------
| PHOTO UPLOAD (optional - keep existing photo if not replaced)
|--------------------------------------------------------------------------
*/

if (isset($_FILES['director_photo']) && $_FILES['director_photo']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['director_photo'];

    $allowed = ['jpg', 'jpeg', 'png', 'webp'];
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($extension, $allowed, true)) {
        echo json_encode([
            "success" => false,
            "message" => "Only JPG, JPEG, PNG and WEBP images are allowed."
        ]);
        exit;
    }

    $uploadDir = "../uploads/director/";

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = time() . "_" . uniqid() . "." . $extension;
    $targetPath = $uploadDir . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        echo json_encode([
            "success" => false,
            "message" => "Could not save director photo."
        ]);
        exit;
    }

    $photoPath = "uploads/director/" . $fileName;

    $stmt = $conn->prepare("SELECT setting_value FROM site_settings WHERE setting_key = 'director_photo' LIMIT 1");
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    $oldPhoto = trim((string) ($existing['setting_value'] ?? ''));

    if ($oldPhoto !== '' && $oldPhoto !== $photoPath) {
        $oldPath = "../" . $oldPhoto;

        if (file_exists($oldPath)) {
            @unlink($oldPath);
        }
    }

    saveSetting($conn, 'director_photo', $photoPath);
}

echo json_encode([
    "success" => true,
    "message" => "Director information saved successfully.",
]);
