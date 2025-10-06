-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `reference` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Payslip` ADD COLUMN `joursTravailles` INTEGER NULL;
