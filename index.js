const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    require: true
  }
});

app.set('trust proxy', 2);

// Configuração da sessão
const sessionConfig = {
  store: new pgSession({
    pool: pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
    pruneSessionInterval: 60
  }),
  secret: process.env.SESSION_SECRET || 'chave-secreta-forte',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 100 * 365 * 24 * 60 * 60 * 1000,
  }
};

app.use(session(sessionConfig));

// Parseador de cookies
app.use(cookieParser());

// Middleware de log personalizado
app.use((req, res, next) => {
  console.log('\n--- REQUEST DETAILS ---');
  console.log('Original URL:', req.originalUrl);
  console.log('Protocol:', req.protocol);
  console.log('Secure:', req.secure);
  console.log('Headers:', req.headers);
  console.log('Session ID from cookie:', req.cookies ? req.cookies['connect.sid'] : 'no cookies');
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.authenticate = () => {
    return !!req.session.user && !!req.session.user.id;
  };

  req.login = (user) => {
    return new Promise((resolve, reject) => {
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email
      };

      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  req.logout = () => {
    return new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  next();
});

const checkAuth = (req, res, next) => {
  if (req.authenticate()) {
    next();
  } else {
    res.status(401).json({ error: 'Não autenticado' });
  }
};

app.get('/auth/status', (req, res) => {
  const authenticated = req.authenticate();
  console.log(`Auth Status: ${authenticated}`, req.session.user);
  res.json({
    authenticated: authenticated,
    user: req.session.user
  });
});

app.get('/debug-session', (req, res) => {
  console.log('Sessão atual:', req.session);
  console.log('Session ID:', req.sessionID);
  res.json({
    session: req.session,
    sessionID: req.sessionID,
    cookies: req.cookies
  });
});

app.get('/', (req, res) => {
  if (req.authenticate()) {
    res.sendFile(path.join(__dirname, 'public', 'loged', 'index.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.get('/loged/index.html', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'loged', 'index.html'));
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  try {
    const result = await pool.query('SELECT * FROM login WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }
    await req.login({
      id: user.id,
      username: user.username,
      email: user.email
    });

    console.log('Usuário logado:', user.username);
    console.log('Session ID:', req.sessionID);

    res.json({
      message: 'Login realizado com sucesso!',
      user: req.session.user
    });
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    const existingUser = await pool.query('SELECT * FROM login WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    const result = await pool.query(
      'INSERT INTO login (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, password]
    );

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.post('/logout', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    res.status(500).json({ error: 'Erro ao fazer logout' });
  }
});

app.post('/agendar', checkAuth, async (req, res) => {
  const userId = req.session.user.id;

  try {
    const { titulo, descricao, data, prioridade } = req.body;

    if (!titulo || !descricao || !data || !prioridade) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const result = await pool.query(
      `INSERT INTO appointments (user_id, titulo, descricao, horario, prioridade)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, titulo, descricao, data, prioridade]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao agendar:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.get('/agendamentos', checkAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const result = await pool.query(
      `SELECT *, TO_CHAR(horario::TIMESTAMP, 'YYYY-MM-DD"T"HH24:MI') AS horario_iso
       FROM appointments 
       WHERE user_id = $1
       ORDER BY horario::TIMESTAMP ASC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.delete('/delete/:id', checkAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.session.user.id;

    if (isNaN(id)) return res.status(400).send('ID inválido');

    const result = await pool.query(
      'DELETE FROM appointments WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('Agendamento não encontrado');
    }

    res.json({
      message: 'Agendamento deletado',
      deleted: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.put('/concluir/:id', checkAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.session.user.id;

    if (isNaN(id)) return res.status(400).send('ID inválido');

    const result = await pool.query(
      `UPDATE appointments 
       SET concluded = NOT concluded 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('Agendamento não encontrado');
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao concluir agendamento:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Rota de saúde para verificar o status do servidor
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    sessionSupport: true,
    database: pool ? 'connected' : 'disconnected'
  });
});

// Inicialização do servidor
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n=== SERVIDOR INICIADO ===`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Banco de dados: ${process.env.DATABASE_URL ? 'Conectado' : 'Não configurado'}`);
    console.log(`Armazenamento de sessão: PostgreSQL\n`);
  });
}

module.exports = app;