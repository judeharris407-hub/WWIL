-- ==============================================================================
-- TransGlobe-Logistics Enterprise PostgreSQL Seed Data
-- ==============================================================================

-- 1. Insert Initial Authorized Corporate Administrator
-- Email: transglobel9@gmail.com
-- Password: Kenfack123@ (bcrypt hash cost 10)
DELETE FROM admins WHERE email = 'admin@wwil-logistics.com' OR email = 'admin@transglobe-logistics.com';

INSERT INTO admins (email, password_hash)
VALUES (
    'transglobel9@gmail.com',
    '$2b$10$rd04dYwA6baFuKl6KOpkY.XJjCcAZ7ZnqtaxVzP7wbnBxbDynnbfG'
)
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash;
