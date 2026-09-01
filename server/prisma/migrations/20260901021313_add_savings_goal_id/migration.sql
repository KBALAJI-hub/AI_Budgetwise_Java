-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `savingsGoalId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_savingsGoalId_fkey` FOREIGN KEY (`savingsGoalId`) REFERENCES `SavingsGoal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
