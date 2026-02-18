const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const TODOS_FILE = path.join(__dirname, 'todos.json');

app.use(express.json());
app.use(express.static('public'));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});


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

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// POST create todo
app.post('/api/todos', (req, res) => {
  const todos = readTodos();
  const text = req.body.text?.trim();

  if (!text) {
    return res.status(400).json({ error: 'Todo text is required' });
  }
  

 const newTodo = {
  id: Date.now() + Math.floor(Math.random() * 1000),
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
  const id = Number(req.params.id);

  const todo = todos.find(t => Number(t.id) === id);
  

  

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  if (req.body && req.body.text !== undefined) {
    const trimmed = req.body.text.trim();

    if (!trimmed) {
      return res.status(400).json({ error: 'Todo text is required' });
    }

    todo.text = trimmed;
  } else {
    todo.completed = !todo.completed;
  }

  writeTodos(todos);

  return res.status(200).json(todo);
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
