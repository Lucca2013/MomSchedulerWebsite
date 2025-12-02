import appointmentsRepository from "../repositories/appointmentsRepository.js"

export default {
    async schedule(title, description, date, priority, user_id) {
        return await appointmentsRepository.insertSchedule(title, description, date, priority, user_id);
    },

    async appointments(user_id) {
        return await appointmentsRepository.selectAppointments(user_id);
    },

    async delete(id, user_id) {
        const result = await appointmentsRepository.deleteSchedule(id, user_id);
        return result ? result : null
    },

    async conclude(id, user_id) {
        const result = await appointmentsRepository.concludeSchedule(id, user_id);
        return result ? result : null
    }
}