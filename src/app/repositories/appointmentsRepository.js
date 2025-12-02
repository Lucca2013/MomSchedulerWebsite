import pool from "../db/pool.js";

export default {
    async insertSchedule(title, description, date, priority, user_id) {
        const result = await pool.query(
            `INSERT INTO appointments (user_id, titulo, descricao, horario, prioridade) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user_id, title, description, date, priority]
        );

        return result.rows[0];
    },

    async selectAppointments(user_id) {
        const result = await pool.query(
            `SELECT *, TO_CHAR(horario::TIMESTAMP, 'YYYY-MM-DD"T"HH24:MI') AS horario_iso
                FROM appointments 
                WHERE user_id = $1
                ORDER BY horario::TIMESTAMP ASC`,
            [user_id]
        );

        return result.rows;
    },

    async deleteSchedule(id, user_id) {
        const result = await pool.query(
            'DELETE FROM appointments WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, user_id]
        );

        if (result.rowCount === 0) {
            return false;
        }
        return true;
    },

    async concludeSchedule(id, user_id) {
        const result = await pool.query(
            `UPDATE appointments 
                SET concluded = NOT concluded
                WHERE id = $1 AND user_id = $2
                RETURNING *`,
            [id, user_id]
        );

        if (result.rowCount === 0) {
            return false;
        }
        return true;
    }
}