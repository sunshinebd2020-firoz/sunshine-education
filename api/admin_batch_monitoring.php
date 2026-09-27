<?php

/*
|--------------------------------------------------------------------------
| NOTE
|--------------------------------------------------------------------------
| Mirrors the real deployed backend at
| C:/xampp/htdocs/sunshine-api/api/admin_batch_monitoring.php
| (schema confirmed from api/teacher_classroom.php on that server).
*/

require_once __DIR__ . '/../config/auth.php';

send_api_cors_headers();
handle_api_preflight();

require_admin();

require_once __DIR__ . '/../config/db.php';

if (!isset($conn) || !($conn instanceof mysqli)) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

$conn->set_charset("utf8mb4");

function response_json(bool $success, string $message = "", array $data = [], int $status = 200): void
{
    http_response_code($status);

    echo json_encode(
        array_merge(["success" => $success, "message" => $message], $data),
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

function fetch_all(mysqli $conn, string $sql): array
{
    $rows = [];

    $result = $conn->query($sql);

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }

        $result->free();
    }

    return $rows;
}

if (($_SERVER["REQUEST_METHOD"] ?? "GET") !== "GET") {
    response_json(false, "Only GET requests are allowed.", [], 405);
}

/*
|--------------------------------------------------------------------------
| TEACHERS
|--------------------------------------------------------------------------
*/

$teachers = fetch_all($conn, "
    SELECT
        teacher_id,
        name_bn,
        name_en,
        short_name,
        designation,
        course,
        branch,
        mobile,
        status
    FROM teachers
    ORDER BY name_en ASC
");

/*
|--------------------------------------------------------------------------
| BATCHES (with owning teacher + roster / session counters)
|--------------------------------------------------------------------------
*/

$batches = fetch_all($conn, "
    SELECT
        b.id,
        b.teacher_id,
        b.name,
        b.course,
        b.language_level,
        b.schedule_days,
        b.start_time,
        b.end_time,
        b.room,
        b.status,
        b.created_at,
        b.updated_at,

        t.name_en AS teacher_name_en,
        t.name_bn AS teacher_name_bn,
        t.status AS teacher_status,

        (SELECT COUNT(*) FROM batch_students bs WHERE bs.batch_id = b.id) AS student_count,
        (SELECT COUNT(*) FROM class_sessions cs WHERE cs.batch_id = b.id) AS session_count,
        (SELECT MAX(cs.class_date) FROM class_sessions cs WHERE cs.batch_id = b.id) AS last_class_date

    FROM batches b
    LEFT JOIN teachers t ON t.teacher_id = b.teacher_id
    ORDER BY b.id DESC
");

/*
|--------------------------------------------------------------------------
| BATCH STUDENTS (roster)
|--------------------------------------------------------------------------
*/

$batchStudents = fetch_all($conn, "
    SELECT
        bs.id,
        bs.batch_id,
        bs.student_id,

        s.student_id AS student_code,
        s.student_name_en,
        s.student_name_bn,
        s.student_mobile

    FROM batch_students bs
    INNER JOIN students s ON s.id = bs.student_id
    ORDER BY bs.batch_id DESC, s.student_name_en ASC
");

/*
|--------------------------------------------------------------------------
| CLASS SESSIONS (records)
|--------------------------------------------------------------------------
*/

$sessions = fetch_all($conn, "
    SELECT
        cs.id,
        cs.teacher_id,
        cs.batch_id,
        cs.class_date,
        cs.start_time,
        cs.end_time,
        cs.topic,
        cs.notes
    FROM class_sessions cs
    ORDER BY cs.class_date DESC, cs.id DESC
");

/*
|--------------------------------------------------------------------------
| ATTENDANCE
|--------------------------------------------------------------------------
*/

$attendance = fetch_all($conn, "
    SELECT
        ca.id,
        ca.class_session_id,
        ca.student_id,
        ca.attendance_status,

        cs.batch_id,
        cs.class_date

    FROM class_attendance ca
    INNER JOIN class_sessions cs ON cs.id = ca.class_session_id
");

response_json(true, "", [
    "teachers" => $teachers,
    "batches" => $batches,
    "batch_students" => $batchStudents,
    "sessions" => $sessions,
    "attendance" => $attendance,
]);
