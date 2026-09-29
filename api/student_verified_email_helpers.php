<?php

declare(strict_types=1);

function sunshineEnsureStudentVerifiedEmailTable(mysqli $connection): void
{
    $created = $connection->query(
        "CREATE TABLE IF NOT EXISTS student_verified_emails (
            student_id VARCHAR(191) NOT NULL PRIMARY KEY,
            email VARCHAR(254) NOT NULL,
            verified_at DATETIME NOT NULL,
            INDEX student_verified_emails_email_idx (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    if ($created === false) {
        throw new RuntimeException('Verified student email storage is unavailable.');
    }
}

function sunshineGetVerifiedStudentEmail(mysqli $connection, string $studentId): string
{
    $statement = $connection->prepare(
        'SELECT email FROM student_verified_emails WHERE student_id = ? LIMIT 1'
    );
    $statement->bind_param('s', $studentId);
    $statement->execute();
    $row = $statement->get_result()->fetch_assoc();
    $statement->close();

    return trim((string) ($row['email'] ?? ''));
}

function sunshineSaveVerifiedStudentEmail(mysqli $connection, string $studentId, string $email): void
{
    $statement = $connection->prepare(
        'INSERT INTO student_verified_emails (student_id, email, verified_at)
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE email = VALUES(email), verified_at = NOW()'
    );
    $statement->bind_param('ss', $studentId, $email);
    if (!$statement->execute()) {
        $statement->close();
        throw new RuntimeException('Verified email could not be saved.');
    }
    $statement->close();
}

function sunshineAttachStudentEmailVerification(mysqli $connection, array $student, string $studentId): array
{
    $verifiedEmail = sunshineGetVerifiedStudentEmail($connection, $studentId);
    $student['email_verified'] = $verifiedEmail !== '';

    if ($verifiedEmail !== '') {
        $student['email'] = $verifiedEmail;
    }

    return $student;
}