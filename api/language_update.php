<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/auth.php';
require_admin();
send_api_cors_headers();
include __DIR__ . '/../config/db.php';

function languageUpdateRespond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    languageUpdateRespond(405, [
        'success' => false,
        'message' => 'Only POST request is allowed.'
    ]);
}

$data = json_decode(file_get_contents('php://input'), true);
$id = (int)($data['id'] ?? 0);
$name = trim((string)($data['name'] ?? ''));

if ($id <= 0 || $name === '') {
    languageUpdateRespond(400, [
        'success' => false,
        'message' => $id <= 0 ? 'Invalid language ID.' : 'Language name is required.'
    ]);
}

$transactionStarted = false;

try {
    $conn->begin_transaction();
    $transactionStarted = true;

    $languageStmt = $conn->prepare('SELECT name FROM languages WHERE id = ? LIMIT 1 FOR UPDATE');
    if (!$languageStmt) {
        throw new RuntimeException('Language lookup failed.');
    }
    $languageStmt->bind_param('i', $id);
    $languageStmt->execute();
    $languageRow = $languageStmt->get_result()->fetch_assoc();
    $languageStmt->close();

    if (!$languageRow) {
        $conn->rollback();
        languageUpdateRespond(404, [
            'success' => false,
            'message' => 'Language not found.'
        ]);
    }

    $duplicateStmt = $conn->prepare(
        'SELECT id FROM languages WHERE LOWER(name) = LOWER(?) AND id <> ? LIMIT 1'
    );
    if (!$duplicateStmt) {
        throw new RuntimeException('Duplicate check failed.');
    }
    $duplicateStmt->bind_param('si', $name, $id);
    $duplicateStmt->execute();
    $hasDuplicate = $duplicateStmt->get_result()->num_rows > 0;
    $duplicateStmt->close();

    if ($hasDuplicate) {
        $conn->rollback();
        languageUpdateRespond(409, [
            'success' => false,
            'message' => 'This language already exists.'
        ]);
    }

    $oldName = trim((string)$languageRow['name']);
    $updateLanguage = $conn->prepare('UPDATE languages SET name = ? WHERE id = ?');
    if (!$updateLanguage) {
        throw new RuntimeException('Language update failed.');
    }
    $updateLanguage->bind_param('si', $name, $id);
    $updateLanguage->execute();
    $updateLanguage->close();

    if ($oldName !== $name) {
        $updateCourses = $conn->prepare('UPDATE courses SET language = ? WHERE language = ?');
        if (!$updateCourses) {
            throw new RuntimeException('Linked course update failed.');
        }
        $updateCourses->bind_param('ss', $name, $oldName);
        $updateCourses->execute();
        $updateCourses->close();

        $updateStudents = $conn->prepare('UPDATE students SET course = ? WHERE course = ?');
        if (!$updateStudents) {
            throw new RuntimeException('Linked student update failed.');
        }
        $updateStudents->bind_param('ss', $name, $oldName);
        $updateStudents->execute();
        $updateStudents->close();
    }

    $conn->commit();
    $transactionStarted = false;
    $conn->close();

    languageUpdateRespond(200, [
        'success' => true,
        'message' => 'Language updated successfully.'
    ]);
} catch (Throwable $error) {
    if ($transactionStarted) {
        $conn->rollback();
    }
    error_log('Language update error: ' . $error->getMessage());
    $conn->close();

    languageUpdateRespond(500, [
        'success' => false,
        'message' => 'Language could not be updated.'
    ]);
}