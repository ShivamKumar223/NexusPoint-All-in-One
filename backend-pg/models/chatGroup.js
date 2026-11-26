import pool from "../config/db.js";

const createChatGroupTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "chat_groups" (
        "id"              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "organizationId"  BIGINT      NOT NULL,
        "groupName"       VARCHAR(255),
        "description"     TEXT        DEFAULT '',
        "isDirectMessage" BOOLEAN     DEFAULT false,
        "isTeamChat"      BOOLEAN     DEFAULT false,
        "teamId"          BIGINT,
        "members"         BIGINT[]    DEFAULT '{}',
        "createdBy"       BIGINT,
        "admins"          BIGINT[]    DEFAULT '{}',
        "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    `;

    try {
        await pool.query(query);
        console.log("Chat Groups table created successfully!");
    } catch (error) {
        console.log("Error creating chat_groups table:", error.message);
    }
};

export default createChatGroupTable;
