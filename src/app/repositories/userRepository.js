import pool from "../db/pool.js";

export default {
  async findByEmail(email) {
    const res = await pool.query(
      "SELECT * FROM login WHERE email = $1",
      [email]
    );
    return res.rows[0];
  },

  async create(username, email, password) {
    const res = await pool.query(
      `INSERT INTO login (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [username, email, password]
    );
    return res.rows[0];
  },

  async findById(id) {
    const res = await pool.query(
      "SELECT * FROM login WHERE id = $1",
      [id]
    );
    return res.rows[0];
  },

  async updatePassword(id, password) {
    await pool.query("UPDATE login SET password = $1 WHERE id = $2", [
      password,
      id
    ]);
  }
};
