-- CreateTable
CREATE TABLE "DoctorPracticeSchedule" (
    "id" SERIAL NOT NULL,
    "doctorId" TEXT NOT NULL,
    "schedule" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorPracticeSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DoctorPracticeSchedule_doctorId_idx" ON "DoctorPracticeSchedule"("doctorId");

-- AddForeignKey
ALTER TABLE "DoctorPracticeSchedule" ADD CONSTRAINT "DoctorPracticeSchedule_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
