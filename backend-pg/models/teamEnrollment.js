import pool from "../config/db.js";

const createTeamEnrollmentTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "team_members" (
        "teamId"   BIGINT NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
        "memberId" BIGINT NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
        PRIMARY KEY ("teamId", "memberId")
    );
    `;

    try {
        await pool.query(query);
        console.log("Team Members (enrollment) table created successfully!");
    } catch (error) {
        console.log("Error creating team_members table:", error.message);
    }
};

export default createTeamEnrollmentTable;
