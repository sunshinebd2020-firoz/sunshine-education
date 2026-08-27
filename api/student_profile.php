<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

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
    sunshineRespondJson(401, [
        'success' => false,
        'message' => 'Student session is required.'
    ]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Only GET requests are allowed.'
    ]);
    exit;
}

try {
    $connection = sunshineDbConnect();
    $sessionStudentId = trim((string) ($_SESSION['student_id'] ?? $_SESSION['username'] ?? ''));
    $studentId = trim((string) ($_GET['student_id'] ?? ''));
    $id = trim((string) ($_GET['id'] ?? ''));

    if ($studentId === '' && $id === '') {
        $studentId = $sessionStudentId;
    }

    if ($studentId !== '' && $sessionStudentId !== '' && $studentId !== $sessionStudentId) {
        sunshineRespondJson(403, [
            'success' => false,
            'message' => 'You can only access your own student profile.'
        ]);
    }

    if ($studentId === '' && $sessionStudentId !== '') {
        $studentId = $sessionStudentId;
    }

    if ($studentId === '' && $id === '') {
        sunshineRespondJson(400, [
            'success' => false,
            'message' => 'Student ID is required.'
        ]);
    }

    if (studentHasColumn($connection, 'students', 'student_id')) {
        $statement = $connection->prepare('SELECT * FROM students WHERE student_id = ? LIMIT 1');
        $queryId = $studentId !== '' ? $studentId : $id;
        $statement->bind_param('s', $queryId);
        $statement->execute();
        $result = $statement->get_result();
        $student = $result->fetch_assoc();
        $statement->close();

        if ($student) {
            sunshineRespondJson(200, [
                'success' => true,
                'student' => $student,
                'profile' => $student,
            ]);
        }
    }

    if ($id !== '') {
        $statement = $connection->prepare('SELECT * FROM students WHERE id = ? LIMIT 1');
        $numericId = (int) $id;
        $statement->bind_param('i', $numericId);
        $statement->execute();
        $result = $statement->get_result();
        $student = $result->fetch_assoc();
        $statement->close();

        if ($student) {
            sunshineRespondJson(200, [
                'success' => true,
                'student' => $student,
                'profile' => $student,
            ]);
        }
    }

    if ($studentId !== '') {
        $statement = $connection->prepare('SELECT * FROM students WHERE id = ? LIMIT 1');
        $numericId = (int) $studentId;
        $statement->bind_param('i', $numericId);
        $statement->execute();
        $result = $statement->get_result();
        $student = $result->fetch_assoc();
        $statement->close();

        if ($student) {
            sunshineRespondJson(200, [
                'success' => true,
                'student' => $student,
                'profile' => $student,
            ]);
        }
    }

    sunshineRespondJson(404, [
        'success' => false,
        'message' => 'Student profile not found.'
    ]);
} catch (Throwable $exception) {
    sunshineRespondJson(500, [
        'success' => false,
        'message' => 'Student profile load failed: ' . $exception->getMessage(),
    ]);
}

function studentHasColumn(mysqli $connection, string $table, string $column): bool
{
    $safeTable = preg_replace('/[^A-Za-z0-9_]/', '', $table);
    $safeColumn = preg_replace('/[^A-Za-z0-9_]/', '', $column);

    if ($safeTable === '' || $safeColumn === '') {
        return false;
    }

    $query = $connection->query("SHOW COLUMNS FROM `{$safeTable}` LIKE '{$safeColumn}'");
    if ($query === false) {
        return false;
    }

    $exists = $query->num_rows > 0;
    $query->free_result();

    return $exists;
}
