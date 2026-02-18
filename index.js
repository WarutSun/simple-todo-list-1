const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const TODOS_FILE = path.join(__dirname, 'todos.json');

app.use(express.json());
app.use(express.static('public'));

function readTodos() {
  try {
    const data = fs.readFileSync(TODOS_FILE);
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeTodos(todos) {
  fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2));
}

// GET all todos
app.get('/api/todos', (req, res) => {
  const todos = readTodos();
  res.json(todos);
});

// POST create todo
app.post('/api/todos', (req, res) => {
  const todos = readTodos();
  const text = req.body.text?.trim();

  if (!text) {
    return res.status(400).json({ error: 'Todo text is required' });
  }
  

  const newTodo = {
    id: Date.now(),
    text,
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);
  writeTodos(todos);

  res.status(201).json(newTodo);
});

// PUT toggle todo
app.put('/api/todos/:id', (req, res) => {
  const todos = readTodos();
  const id = parseInt(req.params.id, 10);

  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todo.completed = !todo.completed;
  writeTodos(todos);

  res.status(200).json(todo);
});

// DELETE todo
app.delete('/api/todos/:id', (req, res) => {
  const todos = readTodos();
  const id = parseInt(req.params.id, 10);

  const index = todos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos.splice(index, 1);
  writeTodos(todos);

  res.status(200).json({ message: 'Todo deleted successfully' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
