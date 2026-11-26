import pool from "../config/db.js";

const createTaskEnrollmentTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "task_members" (
        "taskId"   BIGINT NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
        "memberId" BIGINT NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
        PRIMARY KEY ("taskId", "memberId")
    );

    CREATE TABLE IF NOT EXISTS "project_teams" (
        "projectId" BIGINT NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
        "teamId"    BIGINT NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
        PRIMARY KEY ("projectId", "teamId")
    );
    `;

    try {
        await pool.query(query);
        console.log("Task & Project Enrollment tables created successfully!");
    } catch (error) {
        console.log("Error creating task/project enrollment tables:", error.message);
    }
};

export default createTaskEnrollmentTable;
