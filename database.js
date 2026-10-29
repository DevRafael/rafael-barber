const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('barbearia.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS servicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    duracao_minutos INTEGER NOT NULL,
    preco REAL NOT NULL,
    ativo INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS profissionais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT,
    ativo INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    servico_id INTEGER NOT NULL REFERENCES servicos(id),
    profissional_id INTEGER NOT NULL REFERENCES profissionais(id),
    data_hora TEXT NOT NULL,
    preco_registrado REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Agendado',
    observacao TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

if (db.prepare('SELECT COUNT(*) AS n FROM servicos').get().n === 0) {
  const ins = db.prepare('INSERT INTO servicos (nome, duracao_minutos, preco) VALUES (?, ?, ?)');
  ins.run('Corte', 30, 30);
  ins.run('Barba', 20, 20);
  ins.run('Corte + barba', 50, 45);
}
if (db.prepare('SELECT COUNT(*) AS n FROM profissionais').get().n === 0) {
  db.prepare('INSERT INTO profissionais (nome) VALUES (?)').run('Rafael');
}

module.exports = db;