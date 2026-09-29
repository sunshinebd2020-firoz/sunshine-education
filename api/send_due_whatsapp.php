<?php

declare(strict_types=1);

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

function sendDueWhatsAppJson(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sendDueWhatsAppNormalizeNumber(string $phone): string
{
    $digits = preg_replace('/\D+/', '', $phone);
    if ($digits === '') {
        return '';
    }
    if (str_starts_with($digits, '00')) {
        $digits = substr($digits, 2);
    }
    if (str_starts_with($digits, '88')) {
        return $digits;
    }
    if (str_starts_with($digits, '0')) {
        return '88' . $digits;
    }
    if (strlen($digits) === 10) {
        return '880' . $digits;
    }
    return $digits;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    sendDueWhatsAppJson(405, ['success' => false, 'message' => 'Only POST requests are allowed.']);
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

$sessionAdminId = (int) ($_SESSION['admin_id'] ?? 0);
$sessionRole = strtolower(trim((string) ($_SESSION['role'] ?? '')));
$isAdmin = in_array($sessionRole, ['admin', 'administrator', 'super admin', 'superadmin'], true);
$sessionTeacherId = trim((string) ($_SESSION['teacher_id'] ?? ''));

if (empty($_SESSION['logged_in']) || $sessionAdminId <= 0) {
    sendDueWhatsAppJson(401, ['success' => false, 'message' => 'Login session is required.']);
}

$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) {
    sendDueWhatsAppJson(400, ['success' => false, 'message' => 'Invalid request.']);
}

$studentId = trim((string) ($payload['student_id'] ?? ''));
if ($studentId === '') {
    sendDueWhatsAppJson(400, ['success' => false, 'message' => 'Student ID is required.']);
}

$phoneNumberId = trim((string) getenv('WHATSAPP_PHONE_NUMBER_ID'));
$accessToken = trim((string) getenv('WHATSAPP_ACCESS_TOKEN'));
$senderNumber = sendDueWhatsAppNormalizeNumber(trim((string) getenv('WHATSAPP_SENDER_NUMBER')));
$templateName = trim((string) getenv('WHATSAPP_DUE_TEMPLATE'));
$templateLanguage = trim((string) (getenv('WHATSAPP_DUE_TEMPLATE_LANGUAGE') ?: 'en_US'));
$apiVersion = trim((string) (getenv('WHATSAPP_GRAPH_API_VERSION') ?: 'v22.0'));

if (
    $phoneNumberId === '' ||
    !ctype_digit($phoneNumberId) ||
    $accessToken === '' ||
    $senderNumber !== '8801540019837' ||
    !preg_match('/^[a-zA-Z0-9_]+$/', $templateName) ||
    !preg_match('/^[a-zA-Z_]+$/', $templateLanguage) ||
    !preg_match('/^v\d+\.0$/', $apiVersion)
) {
    sendDueWhatsAppJson(503, [
        'success' => false,
        'message' => 'Direct WhatsApp sending is not configured. Contact the system administrator.',
    ]);
}

if (!function_exists('curl_init')) {
    sendDueWhatsAppJson(503, ['success' => false, 'message' => 'WhatsApp sending is unavailable on this server.']);
}

try {
    require_once __DIR__ . '/../config/db.php';
    require_once __DIR__ . '/../config/access_scope.php';

    $branchScope = getAccessScope($conn, $sessionAdminId);
    $userBranch = '';

    if (!$isAdmin) {
        if ($sessionTeacherId === '') {
            sendDueWhatsAppJson(403, ['success' => false, 'message' => 'Your account cannot send due reminders.']);
        }

        $branchStatement = $conn->prepare('SELECT branch FROM teachers WHERE teacher_id = ? LIMIT 1');
        $branchStatement->bind_param('s', $sessionTeacherId);
        $branchStatement->execute();
        $branchRow = $branchStatement->get_result()->fetch_assoc();
        $branchStatement->close();
        $userBranch = trim((string) ($branchRow['branch'] ?? ''));

        if ($userBranch === '') {
            sendDueWhatsAppJson(403, ['success' => false, 'message' => 'Your account is not assigned to a branch.']);
        }
    }

    $studentStatement = $conn->prepare(
        'SELECT id, student_id, student_name_en, student_name_bn, student_mobile, branch, course_fee
         FROM students
         WHERE student_id = ?
         LIMIT 1'
    );
    $studentStatement->bind_param('s', $studentId);
    $studentStatement->execute();
    $student = $studentStatement->get_result()->fetch_assoc();
    $studentStatement->close();

    if (!$student) {
        sendDueWhatsAppJson(404, ['success' => false, 'message' => 'Student was not found.']);
    }

    if (!$isAdmin && $branchScope !== 'all' && strcasecmp(trim((string) $student['branch']), $userBranch) !== 0) {
        sendDueWhatsAppJson(403, ['success' => false, 'message' => 'You can only send reminders to students in your branch.']);
    }

    $paidStatement = $conn->prepare(
        "SELECT COALESCE(SUM(amount), 0) AS paid
         FROM income
         WHERE student_id = ? AND LOWER(TRIM(income_type)) = 'course fee'"
    );
    $paidStatement->bind_param('s', $studentId);
    $paidStatement->execute();
    $paid = (float) ($paidStatement->get_result()->fetch_assoc()['paid'] ?? 0);
    $paidStatement->close();

    $dueAmount = max(0, (float) ($student['course_fee'] ?? 0) - $paid);
    if ($dueAmount < 0.01) {
        sendDueWhatsAppJson(409, ['success' => false, 'message' => 'This student has no outstanding course fee.']);
    }

    $recipient = sendDueWhatsAppNormalizeNumber((string) ($student['student_mobile'] ?? ''));
    if ($recipient === '' || strlen($recipient) < 11 || strlen($recipient) > 15) {
        sendDueWhatsAppJson(400, ['success' => false, 'message' => 'A valid student mobile number is not available.']);
    }

    $lastSend = $_SESSION['due_whatsapp_last_send'] ?? [];
    if (
        is_array($lastSend) &&
        ($lastSend['student_id'] ?? '') === $studentId &&
        (int) ($lastSend['sent_at'] ?? 0) > time() - 15
    ) {
        sendDueWhatsAppJson(429, ['success' => false, 'message' => 'Please wait before sending another reminder to this student.']);
    }

    $studentName = trim((string) ($student['student_name_en'] ?? $student['student_name_bn'] ?? 'Student')) ?: 'Student';
    $hotline = trim((string) ($payload['hotline'] ?? '')) ?: 'Sunshine Education';
    $messagePayload = [
        'messaging_product' => 'whatsapp',
        'recipient_type' => 'individual',
        'to' => $recipient,
        'type' => 'template',
        'template' => [
            'name' => $templateName,
            'language' => ['code' => $templateLanguage],
            'components' => [[
                'type' => 'body',
                'parameters' => [
                    ['type' => 'text', 'text' => $studentName],
                    ['type' => 'text', 'text' => number_format($dueAmount, 2, '.', ',')],
                    ['type' => 'text', 'text' => $studentId],
                    ['type' => 'text', 'text' => $hotline],
                ],
            ]],
        ],
    ];

    $curl = curl_init("https://graph.facebook.com/{$apiVersion}/{$phoneNumberId}/messages");
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($messagePayload, JSON_UNESCAPED_UNICODE),
    ]);

    $responseBody = curl_exec($curl);
    $curlError = curl_error($curl);
    $statusCode = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if ($responseBody === false || $statusCode < 200 || $statusCode >= 300) {
        error_log('Due WhatsApp send failed (' . $statusCode . '): ' . ($curlError ?: (string) $responseBody));
        sendDueWhatsAppJson(502, [
            'success' => false,
            'message' => 'WhatsApp could not send this reminder. Check the approved template and server configuration.',
        ]);
    }

    $_SESSION['due_whatsapp_last_send'] = [
        'student_id' => $studentId,
        'sent_at' => time(),
    ];

    sendDueWhatsAppJson(200, [
        'success' => true,
        'message' => 'WhatsApp reminder sent successfully.',
    ]);
} catch (Throwable $exception) {
    error_log('Due WhatsApp endpoint error: ' . $exception->getMessage());
    sendDueWhatsAppJson(500, ['success' => false, 'message' => 'WhatsApp reminder could not be sent.']);
}