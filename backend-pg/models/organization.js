import pool from "../config/db.js";

const createOrganizationTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "organizations" (
        "id"               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "organizationName" VARCHAR(255) NOT NULL,
        "ownerName"        VARCHAR(255) NOT NULL,
        "role"             VARCHAR(50)  DEFAULT 'master-admin',
        "email"            VARCHAR(255) NOT NULL UNIQUE,
        "password"         VARCHAR(255) NOT NULL,
        "createdAt"        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "updatedAt"        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
    `;

    try {
        await pool.query(query);
        console.log("Organizations table created successfully!");
    } catch (error) {
        console.log("Error creating organizations table:", error.message);
    }
};

export default createOrganizationTable;
