<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = '127.0.0.1';
$db   = 'domestic_re';
$user = 'domestic_re_app';
$pass = '869672fe011b04df53c40c9a451041d6f838';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::ATTR_TIMEOUT            => 5, // Timeout after 5 seconds
];

try {
     echo "Connecting to MySQL...\n";
     $pdo = new PDO($dsn, $user, $pass, $options);
     echo "Connection successful!\n";
     $stmt = $pdo->query('SHOW TABLES');
     echo "Tables in database:\n";
     while ($row = $stmt->fetch()) {
         echo "- " . reset($row) . "\n";
     }
} catch (\PDOException $e) {
     echo "Connection failed: " . $e->getMessage() . "\n";
}
