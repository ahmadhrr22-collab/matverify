-- CreateTable
CREATE TABLE "SupplierFieldMapping" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "externalField" TEXT NOT NULL,
    "internalField" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierFieldMapping_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SupplierFieldMapping" ADD CONSTRAINT "SupplierFieldMapping_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
