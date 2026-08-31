ALTER TABLE `User` ADD COLUMN `googleAccessToken` TEXT NULL,
    ADD COLUMN `googleRefreshToken` TEXT NULL,
    ADD COLUMN `googleTokenExpiry` DATETIME(3) NULL;