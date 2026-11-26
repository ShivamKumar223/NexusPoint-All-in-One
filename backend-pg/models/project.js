import pool from "../config/db.js";

const createProjectTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "projects" (
        "id"               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "organizationId"   BIGINT       NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "projectManagerId" BIGINT       NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
        "projectName"      VARCHAR(255) NOT NULL,
        "description"      TEXT         NOT NULL,
        "startFrom"        TIMESTAMPTZ  DEFAULT NOW(),
        "completeBy"       TIMESTAMPTZ  NOT NULL,
        "status"           VARCHAR(50)  NOT NULL DEFAULT 'pending'
                             CHECK ("status" IN ('pending','inprogress','review','complete','archive')),
        "createdAt"        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "updatedAt"        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
    `;

    try {
        await pool.query(query);
        console.log("Projects table created successfully!");
    } catch (error) {
        console.log("Error creating projects table:", error.message);
    }
};

export default createProjectTable;
