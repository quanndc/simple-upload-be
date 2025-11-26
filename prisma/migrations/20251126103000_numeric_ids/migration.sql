-- Drop dependent tables to allow primary key type changes
DROP TABLE IF EXISTS "Comment";
DROP TABLE IF EXISTS "Photo";

-- Recreate Photo table with integer autoincrement id
CREATE TABLE "Photo" (
    "id" SERIAL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enforce unique storage paths
CREATE UNIQUE INDEX "Photo_storagePath_key" ON "Photo"("storagePath");

-- Recreate Comment table referencing the new integer key
CREATE TABLE "Comment" (
    "id" SERIAL PRIMARY KEY,
    "body" TEXT NOT NULL,
    "author" TEXT,
    "photoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_photoId_fkey"
        FOREIGN KEY ("photoId") REFERENCES "Photo"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

