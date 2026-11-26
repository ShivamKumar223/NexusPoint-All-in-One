import pool from "../config/db.js";

/** Run a query and return all rows. */
export const query = async (text, params) => {
  const { rows } = await pool.query(text, params);
  return rows;
};

/** Run a query and return the first row (or null). */
export const queryOne = async (text, params) => {
  const { rows } = await pool.query(text, params);
  return rows[0] || null;
};

/**
 * Replace a many-to-many junction: DELETE old rows, INSERT new ones.
 * Example: setJunction("team_members", "teamId", 3, "memberId", [5,6,7])
 */
export const setJunction = async (table, fkCol, fkVal, otherCol, values) => {
  await pool.query(`DELETE FROM "${table}" WHERE "${fkCol}" = $1`, [fkVal]);
  if (values && values.length > 0) {
    const intValues = values.map(Number);
    await pool.query(
      `INSERT INTO "${table}" ("${fkCol}", "${otherCol}")
       SELECT $1, unnest($2::bigint[])
       ON CONFLICT DO NOTHING`,
      [fkVal, intValues]
    );
  }
};
