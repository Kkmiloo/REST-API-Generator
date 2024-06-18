/*
  Warnings:

  - The primary key for the `customAPI` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_customAPI" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "api_name" TEXT NOT NULL
);
INSERT INTO "new_customAPI" ("api_name", "code", "id") SELECT "api_name", "code", "id" FROM "customAPI";
DROP TABLE "customAPI";
ALTER TABLE "new_customAPI" RENAME TO "customAPI";
CREATE UNIQUE INDEX "customAPI_code_key" ON "customAPI"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
