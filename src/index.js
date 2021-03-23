const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  return !user ?
    response.status(404).json({ error: "Oops, user doesn't exists!" }) :
    request.user = user, next();
}

function checksExistsTodo(request, response, next) {
  const todo = request.user.todos.find(
    todo => todo.id === request.params.id
  );

  return !todo ?
    response.status(404).json({ error: "Oops, ToDo doesn't exists!" }) :
    request.todo = todo, next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (users.find(user => user.username === username)) {
    return response.status(400).json({ error: "Oops, username already taken!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.send(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  request.user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { title, deadline } = request.body;

  request.todo.title = title;
  request.todo.deadline = new Date(deadline);

  return response.status(201).send(request.todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  request.todo.done = true;

  return response.status(201).send(request.todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  request.user.todos.splice(request.todo, 1);

  return response.status(204).send();
});

module.exports = app;