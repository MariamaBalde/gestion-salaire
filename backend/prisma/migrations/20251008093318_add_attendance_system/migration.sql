-- AlterTable
ALTER TABLE `Attendance` ADD COLUMN `approvalStatus` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CORRECTED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedById` INTEGER NULL,
    ADD COLUMN `breakEndTime` DATETIME(3) NULL,
    ADD COLUMN `breakHours` DOUBLE NULL,
    ADD COLUMN `breakStartTime` DATETIME(3) NULL,
    ADD COLUMN `justification` VARCHAR(191) NULL,
    ADD COLUMN `overtimeHours` DOUBLE NULL;

-- CreateTable
CREATE TABLE `DaySummary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `payRunId` INTEGER NULL,
    `date` DATETIME(3) NOT NULL,
    `totalHours` DOUBLE NOT NULL DEFAULT 0,
    `regularHours` DOUBLE NOT NULL DEFAULT 0,
    `overtimeHours` DOUBLE NOT NULL DEFAULT 0,
    `breakHours` DOUBLE NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'APPROVED', 'LOCKED') NOT NULL DEFAULT 'PENDING',
    `locked` BOOLEAN NOT NULL DEFAULT false,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DaySummary_employee_date`(`employeeId`, `date`),
    INDEX `DaySummary_payRun`(`payRunId`),
    UNIQUE INDEX `DaySummary_employee_date_unique`(`employeeId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttendanceAudit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attendanceId` INTEGER NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `oldValues` VARCHAR(191) NULL,
    `newValues` VARCHAR(191) NULL,
    `justification` VARCHAR(191) NULL,
    `performedById` INTEGER NOT NULL,
    `performedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AttendanceAudit_attendance`(`attendanceId`),
    INDEX `AttendanceAudit_performed_by`(`performedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Attendance_approval_status` ON `Attendance`(`approvalStatus`);

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `Utilisateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DaySummary` ADD CONSTRAINT `DaySummary_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DaySummary` ADD CONSTRAINT `DaySummary_payRunId_fkey` FOREIGN KEY (`payRunId`) REFERENCES `PayRun`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceAudit` ADD CONSTRAINT `AttendanceAudit_attendanceId_fkey` FOREIGN KEY (`attendanceId`) REFERENCES `Attendance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceAudit` ADD CONSTRAINT `AttendanceAudit_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
