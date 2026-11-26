import pool from "../config/db.js";

const createTaskTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "tasks" (
        "id"          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "moduleId"    BIGINT       REFERENCES "modules"("id") ON DELETE SET NULL,
        "taskName"    VARCHAR(255) NOT NULL,
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
        console.log("Tasks table created successfully!");
    } catch (error) {
        console.log("Error creating tasks table:", error.message);
    }
};

export default createTaskTable;
