import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import Database from 'better-sqlite3';

const app = express();
const PORT = 3000;
const db = new Database('appointments.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    horario TEXT NOT NULL,
    prioridade TEXT NOT NULL,
    concluded BOOLEAN NOT NULL DEFAULT 0
  )
`).run();

app.use(bodyParser.json()); // Para processar JSON
app.use(bodyParser.urlencoded({ extended: true })); // Para forms tradicionais

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.post('/agendar', (req, res) => {
  try {
    console.log('Dados recebidos:', req.body);

    const { titulo, descricao, data, prioridade } = req.body;

    if (!titulo || !descricao || !data || !prioridade) {
      console.error('Dados incompletos:', req.body);
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const stmt = db.prepare(`
      INSERT INTO appointments (titulo, descricao, horario, prioridade) 
      VALUES (?, ?, ?, ?)
    `);

    const info = stmt.run(titulo, descricao, data, prioridade);

    // Buscar o agendamento recém-criado
    const novoAgendamento = db.prepare(`
      SELECT * FROM appointments WHERE id = ?
    `).get(info.lastInsertRowid);

    console.log('Agendamento criado:', novoAgendamento);
    res.json(novoAgendamento);
  } catch (error) {
    console.error('Erro ao agendar:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.get('/agendamentos', (_req, res) => {
  const agendamentos = db.prepare('SELECT * FROM appointments').all();
  res.json(agendamentos);
});

app.delete('/delete/:id', (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send('ID inválido');
  }
  const info = db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
  if (info.changes === 0) {
    return res.status(404).send('Agendamento não encontrado');
  }
  res.sendStatus(200);
});

app.put('/concluir/:id', (req, res) => {
  const id = req.params.id;

  db.prepare(`
    UPDATE appointments 
    SET concluded = 1 
    WHERE id = ?
  `).run(id);

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
