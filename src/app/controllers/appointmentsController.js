import appointmentsService from '../services/appointmentsService.js';

export default {
    async schedule(req, res) {
        const { title, description, date, priority } = req.body;
        if (!title || !description || !date || !priority) {
            return res.status(400).json({ error: 'incomplete data' });
        }

        res.json(await appointmentsService.schedule(title, description, date, priority, req.session.user.id));
    },

    async appointments(req, res) {
        res.json(await appointmentsService.appointments(req.session.user.id));
    },

    async delete(req, res) {
        const id = Number(req.params.id);

        const result = await appointmentsService.delete(id, req.session.user.id);

        result ? res.status(200) : res.status(404);
    },

    async conclude(req, res) {
        const id = Number(req.params.id);

        const result = await appointmentsService.conclude(id, req.session.user.id);

        result ? res.status(200) : res.status(404);
    }
}