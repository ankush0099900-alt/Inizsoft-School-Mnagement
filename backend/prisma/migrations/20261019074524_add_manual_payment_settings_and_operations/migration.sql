-- CreateEnum
CREATE TYPE "SubscriptionOperation" AS ENUM ('PURCHASE', 'RENEW', 'UPGRADE');

-- AlterTable
ALTER TABLE "SubscriptionTransaction" ADD COLUMN     "operation" "SubscriptionOperation" NOT NULL DEFAULT 'PURCHASE',
ADD COLUMN     "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "rejectionReason" TEXT;

-- CreateTable
CREATE TABLE "platform_payment_settings" (
    "id" TEXT NOT NULL,
    "beneficiaryName" TEXT NOT NULL,
    "upiId" TEXT NOT NULL,
    "qrCodeUrl" TEXT,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "accountType" TEXT DEFAULT 'CURRENT',
    "branchName" TEXT,
    "paymentInstructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_payment_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_operation_idx" ON "SubscriptionTransaction"("operation");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_transactionReference_idx" ON "SubscriptionTransaction"("transactionReference");

-- AddForeignKey
ALTER TABLE "platform_payment_settings" ADD CONSTRAINT "platform_payment_settings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
