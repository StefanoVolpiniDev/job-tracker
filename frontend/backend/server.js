const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Conexão com o Banco SQLite
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite com sucesso!');
    }
});

// Criação das Tabelas
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        company TEXT,
        status TEXT,
        link TEXT
    )`);
});

// Rota de Teste
app.get('/', (req, res) => {
    res.json({ message: 'API do Job Tracker rodando com sucesso!' });
});

// --- 1. ROTAS DE AUTENTICAÇÃO (Login e Cadastro) ---

// Cadastro de Usuário
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    const query = `INSERT INTO users (email, password) VALUES (?, ?)`;
    db.run(query, [email, password], function(err) {
        if (err) {
            return res.status(400).json({ error: 'Erro ao cadastrar ou e-mail já existente.' });
        }
        res.json({ id: this.lastID, message: 'Usuário cadastrado com sucesso!' });
    });
});

// Login de Usuário
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.get(query, [email, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Erro no servidor.' });
        }
        if (!row) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }
        res.json({ message: 'Login realizado com sucesso!', user: { id: row.id, email: row.email } });
    });
});

// --- 2. ROTAS DO JOB TRACKER (CRUD de Vagas) ---

// Listar todas as vagas
app.get('/api/jobs', (req, res) => {
    db.all(`SELECT * FROM jobs`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Adicionar uma nova vaga
app.post('/api/jobs', (req, res) => {
    const { title, company, status, link } = req.body;
    const query = `INSERT INTO jobs (title, company, status, link) VALUES (?, ?, ?, ?)`;
    db.run(query, [title, company, status, link], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: 'Vaga cadastrada com sucesso!' });
    });
});

// Deletar uma vaga
app.delete('/api/jobs/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM jobs WHERE id = ?`, id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Vaga excluída com sucesso!' });
    });
});

// Iniciando o Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
