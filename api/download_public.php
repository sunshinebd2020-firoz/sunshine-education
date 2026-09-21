<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

try {
    $connection = sunshineDbConnect();

    $statement = $connection->prepare(
        'SELECT DISTINCT
            downloads.id,
            downloads.title,
            downloads.description,
            downloads.file_name,
            CASE
                WHEN downloads.url IS NOT NULL AND downloads.url <> ""
                    THEN downloads.url
                WHEN downloads.file_name IS NOT NULL AND downloads.file_name <> ""
                    THEN CONCAT("/uploads/", downloads.file_name)
                ELSE NULL
            END AS file_url,
            courses.id AS course_id,
            courses.course_name,
            courses.language
        FROM downloads
        LEFT JOIN download_courses
            ON download_courses.download_id = downloads.id
        INNER JOIN courses
            ON courses.id = COALESCE(download_courses.course_id, downloads.course_id)
        WHERE courses.status = "Active"
        ORDER BY courses.language, courses.course_name, downloads.created_at DESC, downloads.id DESC'
    );

    $statement->execute();
    $result = $statement->get_result();
    $downloads = [];

    while ($download = $result->fetch_assoc()) {
        $downloads[] = $download;
    }

    sunshineRespondJson(200, [
        'success' => true,
        'data' => $downloads,
    ]);
} catch (Throwable $exception) {
    error_log('Public download list error: ' . $exception->getMessage());

    sunshineRespondJson(500, [
        'success' => false,
        'message' => 'Download data could not be loaded.',
    ]);
}