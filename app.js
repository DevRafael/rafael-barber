const express = require('express');
const db = require('./database');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/clientes', (req, res) => {
  const lista = db.prepare('SELECT id, nome, telefone, email FROM clientes ORDER BY id').all();
  res.json(lista);
});

app.post('/clientes', (req, res) => {
  const { nome, telefone, email } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ erro: 'O campo nome é obrigatório.' });
  }
  if (!telefone || !telefone.trim()) {
    return res.status(400).json({ erro: 'O campo telefone é obrigatório.' });
  }
  const r = db.prepare('INSERT INTO clientes (nome, telefone, email) VALUES (?, ?, ?)')
              .run(nome.trim(), telefone.trim(), email || null);
  res.status(201).json({ id: r.lastInsertRowid, mensagem: 'Cliente cadastrado com sucesso.' });
});

app.get('/servicos', (req, res) => {
  res.json(db.prepare('SELECT id, nome FROM servicos WHERE ativo = 1').all());
});

app.get('/profissionais', (req, res) => {
  res.json(db.prepare('SELECT id, nome FROM profissionais WHERE ativo = 1').all());
});

app.get('/agendamentos', (req, res) => {
  const lista = db.prepare(`
    SELECT a.id, a.data_hora, c.nome AS cliente, s.nome AS servico,
           p.nome AS profissional, a.status
    FROM agendamentos a
    JOIN clientes c ON c.id = a.cliente_id
    JOIN servicos s ON s.id = a.servico_id
    JOIN profissionais p ON p.id = a.profissional_id
    ORDER BY a.data_hora
  `).all();
  res.json(lista);
});

app.post('/agendamentos', (req, res) => {
  const { cliente_id, servico_id, profissional_id, data_hora } = req.body;
  if (!cliente_id || !servico_id || !profissional_id || !data_hora) {
    return res.status(400).json({ erro: 'Preencha cliente, serviço, profissional e data/horário.' });
  }
  const servico = db.prepare('SELECT preco FROM servicos WHERE id = ? AND ativo = 1').get(servico_id);
  if (!servico) {
    return res.status(400).json({ erro: 'Serviço inválido.' });
  }
  const ocupado = db.prepare(
    "SELECT id FROM agendamentos WHERE profissional_id = ? AND data_hora = ? AND status != 'Cancelado'"
  ).get(profissional_id, data_hora);
  if (ocupado) {
    return res.status(409).json({ erro: 'Horário ocupado. Escolha outro horário.' });
  }
  db.prepare(
    'INSERT INTO agendamentos (cliente_id, servico_id, profissional_id, data_hora, preco_registrado) VALUES (?, ?, ?, ?, ?)'
  ).run(cliente_id, servico_id, profissional_id, data_hora, servico.preco);
  res.status(201).json({ mensagem: 'Agendamento realizado com sucesso.' });
});

app.listen(3000, () => console.log('Rodando em http://localhost:3000'));