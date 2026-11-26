import pool from "../config/db.js";

// Import all table creation functions (order matters — foreign keys!)
import createOrganizationTable from "./organization.js";
import createMemberTable from "./member.js";
import createTeamTable from "./team.js";
import createProjectTable from "./project.js";
import createModuleTable from "./module.js";
import createTaskTable from "./task.js";
import createTodoTable from "./todo.js";
import createChatGroupTable from "./chatGroup.js";
import createChatMessageTable from "./chatMessage.js";
import createTeamEnrollmentTable from "./teamEnrollment.js";
import createModuleEnrollmentTable from "./moduleEnrollment.js";
import createTaskEnrollmentTable from "./taskEnrollment.js";

// Auto-update trigger function for "updatedAt" column
const createTriggerFunction = async () => {
    const query = `
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW."updatedAt" = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    `;

    try {
        await pool.query(query);
        console.log("Trigger function created successfully!");
    } catch (error) {
        console.log("Error creating trigger function:", error.message);
    }
};

// Create triggers for all tables that have "updatedAt"
const createTriggers = async () => {
    const tables = [
        "organizations", "members", "teams", "projects",
        "modules", "tasks", "todos", "chat_groups", "chat_messages"
    ];

    for (const table of tables) {
        const triggerName = `trg_${table}`;
        const query = `
        DO $$ BEGIN
            CREATE TRIGGER "${triggerName}" BEFORE UPDATE ON "${table}"
                FOR EACH ROW EXECUTE FUNCTION update_updated_at();
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
        `;
        try {
            await pool.query(query);
        } catch (error) {
            console.log(`Error creating trigger for ${table}:`, error.message);
        }
    }
    console.log("All triggers created successfully!");
};

// Master function — creates all tables in correct order
const createAllTables = async () => {
    try {
        console.log("🔄 Creating database tables...");

        // 1. Trigger function (needed before triggers)
        await createTriggerFunction();

        // 2. Main tables (order matters for foreign keys)
        await createOrganizationTable();
        await createMemberTable();
        await createTeamTable();
        await createProjectTable();
        await createModuleTable();
        await createTaskTable();
        await createTodoTable();
        await createChatGroupTable();
        await createChatMessageTable();

        // 3. Junction / enrollment tables
        await createTeamEnrollmentTable();
        await createModuleEnrollmentTable();
        await createTaskEnrollmentTable();

        // 4. Auto-update triggers
        await createTriggers();

        console.log("✅ All tables created successfully!");
    } catch (error) {
        console.error("❌ Error creating tables:", error.message);
    }
};

export default createAllTables;
