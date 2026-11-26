import pool from "../config/db.js";

const createModuleEnrollmentTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "module_teams" (
        "moduleId" BIGINT NOT NULL REFERENCES "modules"("id") ON DELETE CASCADE,
        "teamId"   BIGINT NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
        PRIMARY KEY ("moduleId", "teamId")
    );

    CREATE TABLE IF NOT EXISTS "module_members" (
        "moduleId" BIGINT NOT NULL REFERENCES "modules"("id") ON DELETE CASCADE,
        "memberId" BIGINT NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
        PRIMARY KEY ("moduleId", "memberId")
    );
    `;

    try {
        await pool.query(query);
        console.log("Module Enrollment tables created successfully!");
    } catch (error) {
        console.log("Error creating module enrollment tables:", error.message);
    }
};

export default createModuleEnrollmentTable;
