const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Conexão com PostgreSQL (funciona com Neon também)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Necessário para Neon
});

// Criação da tabela (se não existir)
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        descricao TEXT NOT NULL,
        horario TEXT NOT NULL,
        prioridade TEXT NOT NULL,
        concluded BOOLEAN NOT NULL DEFAULT FALSE
      )
    `);
    console.log('Tabela "appointments" pronta.');
  } catch (err) {
    console.error('Erro ao criar tabela:', err);
  }
})();

// Configurações do Express
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rota principal
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para agendar
app.post('/agendar', async (req, res) => {
  try {
    console.log('Dados recebidos:', req.body);

    const { titulo, descricao, data, prioridade } = req.body;

    if (!titulo || !descricao || !data || !prioridade) {
      console.error('Dados incompletos:', req.body);
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const insertQuery = `
      INSERT INTO appointments (titulo, descricao, horario, prioridade)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [titulo, descricao, data, prioridade]);

    console.log('Agendamento criado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao agendar:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Rota para listar agendamentos
app.get('/agendamentos', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Rota para deletar agendamento
app.delete('/delete/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send('ID inválido');
    }

    const result = await pool.query('DELETE FROM appointments WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).send('Agendamento não encontrado');
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Rota para marcar como concluído
app.put('/concluir/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send('ID inválido');
    }

    await pool.query('UPDATE appointments SET concluded = TRUE WHERE id = $1', [id]);

    res.sendStatus(200);
  } catch (error) {
    console.error('Erro ao concluir agendamento:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
