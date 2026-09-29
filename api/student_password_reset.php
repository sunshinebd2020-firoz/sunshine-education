<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/student_verified_email_helpers.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['http://sunshine.test', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5176', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5176'];
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
}
header('Vary: Origin');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

function sunshineStudentResetHasColumn(mysqli $connection, string $table, string $column): bool
{
    $safeTable = preg_replace('/[^A-Za-z0-9_]/', '', $table);
    $safeColumn = preg_replace('/[^A-Za-z0-9_]/', '', $column);

    if ($safeTable === '' || $safeColumn === '') {
        return false;
    }

    $result = $connection->query("SHOW COLUMNS FROM `{$safeTable}` LIKE '{$safeColumn}'");
    if ($result === false) {
        return false;
    }

    $exists = $result->num_rows > 0;
    $result->free_result();
    return $exists;
}

function sunshineStudentResetFindStudent(mysqli $connection, string $studentId): ?array
{
    if (sunshineStudentResetHasColumn($connection, 'students', 'student_id')) {
        $statement = $connection->prepare('SELECT * FROM students WHERE student_id = ? LIMIT 1');
        $statement->bind_param('s', $studentId);
        $statement->execute();
        $student = $statement->get_result()->fetch_assoc();
        $statement->close();

        if ($student) {
            return $student;
        }
    }

    if (ctype_digit($studentId) && sunshineStudentResetHasColumn($connection, 'students', 'id')) {
        $studentDatabaseId = (int) $studentId;
        $statement = $connection->prepare('SELECT * FROM students WHERE id = ? LIMIT 1');
        $statement->bind_param('i', $studentDatabaseId);
        $statement->execute();
        $student = $statement->get_result()->fetch_assoc();
        $statement->close();
        return $student ?: null;
    }

    return null;
}

function sunshineStudentResetFindUser(mysqli $connection, string $studentId): ?array
{
    $conditions = [];
    foreach (['username', 'student_id'] as $column) {
        if (sunshineStudentResetHasColumn($connection, 'users', $column)) {
            $conditions[] = "`{$column}` = ?";
        }
    }

    if ($conditions === []) {
        return null;
    }

    $where = '(' . implode(' OR ', $conditions) . ')';
    if (sunshineStudentResetHasColumn($connection, 'users', 'role')) {
        $where .= " AND LOWER(TRIM(role)) = 'student'";
    }

    $statement = $connection->prepare("SELECT * FROM users WHERE {$where} LIMIT 1");
    $values = array_fill(0, count($conditions), $studentId);
    $statement->bind_param(str_repeat('s', count($values)), ...$values);
    $statement->execute();
    $user = $statement->get_result()->fetch_assoc();
    $statement->close();
    return $user ?: null;
}

function sunshineStudentResetRespond(int $status, array $payload): void
{
    sunshineRespondJson($status, $payload);
}

try {
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

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        sunshineStudentResetRespond(405, [
            'success' => false,
            'message' => 'Only POST requests are allowed.',
        ]);
    }

    $payload = json_decode(file_get_contents('php://input'), true);
    if (!is_array($payload)) {
        sunshineStudentResetRespond(400, [
            'success' => false,
            'message' => 'Invalid request.',
        ]);
    }

    $action = trim((string) ($payload['action'] ?? ''));
    $studentId = trim((string) ($payload['student_id'] ?? ''));
    if ($studentId === '') {
        sunshineStudentResetRespond(400, [
            'success' => false,
            'message' => 'Student ID is required.',
        ]);
    }

    $connection = sunshineDbConnect();
    sunshineEnsureStudentVerifiedEmailTable($connection);

    if ($action === 'request_code') {
        $lastRequest = (int) ($_SESSION['student_password_reset_last_request'] ?? 0);
        if ($lastRequest > time() - 60) {
            sunshineStudentResetRespond(429, [
                'success' => false,
                'message' => 'Please wait before requesting another code.',
            ]);
        }

        $_SESSION['student_password_reset_last_request'] = time();
        unset($_SESSION['student_password_reset']);

        $genericMessage = 'If this Student ID has a verified email address, a verification code has been sent.';
        $student = sunshineStudentResetFindStudent($connection, $studentId);
        $email = sunshineGetVerifiedStudentEmail($connection, $studentId);

        if ($student && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $code = (string) random_int(100000, 999999);
            $studentName = trim((string) ($student['student_name_en'] ?? $student['student_name_bn'] ?? 'Student'));
            $subject = 'Sunshine Education password reset code';
            $body = "Hello {$studentName},\n\nYour password reset code is: {$code}\n\nThis code expires in 10 minutes. If you did not request a password reset, you can ignore this email.\n\nSunshine Education";
            $mailFrom = str_replace(["\r", "\n"], '', (string) (getenv('SUNSHINE_MAIL_FROM') ?: 'sunshinebd2020@gmail.com'));
            if (!filter_var($mailFrom, FILTER_VALIDATE_EMAIL)) {
                $mailFrom = 'sunshinebd2020@gmail.com';
            }
            $headers = "From: Sunshine Education <{$mailFrom}>\r\n";
            $sent = @mail($email, $subject, $body, $headers);

            if ($sent) {
                $_SESSION['student_password_reset'] = [
                    'student_id' => $studentId,
                    'email' => strtolower($email),
                    'code_hash' => password_hash($code, PASSWORD_DEFAULT),
                    'expires_at' => time() + 600,
                    'attempts' => 0,
                ];
            }
        }

        sunshineStudentResetRespond(200, [
            'success' => true,
            'message' => $genericMessage,
        ]);
    }

    if ($action !== 'reset') {
        sunshineStudentResetRespond(400, [
            'success' => false,
            'message' => 'Invalid password reset action.',
        ]);
    }

    $challenge = $_SESSION['student_password_reset'] ?? null;
    if (
        !is_array($challenge) ||
        !hash_equals((string) ($challenge['student_id'] ?? ''), $studentId) ||
        (int) ($challenge['expires_at'] ?? 0) < time()
    ) {
        unset($_SESSION['student_password_reset']);
        sunshineStudentResetRespond(400, [
            'success' => false,
            'message' => 'The code is invalid or expired. Request a new code.',
        ]);
    }

    $code = trim((string) ($payload['code'] ?? ''));
    $challenge['attempts'] = (int) ($challenge['attempts'] ?? 0) + 1;
    $_SESSION['student_password_reset'] = $challenge;

    if (
        $challenge['attempts'] > 5 ||
        !preg_match('/^\d{6}$/', $code) ||
        !password_verify($code, (string) ($challenge['code_hash'] ?? ''))
    ) {
        if ($challenge['attempts'] >= 5) {
            unset($_SESSION['student_password_reset']);
        }
        sunshineStudentResetRespond(400, [
            'success' => false,
            'message' => 'The code is invalid or expired. Request a new code.',
        ]);
    }

    $newPassword = (string) ($payload['new_password'] ?? '');
    $confirmPassword = (string) ($payload['confirm_password'] ?? '');
    if (strlen($newPassword) < 8) {
        sunshineStudentResetRespond(400, [
            'success' => false,
            'message' => 'Password must be at least 8 characters long.',
        ]);
    }
    if ($newPassword !== $confirmPassword) {
        sunshineStudentResetRespond(400, [
            'success' => false,
            'message' => 'Passwords do not match.',
        ]);
    }

    $student = sunshineStudentResetFindStudent($connection, $studentId);
    $currentEmail = strtolower(sunshineGetVerifiedStudentEmail($connection, $studentId));
    if (!$student || !hash_equals((string) $challenge['email'], $currentEmail)) {
        unset($_SESSION['student_password_reset']);
        sunshineStudentResetRespond(400, [
            'success' => false,
            'message' => 'The code is invalid or expired. Request a new code.',
        ]);
    }

    $user = sunshineStudentResetFindUser($connection, $studentId);
    if (!$user) {
        sunshineStudentResetRespond(404, [
            'success' => false,
            'message' => 'Student login account was not found. Contact the school office.',
        ]);
    }

    $passwordField = '';
    foreach (['password_hash', 'password', 'pass', 'user_password'] as $candidate) {
        if (sunshineStudentResetHasColumn($connection, 'users', $candidate)) {
            $passwordField = $candidate;
            break;
        }
    }
    if ($passwordField === '') {
        sunshineStudentResetRespond(500, [
            'success' => false,
            'message' => 'Password reset is unavailable. Contact the school office.',
        ]);
    }

    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    if ($hashedPassword === false) {
        sunshineStudentResetRespond(500, [
            'success' => false,
            'message' => 'Password reset failed.',
        ]);
    }

    $updates = ["`{$passwordField}` = ?"];
    if (sunshineStudentResetHasColumn($connection, 'users', 'updated_at')) {
        $updates[] = 'updated_at = NOW()';
    }

    if (isset($user['id']) && sunshineStudentResetHasColumn($connection, 'users', 'id')) {
        $statement = $connection->prepare('UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ? LIMIT 1');
        $userId = (int) $user['id'];
        $statement->bind_param('si', $hashedPassword, $userId);
    } else {
        $conditions = [];
        foreach (['username', 'student_id'] as $column) {
            if (sunshineStudentResetHasColumn($connection, 'users', $column)) {
                $conditions[] = "`{$column}` = ?";
            }
        }
        if ($conditions === []) {
            sunshineStudentResetRespond(500, [
                'success' => false,
                'message' => 'Password reset is unavailable. Contact the school office.',
            ]);
        }

        $where = '(' . implode(' OR ', $conditions) . ')';
        $values = array_fill(0, count($conditions), $studentId);
        $types = 's' . str_repeat('s', count($values));
        if (sunshineStudentResetHasColumn($connection, 'users', 'role')) {
            $where .= " AND LOWER(TRIM(role)) = 'student'";
        }
        $statement = $connection->prepare('UPDATE users SET ' . implode(', ', $updates) . " WHERE {$where} LIMIT 1");
        $statement->bind_param($types, $hashedPassword, ...$values);
    }

    if (!$statement->execute()) {
        $statement->close();
        sunshineStudentResetRespond(500, [
            'success' => false,
            'message' => 'Password reset failed.',
        ]);
    }
    $statement->close();
    unset($_SESSION['student_password_reset']);

    sunshineStudentResetRespond(200, [
        'success' => true,
        'message' => 'Password reset successfully. You can now log in with your new password.',
    ]);
} catch (Throwable $exception) {
    sunshineStudentResetRespond(500, [
        'success' => false,
        'message' => 'Password reset service is temporarily unavailable.',
    ]);
}