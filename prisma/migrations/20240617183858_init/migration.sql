/*
  Warnings:

  - Added the required column `api_name` to the `customAPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `customAPI` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_customAPI" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "api_name" TEXT NOT NULL
);
INSERT INTO "new_customAPI" ("id") SELECT "id" FROM "customAPI";
DROP TABLE "customAPI";
ALTER TABLE "new_customAPI" RENAME TO "customAPI";
CREATE UNIQUE INDEX "customAPI_code_key" ON "customAPI"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
