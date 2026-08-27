<?php

declare(strict_types=1);

function sunshineDbConfig(): array
{
    $hosts = [
        getenv('DB_HOST'),
        getenv('MYSQL_HOST'),
        'localhost',
    ];

    $databaseNames = [
        getenv('DB_NAME'),
        getenv('MYSQL_DATABASE'),
        'sunshine_education',
    ];

    $users = [
        getenv('DB_USER'),
        getenv('MYSQL_USER'),
        'root',
    ];

    $passwords = [
        getenv('DB_PASS'),
        getenv('MYSQL_PASSWORD'),
        '',
    ];

    return [
        'host' => sunshineFirstNonEmpty($hosts, 'localhost'),
        'port' => (int) (getenv('DB_PORT') ?: getenv('MYSQL_PORT') ?: 3306),
        'database' => sunshineFirstNonEmpty($databaseNames, 'sunshine_education'),
        'username' => sunshineFirstNonEmpty($users, 'root'),
        'password' => sunshineFirstNonEmpty($passwords, ''),
    ];
}

function sunshineDbConnect(): mysqli
{
    $config = sunshineDbConfig();

    $connection = new mysqli(
        $config['host'],
        $config['username'],
        $config['password'],
        $config['database'],
        $config['port']
    );

    if ($connection->connect_errno) {
        throw new RuntimeException('Database connection failed: ' . $connection->connect_error);
    }

    $connection->set_charset('utf8mb4');

    return $connection;
}

function sunshineRespondJson(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

function sunshineFirstNonEmpty(array $values, string $fallback = ''): string
{
    foreach ($values as $value) {
        if (is_string($value) && trim($value) !== '') {
            return trim($value);
        }

        if (is_numeric($value)) {
            return (string) $value;
        }
    }

    return $fallback;
}
