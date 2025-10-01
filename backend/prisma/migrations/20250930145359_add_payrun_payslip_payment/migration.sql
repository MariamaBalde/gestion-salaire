-- CreateTable
CREATE TABLE `PayRun` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entrepriseId` INTEGER NOT NULL,
    `type` ENUM('MENSUELLE', 'HEBDOMADAIRE', 'JOURNALIERE') NOT NULL,
    `dateDebut` DATETIME(3) NOT NULL,
    `dateFin` DATETIME(3) NOT NULL,
    `status` ENUM('BROUILLON', 'APPROUVE', 'CLOTURE') NOT NULL DEFAULT 'BROUILLON',
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PayRun_entrepriseId_fkey`(`entrepriseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payslip` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payRunId` INTEGER NOT NULL,
    `employeeId` INTEGER NOT NULL,
    `brut` DOUBLE NOT NULL,
    `deductions` DOUBLE NOT NULL DEFAULT 0,
    `net` DOUBLE NOT NULL,
    `status` ENUM('PAYE', 'PARTIEL', 'ATTENTE') NOT NULL DEFAULT 'ATTENTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Payslip_payRunId_fkey`(`payRunId`),
    INDEX `Payslip_employeeId_fkey`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payslipId` INTEGER NOT NULL,
    `montant` DOUBLE NOT NULL,
    `modePaiement` ENUM('ESPECES', 'VIREMENT_BANCAIRE', 'ORANGE_MONEY', 'WAVE') NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Payment_payslipId_fkey`(`payslipId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PayRun` ADD CONSTRAINT `PayRun_entrepriseId_fkey` FOREIGN KEY (`entrepriseId`) REFERENCES `Entreprise`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayRun` ADD CONSTRAINT `PayRun_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Utilisateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payslip` ADD CONSTRAINT `Payslip_payRunId_fkey` FOREIGN KEY (`payRunId`) REFERENCES `PayRun`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payslip` ADD CONSTRAINT `Payslip_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_payslipId_fkey` FOREIGN KEY (`payslipId`) REFERENCES `Payslip`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Utilisateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
