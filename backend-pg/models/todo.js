import pool from "../config/db.js";

const createTodoTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "todos" (
        "id"             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "userId"         VARCHAR(255) NOT NULL,
        "organizationId" VARCHAR(255) NOT NULL,
        "title"          VARCHAR(255) NOT NULL,
        "description"    TEXT         DEFAULT '',
        "dueDate"        TIMESTAMPTZ  DEFAULT NULL,
        "priority"       VARCHAR(20)  DEFAULT 'medium' CHECK ("priority" IN ('low','medium','high')),
        "completed"      BOOLEAN      DEFAULT false,
        "createdAt"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        "updatedAt"      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
    `;

    try {
        await pool.query(query);
        console.log("Todos table created successfully!");
    } catch (error) {
        console.log("Error creating todos table:", error.message);
    }
};

export default createTodoTable;
