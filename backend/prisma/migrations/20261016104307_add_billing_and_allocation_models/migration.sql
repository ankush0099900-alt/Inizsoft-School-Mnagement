-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'COMPLETED', 'FAILED', 'REJECTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentChannel" AS ENUM ('ONLINE_RAZORPAY', 'ONLINE_STRIPE', 'MANUAL_BANK_TRANSFER', 'MANUAL_UPI', 'MANUAL_CHEQUE', 'MANUAL_CASH');

-- CreateTable
CREATE TABLE "SubscriptionTransaction" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "planId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "channel" "PaymentChannel" NOT NULL,
    "gatewayOrderId" TEXT,
    "gatewayPaymentId" TEXT,
    "gatewaySignature" TEXT,
    "transactionReference" TEXT,
    "proofDocumentUrl" TEXT,
    "reviewedById" TEXT,
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherSubjectAllocation" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionId" TEXT,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherSubjectAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolPaymentConfig" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "keySecretEnc" TEXT NOT NULL,
    "webhookSecret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolPaymentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionTransaction_gatewayOrderId_key" ON "SubscriptionTransaction"("gatewayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionTransaction_gatewayPaymentId_key" ON "SubscriptionTransaction"("gatewayPaymentId");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_schoolId_idx" ON "SubscriptionTransaction"("schoolId");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_status_idx" ON "SubscriptionTransaction"("status");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_channel_idx" ON "SubscriptionTransaction"("channel");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_createdAt_idx" ON "SubscriptionTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "TeacherSubjectAllocation_schoolId_idx" ON "TeacherSubjectAllocation"("schoolId");

-- CreateIndex
CREATE INDEX "TeacherSubjectAllocation_teacherId_idx" ON "TeacherSubjectAllocation"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherSubjectAllocation_classId_idx" ON "TeacherSubjectAllocation"("classId");

-- CreateIndex
CREATE INDEX "TeacherSubjectAllocation_subjectId_idx" ON "TeacherSubjectAllocation"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherSubjectAllocation_teacherId_classId_sectionId_subjec_key" ON "TeacherSubjectAllocation"("teacherId", "classId", "sectionId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolPaymentConfig_schoolId_key" ON "SchoolPaymentConfig"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolPaymentConfig_schoolId_idx" ON "SchoolPaymentConfig"("schoolId");

-- AddForeignKey
ALTER TABLE "SubscriptionTransaction" ADD CONSTRAINT "SubscriptionTransaction_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionTransaction" ADD CONSTRAINT "SubscriptionTransaction_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionTransaction" ADD CONSTRAINT "SubscriptionTransaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionTransaction" ADD CONSTRAINT "SubscriptionTransaction_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubjectAllocation" ADD CONSTRAINT "TeacherSubjectAllocation_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubjectAllocation" ADD CONSTRAINT "TeacherSubjectAllocation_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubjectAllocation" ADD CONSTRAINT "TeacherSubjectAllocation_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubjectAllocation" ADD CONSTRAINT "TeacherSubjectAllocation_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubjectAllocation" ADD CONSTRAINT "TeacherSubjectAllocation_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolPaymentConfig" ADD CONSTRAINT "SchoolPaymentConfig_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
