-- AlterTable
ALTER TABLE "hotel_settings" ADD COLUMN     "currencySymbol" TEXT NOT NULL DEFAULT '₹',
ADD COLUMN     "invoiceAccentColor" TEXT NOT NULL DEFAULT '#2D5A3D',
ADD COLUMN     "paymentTerms" TEXT NOT NULL DEFAULT 'Due upon checkout',
ADD COLUMN     "showBankDetails" BOOLEAN NOT NULL DEFAULT true;
