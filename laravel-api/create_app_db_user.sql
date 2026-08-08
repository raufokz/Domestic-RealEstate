-- Run once against your local MySQL to create a least-privilege app user
-- (root stays untouched). Matches laravel-api/.env DB_USERNAME/DB_PASSWORD.
-- Safe to delete this file after running it.

CREATE USER IF NOT EXISTS 'domestic_re_app'@'localhost' IDENTIFIED BY '869672fe011b04df53c40c9a451041d6f838';
GRANT ALL PRIVILEGES ON domestic_re.* TO 'domestic_re_app'@'localhost';
FLUSH PRIVILEGES;
