<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

const STUDENT_DEFAULT_PASSWORD = '123456';

function studentNormalizeString($value): string
{
    return trim((string) ($value ?? ''));
}

function studentNormalizeStatus($value): string
{
    $status = strtolower(studentNormalizeString($value));

    $map = [
        'active' => 'active',
        'approved' => 'active',
        'enabled' => 'active',
        '1' => 'active',
        'yes' => 'active',
        'true' => 'active',
        'inactive' => 'inactive',
        'disabled' => 'inactive',
        'pending' => 'inactive',
        '0' => 'inactive',
        'no' => 'inactive',
        'false' => 'inactive',
        'deleted' => 'inactive',
    ];

    return $map[$status] ?? $status;
}

function studentEffectiveStatus(array $row, string $fallback = 'active'): string
{
    $value = studentFirstAvailableValue($row, ['status', 'student_status', 'is_active', 'active_status'], $fallback);
    return studentNormalizeStatus($value);
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

function studentFirstAvailableValue(array $row, array $keys, string $fallback = ''): string
{
    foreach ($keys as $key) {
        if (array_key_exists($key, $row) && $row[$key] !== null && $row[$key] !== '') {
            return (string) $row[$key];
        }
    }

    return $fallback;
}

function studentFindStudent(mysqli $connection, string $studentId): ?array
{
    if (studentHasColumn($connection, 'students', 'student_id')) {
        $statement = $connection->prepare('SELECT * FROM students WHERE student_id = ? LIMIT 1');
        $statement->bind_param('s', $studentId);
        $statement->execute();
        $result = $statement->get_result();
        $row = $result->fetch_assoc();
        $statement->close();

        if ($row) {
            return $row;
        }
    }

    if (studentHasColumn($connection, 'students', 'id')) {
        $statement = $connection->prepare('SELECT * FROM students WHERE id = ? LIMIT 1');
        $idValue = (int) $studentId;
        $statement->bind_param('i', $idValue);
        $statement->execute();
        $result = $statement->get_result();
        $row = $result->fetch_assoc();
        $statement->close();

        if ($row) {
            return $row;
        }
    }

    return null;
}

function studentUserLookupClauses(mysqli $connection): array
{
    $clauses = [];

    if (studentHasColumn($connection, 'users', 'username')) {
        $clauses[] = 'username = ?';
    }

    if (studentHasColumn($connection, 'users', 'student_id')) {
        $clauses[] = 'student_id = ?';
    }

    return $clauses;
}

function studentFindUser(mysqli $connection, string $studentId): ?array
{
    if (studentHasColumn($connection, 'users', 'username')) {
        $statement = $connection->prepare('SELECT * FROM users WHERE username = ? LIMIT 1');
        $statement->bind_param('s', $studentId);
        $statement->execute();
        $result = $statement->get_result();
        $row = $result->fetch_assoc();
        $statement->close();

        if ($row) {
            return $row;
        }
    }

    if (studentHasColumn($connection, 'users', 'student_id')) {
        $statement = $connection->prepare('SELECT * FROM users WHERE student_id = ? LIMIT 1');
        $statement->bind_param('s', $studentId);
        $statement->execute();
        $result = $statement->get_result();
        $row = $result->fetch_assoc();
        $statement->close();

        if ($row) {
            return $row;
        }
    }

    return null;
}

function studentUserPasswordField(mysqli $connection): string
{
    foreach (['password_hash', 'password', 'pass', 'user_password'] as $field) {
        if (studentHasColumn($connection, 'users', $field)) {
            return $field;
        }
    }

    return 'password';
}

function studentPasswordNeedsReset(array $userRow, string $passwordField, string $submittedPassword): bool
{
    $storedValue = studentNormalizeString($userRow[$passwordField] ?? '');

    if ($storedValue === '') {
        return true;
    }

    if (password_verify($submittedPassword, $storedValue)) {
        return false;
    }

    return $storedValue === $submittedPassword;
}

function studentSetUserPassword(mysqli $connection, string $studentId, string $hashedPassword): void
{
    $userRow = studentFindUser($connection, $studentId);
    $passwordField = studentUserPasswordField($connection);

    if (!$userRow) {
        return;
    }

    $updates = [];
    $types = '';
    $values = [];

    if (studentHasColumn($connection, 'users', $passwordField)) {
        $updates[] = '`' . $passwordField . '` = ?';
        $values[] = $hashedPassword;
        $types .= 's';
    }

    if (studentHasColumn($connection, 'users', 'updated_at')) {
        $updates[] = 'updated_at = NOW()';
    }

    if ($updates === []) {
        return;
    }

    $whereClauses = studentUserLookupClauses($connection);
    if ($whereClauses === []) {
        return;
    }

    $sql = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE ' . implode(' OR ', $whereClauses);
    $statement = $connection->prepare($sql);

    $bindValues = $values;
    foreach (array_fill(0, count($whereClauses), $studentId) as $value) {
        $bindValues[] = $value;
    }

    $statement->bind_param($types . str_repeat('s', count($whereClauses)), ...$bindValues);
    $statement->execute();
    $statement->close();
}

function studentEnsureUserAccount(mysqli $connection, array $studentRow, string $studentId): array
{
    $account = studentFindUser($connection, $studentId);
    $passwordField = studentUserPasswordField($connection);
    $generatedHash = password_hash(STUDENT_DEFAULT_PASSWORD, PASSWORD_DEFAULT);

    if (!$account) {
        $columns = [];
        $values = [];
        $types = '';

        if (studentHasColumn($connection, 'users', 'username')) {
            $columns[] = 'username';
            $values[] = $studentId;
            $types .= 's';
        }

        if (studentHasColumn($connection, 'users', 'student_id')) {
            $columns[] = 'student_id';
            $values[] = $studentId;
            $types .= 's';
        }

        if (studentHasColumn($connection, 'users', 'password') || studentHasColumn($connection, 'users', 'password_hash')) {
            $columns[] = $passwordField;
            $values[] = $generatedHash;
            $types .= 's';
        }

        if (studentHasColumn($connection, 'users', 'role')) {
            $columns[] = 'role';
            $values[] = 'student';
            $types .= 's';
        }

        if (studentHasColumn($connection, 'users', 'status')) {
            $columns[] = 'status';
            $values[] = 1;
            $types .= 'i';
        }

        if (studentHasColumn($connection, 'users', 'full_name')) {
            $columns[] = 'full_name';
            $values[] = studentFirstAvailableValue($studentRow, ['full_name', 'name', 'student_name', 'name_en', 'student_name_en', 'name_bn']);
            $types .= 's';
        }

        if (studentHasColumn($connection, 'users', 'created_at')) {
            $columns[] = 'created_at';
            $values[] = date('Y-m-d H:i:s');
            $types .= 's';
        }

        if ($columns === []) {
            return [];
        }

        $placeholders = implode(', ', array_fill(0, count($columns), '?'));
        $sql = 'INSERT INTO users (' . implode(', ', array_map(fn($column) => '`' . $column . '`', $columns)) . ') VALUES (' . $placeholders . ')';
        $statement = $connection->prepare($sql);
        $bind = array_merge([$types], $values);
        $statement->bind_param(...$bind);
        $statement->execute();
        $statement->close();

        $account = studentFindUser($connection, $studentId);
    }

    if ($account) {
        $updates = [];
        $types = '';
        $bindValues = [];

        if (studentHasColumn($connection, 'users', 'role')) {
            $currentRole = strtolower(studentNormalizeString($account['role'] ?? ''));
            if ($currentRole !== 'student') {
                $updates[] = 'role = ?';
                $bindValues[] = 'student';
                $types .= 's';
            }
        }

        if (studentHasColumn($connection, 'users', 'status')) {
            $currentStatus = strtolower(studentNormalizeString($account['status'] ?? ''));
            if ($currentStatus !== 'active') {
                $updates[] = 'status = ?';
                $bindValues[] = 1;
                $types .= 'i';
            }
        }

        if (studentHasColumn($connection, 'users', 'username') && studentNormalizeString($account['username'] ?? '') !== $studentId) {
            $updates[] = 'username = ?';
            $bindValues[] = $studentId;
            $types .= 's';
        }

        if (studentHasColumn($connection, 'users', 'student_id') && studentNormalizeString($account['student_id'] ?? '') !== $studentId) {
            $updates[] = 'student_id = ?';
            $bindValues[] = $studentId;
            $types .= 's';
        }

        if (studentHasColumn($connection, 'users', 'full_name')) {
            $fullName = studentFirstAvailableValue($studentRow, ['full_name', 'name', 'student_name', 'name_en', 'student_name_en', 'name_bn']);
            if ($fullName !== '' && studentNormalizeString($account['full_name'] ?? '') !== $fullName) {
                $updates[] = 'full_name = ?';
                $bindValues[] = $fullName;
                $types .= 's';
            }
        }

        if (studentHasColumn($connection, 'users', $passwordField)) {
            $storedPassword = studentNormalizeString($account[$passwordField] ?? '');
            if ($storedPassword === '' || !password_verify(STUDENT_DEFAULT_PASSWORD, $storedPassword)) {
                $updates[] = $passwordField . ' = ?';
                $bindValues[] = password_hash(STUDENT_DEFAULT_PASSWORD, PASSWORD_DEFAULT);
                $types .= 's';
            }
        }

        if ($updates !== []) {
            $whereClauses = studentUserLookupClauses($connection);
            if ($whereClauses !== []) {
                $sql = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE ' . implode(' OR ', $whereClauses);
                $statement = $connection->prepare($sql);
                $statement->bind_param($types . str_repeat('s', count($whereClauses)), ...array_merge($bindValues, array_fill(0, count($whereClauses), $studentId)));
                $statement->execute();
                $statement->close();
            }
        }

        $account = studentFindUser($connection, $studentId);
    }

    return $account ?? [];
}

function studentBuildResponse(mysqli $connection, array $studentRow, array $userRow): array
{
    $fullName = studentFirstAvailableValue($studentRow, ['student_name_en', 'full_name', 'name', 'student_name', 'name_en', 'name_bn', 'student_name_bn']);
    $phone = studentFirstAvailableValue($studentRow, ['student_mobile', 'mobile', 'phone', 'parents_mobile', 'home_mobile']);
    $email = studentFirstAvailableValue($studentRow, ['email', 'student_email']);
    $studentId = studentFirstAvailableValue($studentRow, ['student_id', 'id', 'studentcode'], (string) ($userRow['student_id'] ?? ''));
    $status = studentNormalizeStatus(studentFirstAvailableValue($studentRow, ['status', 'student_status', 'is_active', 'active_status'], 'active'));
    $userStudentId = studentFirstAvailableValue($userRow, ['student_id', 'username'], $studentId);

    $studentProfile = $studentRow;
    $studentProfile['id'] = $studentProfile['id'] ?? $studentId;
    $studentProfile['student_id'] = $studentId;
    $studentProfile['username'] = $studentId;
    $studentProfile['full_name'] = $fullName;
    $studentProfile['name'] = $fullName;
    $studentProfile['phone'] = $phone;
    $studentProfile['mobile'] = $phone;
    $studentProfile['email'] = $email;
    $studentProfile['status'] = $status;
    $studentProfile['role'] = 'student';

    return [
        'success' => true,
        'message' => 'Student login successful.',
        'student' => $studentProfile,
        'profile' => $studentProfile,
        'user' => [
            'id' => $userRow['id'] ?? null,
            'username' => $studentId,
            'student_id' => $userStudentId,
            'role' => 'student',
            'status' => $status,
        ],
    ];
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

    $jsonInput = json_decode(file_get_contents('php://input'), true);
    $payload = is_array($jsonInput) ? $jsonInput : [];

    $username = studentNormalizeString($payload['username'] ?? $payload['student_id'] ?? '');
    $submittedPassword = (string) ($payload['password'] ?? '');

    if ($username === '' || $submittedPassword === '') {
        sunshineRespondJson(400, [
            'success' => false,
            'message' => 'Student ID and password are required.',
        ]);
    }

    $connection = sunshineDbConnect();

    if (!studentHasColumn($connection, 'students', 'student_id') && !studentHasColumn($connection, 'students', 'id')) {
        sunshineRespondJson(500, [
            'success' => false,
            'message' => 'The students table is missing a student ID column.',
        ]);
    }

    $studentRow = studentFindStudent($connection, $username);

    if (!$studentRow) {
        sunshineRespondJson(401, [
            'success' => false,
            'message' => 'Student account not found.',
        ]);
    }

    $status = studentEffectiveStatus($studentRow, 'active');
    if ($status !== 'active') {
        sunshineRespondJson(403, [
            'success' => false,
            'message' => 'This student account is inactive and cannot log in.',
        ]);
    }

    $userRow = studentFindUser($connection, $username);

    $userRow = studentEnsureUserAccount($connection, $studentRow, $username);

    if ($userRow && studentHasColumn($connection, 'users', 'status')) {
        $userStatus = studentEffectiveStatus($userRow, 'active');
        if ($status !== 'active' && $userStatus !== 'active') {
            sunshineRespondJson(403, [
                'success' => false,
                'message' => 'This student account is inactive and cannot log in.',
            ]);
        }

        if ($status === 'active' && $userStatus !== 'active') {
            $updateSql = 'UPDATE users SET status = 1 WHERE username = ? OR student_id = ?';
            $statement = $connection->prepare($updateSql);
            $statement->bind_param('ss', $username, $username);
            $statement->execute();
            $statement->close();
            $userRow = studentFindUser($connection, $username);
        }
    }

    if (!$userRow) {
        sunshineRespondJson(500, [
            'success' => false,
            'message' => 'Student account could not be initialized.',
        ]);
    }

    $passwordField = studentUserPasswordField($connection);
    $storedPassword = studentNormalizeString($userRow[$passwordField] ?? '');
    $isAllowed = false;

    if ($storedPassword !== '') {
        if (password_verify($submittedPassword, $storedPassword)) {
            $isAllowed = true;
        } elseif ($storedPassword === $submittedPassword) {
            $isAllowed = true;
        }
    }

    if (!$isAllowed && $submittedPassword === STUDENT_DEFAULT_PASSWORD) {
        $isAllowed = true;
    }

    if (!$isAllowed) {
        sunshineRespondJson(401, [
            'success' => false,
            'message' => 'Invalid password. Default password is 123456.',
        ]);
    }

    $needsPasswordHashMigration = $storedPassword === '' || (
        $storedPassword !== '' &&
        !password_verify($submittedPassword, $storedPassword) &&
        $storedPassword === $submittedPassword
    );

    if ($needsPasswordHashMigration) {
        $hash = password_hash($submittedPassword, PASSWORD_DEFAULT);
        studentSetUserPassword($connection, $username, $hash);
    }

    if (studentHasColumn($connection, 'users', 'status')) {
        $whereClauses = studentUserLookupClauses($connection);
        if ($whereClauses !== []) {
            $escapedUsername = $connection->real_escape_string($username);
            $whereSql = implode(' OR ', array_map(static fn ($clause) => str_replace('?', '"' . $escapedUsername . '"', $clause), $whereClauses));
            $connection->query('UPDATE users SET status = 1 WHERE ' . $whereSql);
        }
    }

    $updatedUser = studentFindUser($connection, $username);
    if ($updatedUser) {
        $userRow = $updatedUser;
    }

    $response = studentBuildResponse($connection, $studentRow, $userRow);

    session_regenerate_id(true);
    $_SESSION['logged_in'] = true;
    $_SESSION['role'] = 'student';
    $_SESSION['username'] = $response['student']['student_id'] ?? $username;
    $_SESSION['student_id'] = $response['student']['student_id'] ?? $username;
    $_SESSION['user_id'] = $response['user']['id'] ?? null;
    $_SESSION['full_name'] = $response['student']['full_name'] ?? $response['student']['student_name_en'] ?? $username;

    sunshineRespondJson(200, $response);
} catch (Throwable $exception) {
    sunshineRespondJson(500, [
        'success' => false,
        'message' => 'Student login failed: ' . $exception->getMessage(),
    ]);
}
