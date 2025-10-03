-- CreateTable
CREATE TABLE "hotel_settings" (
    "id" TEXT NOT NULL,
    "hotelName" TEXT NOT NULL DEFAULT 'NeboSync Hotel',
    "address" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.18,
    "taxLabel" TEXT NOT NULL DEFAULT 'GST',
    "taxRegistration" TEXT,
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV',
    "invoiceFooter" TEXT NOT NULL DEFAULT 'Thank you for choosing our hotel!',
    "bankName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "accountName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_settings_pkey" PRIMARY KEY ("id")
);
