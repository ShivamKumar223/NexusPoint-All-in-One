import pool from "../config/db.js";

const createChatMessageTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "chat_messages" (
        "id"          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "groupId"     BIGINT      NOT NULL REFERENCES "chat_groups"("id") ON DELETE CASCADE,
        "senderId"    BIGINT      NOT NULL,
        "content"     TEXT        NOT NULL,
        "messageType" VARCHAR(20) DEFAULT 'text' CHECK ("messageType" IN ('text','system')),
        "readBy"      BIGINT[]    DEFAULT '{}',
        "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS "idx_chat_messages_group_created"
        ON "chat_messages" ("groupId", "createdAt");
    `;

    try {
        await pool.query(query);
        console.log("Chat Messages table created successfully!");
    } catch (error) {
        console.log("Error creating chat_messages table:", error.message);
    }
};

export default createChatMessageTable;
