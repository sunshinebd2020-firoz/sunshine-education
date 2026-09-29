<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/student_verified_email_helpers.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://sunshine.test',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5176',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5176',
];
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

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    sunshineRespondJson(405, ['success' => false, 'message' => 'Only POST requests are allowed.']);
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

$sessionStudentId = trim((string) ($_SESSION['student_id'] ?? $_SESSION['username'] ?? ''));
if (
    empty($_SESSION['logged_in']) ||
    strtolower((string) ($_SESSION['role'] ?? '')) !== 'student' ||
    $sessionStudentId === ''
) {
    sunshineRespondJson(401, ['success' => false, 'message' => 'Student session is required.']);
}

$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) {
    sunshineRespondJson(400, ['success' => false, 'message' => 'Invalid request.']);
}

$action = trim((string) ($payload['action'] ?? ''));
$email = strtolower(trim((string) ($payload['email'] ?? '')));

try {
    $connection = sunshineDbConnect();
    sunshineEnsureStudentVerifiedEmailTable($connection);

    if ($action === 'request_code') {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
            sunshineRespondJson(400, ['success' => false, 'message' => 'Enter a valid email address.']);
        }

        $lastRequest = (int) ($_SESSION['student_email_verification_last_request'] ?? 0);
        if ($lastRequest > time() - 60) {
            sunshineRespondJson(429, ['success' => false, 'message' => 'Please wait before requesting another code.']);
        }
        $_SESSION['student_email_verification_last_request'] = time();

        $code = (string) random_int(100000, 999999);
        $studentName = 'Student';
        if (studentEmailVerificationHasColumn($connection, 'students', 'student_id')) {
            $statement = $connection->prepare('SELECT * FROM students WHERE student_id = ? LIMIT 1');
            $statement->bind_param('s', $sessionStudentId);
            $statement->execute();
            $student = $statement->get_result()->fetch_assoc();
            $statement->close();
            if (!$student) {
                sunshineRespondJson(404, ['success' => false, 'message' => 'Student profile was not found.']);
            }
            $studentName = trim((string) ($student['student_name_en'] ?? $student['student_name_bn'] ?? 'Student')) ?: 'Student';
        } else {
            sunshineRespondJson(500, ['success' => false, 'message' => 'Student ID field is unavailable.']);
        }

        $mailFrom = str_replace(["\r", "\n"], '', (string) (getenv('SUNSHINE_MAIL_FROM') ?: 'sunshinebd2020@gmail.com'));
        if (!filter_var($mailFrom, FILTER_VALIDATE_EMAIL)) {
            $mailFrom = 'sunshinebd2020@gmail.com';
        }
        $subject = 'Sunshine Education email verification code';
        $body = "Hello {$studentName},\n\nYour email verification code is: {$code}\n\nThis code expires in 10 minutes. If you did not request this code, you can ignore this email.\n\nSunshine Education";
        $headers = "From: Sunshine Education <{$mailFrom}>\r\n";

        unset($_SESSION['student_email_verification']);
        if (!@mail($email, $subject, $body, $headers)) {
            sunshineRespondJson(503, ['success' => false, 'message' => 'The verification email could not be sent. Please try again later.']);
        }

        $_SESSION['student_email_verification'] = [
            'student_id' => $sessionStudentId,
            'email' => $email,
            'code_hash' => password_hash($code, PASSWORD_DEFAULT),
            'expires_at' => time() + 600,
            'attempts' => 0,
        ];

        sunshineRespondJson(200, ['success' => true, 'message' => 'A verification code has been sent to the email address you entered.']);
    }

    if ($action !== 'verify_code') {
        sunshineRespondJson(400, ['success' => false, 'message' => 'Invalid email verification action.']);
    }

    $challenge = $_SESSION['student_email_verification'] ?? null;
    if (
        !is_array($challenge) ||
        !hash_equals((string) ($challenge['student_id'] ?? ''), $sessionStudentId) ||
        !hash_equals((string) ($challenge['email'] ?? ''), $email) ||
        (int) ($challenge['expires_at'] ?? 0) < time()
    ) {
        unset($_SESSION['student_email_verification']);
        sunshineRespondJson(400, ['success' => false, 'message' => 'The code is invalid or expired. Request a new code.']);
    }

    $code = trim((string) ($payload['code'] ?? ''));
    $challenge['attempts'] = (int) ($challenge['attempts'] ?? 0) + 1;
    $_SESSION['student_email_verification'] = $challenge;
    if (
        $challenge['attempts'] > 5 ||
        !preg_match('/^\d{6}$/', $code) ||
        !password_verify($code, (string) ($challenge['code_hash'] ?? ''))
    ) {
        if ($challenge['attempts'] >= 5) {
            unset($_SESSION['student_email_verification']);
        }
        sunshineRespondJson(400, ['success' => false, 'message' => 'The code is invalid or expired. Request a new code.']);
    }

    if (!studentEmailVerificationHasColumn($connection, 'students', 'student_id')) {
        sunshineRespondJson(500, ['success' => false, 'message' => 'Student ID field is unavailable.']);
    }

    $statement = $connection->prepare('SELECT id FROM students WHERE student_id = ? LIMIT 1');
    $statement->bind_param('s', $sessionStudentId);
    $statement->execute();
    $student = $statement->get_result()->fetch_assoc();
    $statement->close();
    if (!$student) {
        unset($_SESSION['student_email_verification']);
        sunshineRespondJson(404, ['success' => false, 'message' => 'Student profile was not found.']);
    }

    $connection->begin_transaction();
    sunshineSaveVerifiedStudentEmail($connection, $sessionStudentId, $email);

    $emailColumns = [];
    foreach (['email', 'student_email'] as $column) {
        if (studentEmailVerificationHasColumn($connection, 'students', $column)) {
            $emailColumns[] = "`{$column}` = ?";
        }
    }
    if ($emailColumns !== []) {
        $whereColumn = studentEmailVerificationHasColumn($connection, 'students', 'student_id')
            ? 'student_id'
            : 'id';
        $whereValue = $whereColumn === 'student_id'
            ? $sessionStudentId
            : (string) ($student['id'] ?? '');
        $statement = $connection->prepare(
            'UPDATE students SET ' . implode(', ', $emailColumns) . " WHERE `{$whereColumn}` = ? LIMIT 1"
        );
        $values = array_fill(0, count($emailColumns), $email);
        $values[] = $whereValue;
        $statement->bind_param(str_repeat('s', count($values)), ...$values);
        if (!$statement->execute()) {
            $statement->close();
            throw new RuntimeException('Student email could not be updated.');
        }
        $statement->close();
    }

    $connection->commit();
    unset($_SESSION['student_email_verification']);
    sunshineRespondJson(200, [
        'success' => true,
        'message' => 'Email verified successfully.',
        'email' => $email,
        'email_verified' => true,
    ]);
} catch (Throwable $exception) {
    if (isset($connection) && $connection instanceof mysqli) {
        try {
            $connection->rollback();
        } catch (Throwable $ignored) {
        }
    }
    sunshineRespondJson(500, ['success' => false, 'message' => 'Email verification is temporarily unavailable.']);
}

function studentEmailVerificationHasColumn(mysqli $connection, string $table, string $column): bool
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