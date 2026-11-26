import pool from "../config/db.js";

const createMemberTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "members" (
        "id"              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "organizationId"  BIGINT       NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "name"            VARCHAR(255) NOT NULL,
        "memberId"        VARCHAR(255) NOT NULL,
        "password"        VARCHAR(255) NOT NULL,
        "role"            VARCHAR(50)  NOT NULL CHECK ("role" IN ('admin','project-manager','team-owner','developer')),
        "designation"     VARCHAR(255) NOT NULL,
        "skills"          TEXT[]       NOT NULL DEFAULT '{}',
        "createdAt"       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "updatedAt"       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
    `;

    try {
        await pool.query(query);
        console.log("Members table created successfully!");
    } catch (error) {
        console.log("Error creating members table:", error.message);
    }
};

export default createMemberTable;
