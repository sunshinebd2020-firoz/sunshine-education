<?php
$conn = new mysqli('localhost', 'root', '', 'sunshine_education');
if ($conn->connect_errno) {
    echo "DB_ERR: " . $conn->connect_error . PHP_EOL;
    exit(1);
}

$result = $conn->query("SELECT id, username, password, teacher_id, role FROM admins ORDER BY id");
$candidates = [
  'Admin@123', 'admin@123', 'Admin123', 'admin123',
  'Sunshine@123', 'sunshine@123', 'Sunshine123', 'sunshine123',
  'Teacher@123', 'teacher@123', 'Teacher123', 'teacher123',
  'Asaduzzaman@123', 'asaduzzaman@123', 'Sabbir@123', 'sabbir@123',
  'Abdul@123', 'abdul@123', 'Tushar@123', 'tushar@123',
  'Muhaimine@123', 'muhaimine@123', 'Firoz@123', 'firoz@123',
  'Password@123', 'Password123', 'Welcome@123', 'welcome@123',
  '123456', '12345678', 'qwerty', 'admin', 'teacher',
  'sunshine', 'Sunshine', 'sunshine123', 'Sunshine1234',
  'Tushar123', 'tushar123', 'Asaduzzaman123', 'asaduzzaman123',
  'Sabbir123', 'sabbir123', 'Muhaimine123', 'muhaimine123',
  'Firoz123', 'firoz123', 'Abdul123', 'abdul123'
];

while ($row = $result->fetch_assoc()) {
    echo "USER: {$row['username']} / role={$row['role']} / teacher_id={$row['teacher_id']}" . PHP_EOL;
    $matched = [];
    foreach ($candidates as $candidate) {
        if (password_verify($candidate, $row['password'])) {
            $matched[] = $candidate;
        }
    }
    if ($matched) {
        echo "  MATCH: " . implode(', ', $matched) . PHP_EOL;
    } else {
        echo "  NO_MATCH" . PHP_EOL;
    }
}

$conn->close();
