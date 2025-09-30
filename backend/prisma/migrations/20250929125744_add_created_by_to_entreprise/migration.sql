-- AlterTable
ALTER TABLE `Entreprise` ADD COLUMN `createdById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Entreprise` ADD CONSTRAINT `Entreprise_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Utilisateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
