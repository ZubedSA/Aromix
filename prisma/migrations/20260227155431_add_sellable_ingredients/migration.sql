-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "price" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TransactionItem" ADD COLUMN     "ingredientId" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "TransactionItem_ingredientId_idx" ON "TransactionItem"("ingredientId");

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
