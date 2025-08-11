const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do banco de dados para produção/desenvolvimento
const dbPath = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), 'appointments.db') // Vercel usa sistema de arquivos efêmero
  : 'appointments.db';

const db = new Database(dbPath);

// Criação da tabela
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

// Configurações do Express
app.use(express.static(path.join(__dirname, 'templates')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rota principal
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Rota para agendar
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

// Rota para listar agendamentos
app.get('/agendamentos', (_req, res) => {
  const agendamentos = db.prepare('SELECT * FROM appointments').all();
  res.json(agendamentos);
});

// Rota para deletar agendamento
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

// Rota para marcar como concluído
app.put('/concluir/:id', (req, res) => {
  const id = req.params.id;

  db.prepare(`
    UPDATE appointments 
    SET concluded = 1 
    WHERE id = ?
  `).run(id);

  res.sendStatus(200);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
