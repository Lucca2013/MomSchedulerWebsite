const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const nodemailer = require('nodemailer');
const { env } = require('process');
const jwt = require('jsonwebtoken');
const { composer } = require('googleapis/build/src/apis/composer');

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

const sessionConfig = {
    store: new pgSession({
        pool: pool,
        tableName: 'user_sessions',
        createTableIfMissing: true,
        pruneSessionInterval: 60
    }),
    secret: process.env.SESSION_SECRET || '!SecretKey!!SecretKey!!SecretKey!!SecretKey!',
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
app.use(cookieParser());

app.use((req, res, next) => {
    req.authenticate = () => !!req.session.user?.id;

    req.login = (user) => {
        return new Promise((resolve, reject) => {
            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email
            };
            req.session.save(err => err ? reject(err) : resolve());
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

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function generateToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || '!SecretJWT!!SecretJWT!!SecretJWT!!SecretJWT!',
        { expiresIn: '1h' }
    );
}

function isValidToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '!SecretJWT!!SecretJWT!!SecretJWT!!SecretJWT!');
        return !!decoded.userId;
    } catch (error) {
        return false;
    }
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

async function sendEmail(subject, html, to) {
    try {
        const info = await transporter.sendMail({
            from: env.EMAIL,
            to: to,
            subject: subject,
            html: html
        });

        console.log('E-mail enviado: %s', info.messageId);
    } catch (error) {
        console.error('Erro ao enviar:', error);
    }
}

app.get('/auth/status', (req, res) => {
    res.json({
        authenticated: req.authenticate(),
        user: req.session.user
    });
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
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        await req.login({
            id: user.id,
            username: user.username,
            email: user.email
        });

        res.json({ message: 'Login realizado com sucesso!', user: req.session.user });
    } catch (error) {
        console.error('Erro no login:', error);
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
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

app.post('/logout', async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            req.session.destroy(err => err ? reject(err) : resolve());
        });

        res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({ error: 'Erro ao fazer logout' });
    }
});

app.post('/PasswordForgotten', async (req, res) => {
    console.log('Recebido pedido de recuperação para:', req.body.email);
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'E-mail é obrigatório' });
    }

    try {
        const result = await pool.query('SELECT * FROM login WHERE email = $1', [email]);
        console.table(result.rows);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const token = generateToken(user.id);
        let resetLink = ``;

        if (process.env.NODE_ENV === 'production') {
            resetLink = `https://mom-scheduler-website.vercel.app/resetar-senha?token=${token}`;
        } else {
            resetLink = `http://localhost:${PORT}/resetar-senha?token=${token}`;
        }

        sendEmail("Redefinição de Senha", `<p>Para redefinir sua senha, clique no link: <a href="${resetLink}">${resetLink}</a></p>`, email);

        console.log(`E-mail de redefinição enviado para ${email}`);
        res.json({ message: 'E-mail de redefinição enviado com sucesso', success: true });
    } catch (error) {
        console.error('Erro ao enviar e-mail de redefinição de senha:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

app.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || '!SecretJWT!!SecretJWT!!SecretJWT!!SecretJWT!'
        );

        if (!decoded.userId) {
            return res.status(400).json({ success: false, error: 'Token inválido ou expirado' });
        }

        const userResult = await pool.query('SELECT * FROM login WHERE id = $1', [decoded.userId]);
        console.log("Usuário encontrado:", userResult.rows);
        if (userResult.rows.length > 0) {
            console.log("Usuário encontrado");
            await pool.query('UPDATE login SET password = $1 WHERE id = $2', [newPassword, decoded.userId]);
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: "Usuário não encontrado" });
        }
    } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        res.status(400).json({ success: false, error: "Token inválido ou expirado" });
    }
});

app.post('/agendar', checkAuth, async (req, res) => {
    try {
        const { titulo, descricao, data, prioridade } = req.body;
        if (!titulo || !descricao || !data || !prioridade) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        const result = await pool.query(
            `INSERT INTO appointments (user_id, titulo, descricao, horario, prioridade)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.session.user.id, titulo, descricao, data, prioridade]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao agendar:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

app.get('/agendamentos', checkAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *, TO_CHAR(horario::TIMESTAMP, 'YYYY-MM-DD"T"HH24:MI') AS horario_iso
       FROM appointments 
       WHERE user_id = $1
       ORDER BY horario::TIMESTAMP ASC`,
            [req.session.user.id]
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
        if (isNaN(id)) return res.status(400).send('ID inválido');

        const result = await pool.query(
            'DELETE FROM appointments WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.session.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Agendamento não encontrado');
        }

        res.json({ message: 'Agendamento deletado', deleted: result.rows[0] });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

app.put('/concluir/:id', checkAuth, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).send('ID inválido');

        const result = await pool.query(
            `UPDATE appointments 
       SET concluded = NOT concluded 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
            [id, req.session.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Agendamento não encontrado');
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao concluir:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        environment: process.env.NODE_ENV || 'development',
        database: 'connected'
    });
});

app.listen(PORT, () => {
    console.log(`\n=== SERVIDOR INICIADO ===`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Banco de dados: Conectado\n`);
});

module.exports = app;