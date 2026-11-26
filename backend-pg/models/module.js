import pool from "../config/db.js";

const createModuleTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "modules" (
        "id"          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "projectId"   BIGINT       NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
        "moduleName"  VARCHAR(255) NOT NULL,
        "description" TEXT         NOT NULL,
        "startFrom"   TIMESTAMPTZ  DEFAULT NOW(),
        "completeBy"  TIMESTAMPTZ  NOT NULL,
        "status"      VARCHAR(50)  NOT NULL DEFAULT 'pending'
                        CHECK ("status" IN ('pending','inprogress','review','complete','archive')),
        "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "updatedAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
    `;

    try {
        await pool.query(query);
        console.log("Modules table created successfully!");
    } catch (error) {
        console.log("Error creating modules table:", error.message);
    }
};

export default createModuleTable;
