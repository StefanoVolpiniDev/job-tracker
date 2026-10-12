const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Conexão com o Banco MySQL do XAMPP
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Usuário padrão do XAMPP
    password: '',      // Senha padrão do XAMPP é vazia
    database: 'job_tracker'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.message);
    } else {
        console.log('Conectado ao banco de dados MySQL com sucesso!');
        
        // Criando a tabela de vagas automaticamente (AC1)
        const createJobsTable = `
            CREATE TABLE IF NOT EXISTS jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255),
                company VARCHAR(255),
                status VARCHAR(255),
                link VARCHAR(255)
            )
        `;
        db.query(createJobsTable, (err) => {
            if (err) console.error('Erro ao criar tabela jobs:', err.message);
        });

        // Criando a tabela de usuários automaticamente
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE,
                password VARCHAR(255)
            )
        `;
        db.query(createUsersTable, (err) => {
            if (err) console.error('Erro ao criar tabela users:', err.message);
        });

        // ---> NOVA TABELA: EMPRESAS (AC2) <---
        const createCompaniesTable = `
            CREATE TABLE IF NOT EXISTS companies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                sector VARCHAR(255),
                website VARCHAR(255)
            )
        `;
        db.query(createCompaniesTable, (err) => {
            if (err) console.error('Erro ao criar tabela companies:', err.message);
        });
    }
});

// --- ROTAS DO JOB TRACKER (CRUD VAGAS - AC1) ---

// Listar vagas
app.get('/api/jobs', (req, res) => {
    db.query('SELECT * FROM jobs', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Criar vaga
app.post('/api/jobs', (req, res) => {
    const { title, company, status, link } = req.body;
    db.query('INSERT INTO jobs (title, company, status, link) VALUES (?, ?, ?, ?)', 
    [title, company, status, link], (err, result) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id: result.insertId, message: 'Vaga cadastrada com sucesso!' });
    });
});

// Excluir vaga
app.delete('/api/jobs/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM jobs WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Vaga excluída com sucesso!' });
    });
});

// --- NOVAS ROTAS (CRUD EMPRESAS - AC2) ---

// Listar empresas
app.get('/api/companies', (req, res) => {
    db.query('SELECT * FROM companies', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Criar empresa
app.post('/api/companies', (req, res) => {
    const { name, sector, website } = req.body;
    db.query('INSERT INTO companies (name, sector, website) VALUES (?, ?, ?)', 
    [name, sector, website], (err, result) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id: result.insertId, message: 'Empresa cadastrada com sucesso!' });
    });
});

// Excluir empresa
app.delete('/api/companies/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM companies WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Empresa excluída com sucesso!' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});