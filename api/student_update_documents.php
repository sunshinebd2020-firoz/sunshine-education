<?php

declare(strict_types=1);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['http://localhost:5173', 'http://localhost:5176', 'http://127.0.0.1:5173', 'http://127.0.0.1:5176', 'http://localhost'];
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: *');
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    echo json_encode(["success" => true]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Only POST requests are allowed."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . "/db.php";

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

if (empty($_SESSION['logged_in']) || strtolower((string) ($_SESSION['role'] ?? '')) !== 'student') {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Student session is required.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function studentDocumentsUploadDir(): string
{
    $uploadDir = __DIR__ . "/../uploads/students/";

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    return $uploadDir;
}

function studentDocumentsDeleteOldFile(string $fileName): void
{
    if ($fileName === "") {
        return;
    }

    $candidate = studentDocumentsUploadDir() . basename($fileName);

    if (file_exists($candidate)) {
        @unlink($candidate);
    }
}

function studentDocumentsNormalizeText(mixed $value): string
{
    return trim((string) ($value ?? ""));
}

function studentDocumentsEnsureColumns(mysqli $connection): void
{
    $columns = [
        "ALTER TABLE students ADD COLUMN IF NOT EXISTS nid_no VARCHAR(100) NULL AFTER passport_expiry_date",
        "ALTER TABLE students ADD COLUMN IF NOT EXISTS nid_scan VARCHAR(255) NULL AFTER nid_no",
        "ALTER TABLE students ADD COLUMN IF NOT EXISTS birth_registration_no VARCHAR(100) NULL AFTER nid_scan",
        "ALTER TABLE students ADD COLUMN IF NOT EXISTS birth_registration_scan VARCHAR(255) NULL AFTER birth_registration_no",
    ];

    foreach ($columns as $sql) {
        $connection->query($sql);
    }
}

function studentDocumentsFindStudent(mysqli $connection, string $studentId): ?array
{
    if ($studentId === "") {
        return null;
    }

    $statement = $connection->prepare("SELECT * FROM students WHERE student_id = ? LIMIT 1");
    if (!$statement) {
        return null;
    }

    $statement->bind_param("s", $studentId);
    $statement->execute();
    $result = $statement->get_result();
    $student = $result->fetch_assoc();
    $statement->close();

    return $student ?: null;
}

function studentDocumentsSaveUpload(array $file, string $prefix, array $allowedExtensions, array $allowedMimeTypes = [], int $maxBytes = 5 * 1024 * 1024): string
{
    if (!isset($file["tmp_name"]) || !is_uploaded_file($file["tmp_name"])) {
        throw new RuntimeException("Invalid upload file.");
    }

    if ((int) ($file["error"] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException("Upload file is missing or invalid.");
    }

    $fileSize = (int) ($file["size"] ?? 0);
    if ($fileSize <= 0 || $fileSize > $maxBytes) {
        throw new RuntimeException("File size must be between 1 byte and 5 MB.");
    }

    $fileName = (string) ($file["name"] ?? "");
    $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedExtensions, true)) {
        throw new RuntimeException("Unsupported file extension.");
    }

    $mimeType = "";
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    if ($finfo !== false) {
        $mimeType = strtolower((string) finfo_file($finfo, $file["tmp_name"]));
        finfo_close($finfo);
    }

    if ($allowedMimeTypes !== [] && !in_array($mimeType, $allowedMimeTypes, true)) {
        throw new RuntimeException("Unsupported file type.");
    }

    $uploadName = $prefix . "_" . time() . "_" . bin2hex(random_bytes(4)) . "." . $extension;
    $targetPath = studentDocumentsUploadDir() . $uploadName;

    if (!move_uploaded_file($file["tmp_name"], $targetPath)) {
        throw new RuntimeException("The file could not be saved.");
    }

    return $uploadName;
}

try {
    $connection = sunshineDbConnect();
    studentDocumentsEnsureColumns($connection);

    $sessionStudentId = studentDocumentsNormalizeText($_SESSION['student_id'] ?? $_SESSION['username'] ?? '');
    $studentId = studentDocumentsNormalizeText($_POST["student_id"] ?? $_POST["studentId"] ?? $sessionStudentId);

    if ($studentId === "") {
        sunshineRespondJson(400, [
            "success" => false,
            "message" => "Student ID is required."
        ]);
    }

    if ($sessionStudentId !== '' && $studentId !== $sessionStudentId) {
        sunshineRespondJson(403, [
            "success" => false,
            "message" => "You can update only your own student documents."
        ]);
    }

    $student = studentDocumentsFindStudent($connection, $studentId);
    if (!$student) {
        sunshineRespondJson(404, [
            "success" => false,
            "message" => "Student profile not found."
        ]);
    }

    $updateFields = [];
    $bindValues = [];
    $bindTypes = "";

    $photoPath = studentDocumentsNormalizeText($_POST["student_photo"] ?? $_POST["studentPhoto"] ?? "");
    foreach (["student_photo", "studentPhoto"] as $fieldName) {
        if (isset($_FILES[$fieldName]) && is_array($_FILES[$fieldName])) {
            if ((int) ($_FILES[$fieldName]["error"] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
                $newPhoto = studentDocumentsSaveUpload(
                    $_FILES[$fieldName],
                    "student_photo_{$studentId}",
                    ["jpg", "jpeg", "png", "webp"],
                    ["image/jpeg", "image/png", "image/webp"],
                    5 * 1024 * 1024
                );

                if ($newPhoto !== "") {
                    $oldPhoto = studentDocumentsNormalizeText($student["student_photo"] ?? "");
                    if ($oldPhoto !== "" && $oldPhoto !== $newPhoto) {
                        studentDocumentsDeleteOldFile($oldPhoto);
                    }
                    $photoPath = $newPhoto;
                }
            }
        }
    }

    if ($photoPath !== "") {
        $updateFields[] = "student_photo = ?";
        $bindValues[] = $photoPath;
        $bindTypes .= "s";
    }

    $passportScan = studentDocumentsNormalizeText($_POST["passport_scan"] ?? $_POST["passportScan"] ?? "");
    foreach (["passport_scan", "passportScan"] as $fieldName) {
        if (isset($_FILES[$fieldName]) && is_array($_FILES[$fieldName])) {
            if ((int) ($_FILES[$fieldName]["error"] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
                $newFile = studentDocumentsSaveUpload(
                    $_FILES[$fieldName],
                    "passport_{$studentId}",
                    ["jpg", "jpeg", "png", "pdf"],
                    ["image/jpeg", "image/png", "application/pdf"],
                    5 * 1024 * 1024
                );

                if ($newFile !== "") {
                    $oldFile = studentDocumentsNormalizeText($student["passport_scan"] ?? "");
                    if ($oldFile !== "" && $oldFile !== $newFile) {
                        studentDocumentsDeleteOldFile($oldFile);
                    }
                    $passportScan = $newFile;
                }
            }
        }
    }

    if ($passportScan !== "") {
        $updateFields[] = "passport_scan = ?";
        $bindValues[] = $passportScan;
        $bindTypes .= "s";
    }

    $passportNo = studentDocumentsNormalizeText($_POST["passport_no"] ?? $_POST["passportNo"] ?? "");
    if ($passportNo !== "") {
        $updateFields[] = "passport_no = ?";
        $bindValues[] = $passportNo;
        $bindTypes .= "s";
    }

    $nidNo = studentDocumentsNormalizeText($_POST["nid_no"] ?? $_POST["nidNo"] ?? "");
    if ($nidNo !== "") {
        $updateFields[] = "nid_no = ?";
        $bindValues[] = $nidNo;
        $bindTypes .= "s";
    }

    $nidScan = studentDocumentsNormalizeText($_POST["nid_scan"] ?? $_POST["nidScan"] ?? "");
    foreach (["nid_scan", "nidScan"] as $fieldName) {
        if (isset($_FILES[$fieldName]) && is_array($_FILES[$fieldName])) {
            if ((int) ($_FILES[$fieldName]["error"] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
                $newFile = studentDocumentsSaveUpload(
                    $_FILES[$fieldName],
                    "nid_{$studentId}",
                    ["jpg", "jpeg", "png", "pdf"],
                    ["image/jpeg", "image/png", "application/pdf"],
                    5 * 1024 * 1024
                );
                $oldFile = studentDocumentsNormalizeText($student["nid_scan"] ?? "");
                if ($oldFile !== "" && $oldFile !== $newFile) {
                    studentDocumentsDeleteOldFile($oldFile);
                }
                $nidScan = $newFile;
            }
        }
    }

    if ($nidScan !== "") {
        $updateFields[] = "nid_scan = ?";
        $bindValues[] = $nidScan;
        $bindTypes .= "s";
    }

    $birthRegistrationNo = studentDocumentsNormalizeText($_POST["birth_registration_no"] ?? $_POST["birthRegistrationNo"] ?? "");
    if ($birthRegistrationNo !== "") {
        $updateFields[] = "birth_registration_no = ?";
        $bindValues[] = $birthRegistrationNo;
        $bindTypes .= "s";
    }

    $birthRegistrationScan = studentDocumentsNormalizeText($_POST["birth_registration_scan"] ?? $_POST["birthRegistrationScan"] ?? "");
    foreach (["birth_registration_scan", "birthRegistrationScan"] as $fieldName) {
        if (isset($_FILES[$fieldName]) && is_array($_FILES[$fieldName])) {
            if ((int) ($_FILES[$fieldName]["error"] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
                $newFile = studentDocumentsSaveUpload(
                    $_FILES[$fieldName],
                    "birth_registration_{$studentId}",
                    ["jpg", "jpeg", "png", "pdf"],
                    ["image/jpeg", "image/png", "application/pdf"],
                    5 * 1024 * 1024
                );
                $oldFile = studentDocumentsNormalizeText($student["birth_registration_scan"] ?? "");
                if ($oldFile !== "" && $oldFile !== $newFile) {
                    studentDocumentsDeleteOldFile($oldFile);
                }
                $birthRegistrationScan = $newFile;
            }
        }
    }

    if ($birthRegistrationScan !== "") {
        $updateFields[] = "birth_registration_scan = ?";
        $bindValues[] = $birthRegistrationScan;
        $bindTypes .= "s";
    }

    if ($updateFields !== []) {
        $sql = "UPDATE students SET " . implode(", ", $updateFields) . " WHERE student_id = ?";
        $statement = $connection->prepare($sql);
        if (!$statement) {
            throw new RuntimeException("Unable to prepare student document update query: " . $connection->error);
        }

        $allValues = [...$bindValues, $studentId];
        $statement->bind_param($bindTypes . "s", ...$allValues);
        if (!$statement->execute()) {
            throw new RuntimeException("Student document update failed: " . $statement->error);
        }
        $statement->close();
    }

    $updatedStudent = studentDocumentsFindStudent($connection, $studentId);
    if (!$updatedStudent) {
        sunshineRespondJson(404, [
            "success" => false,
            "message" => "Updated student could not be loaded."
        ]);
    }

    sunshineRespondJson(200, [
        "success" => true,
        "message" => "Student document updated successfully.",
        "student" => $updatedStudent,
        "profile" => $updatedStudent,
    ]);
} catch (Throwable $exception) {
    $message = $exception->getMessage();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Student document update failed: " . $message,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
