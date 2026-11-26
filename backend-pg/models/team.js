import pool from "../config/db.js";

const createTeamTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "teams" (
        "id"               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "organizationId"   BIGINT       NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "projectManagerId" BIGINT       NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
        "teamName"         VARCHAR(255) NOT NULL,
        "description"      TEXT         NOT NULL,
        "createdAt"        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "updatedAt"        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
    `;

    try {
        await pool.query(query);
        console.log("Teams table created successfully!");
    } catch (error) {
        console.log("Error creating teams table:", error.message);
    }
};

export default createTeamTable;
