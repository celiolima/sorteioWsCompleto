const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require('path');

// atribuindo as rotas nas variaveis
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');

//##verificar
const { render } = require('ejs');

const app = express();

//seteamos el motor de plantillas
app.set('view engine', 'ejs')
app.set('views', './views');

//seteamos la carpeta public para archivos estáticos
app.use(express.static(__dirname + '/public'));

//Rotas 
app.use('/', indexRouter);
app.use('/admin', adminRouter);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const APP_PORT = process.env.PORT || 3000;
const APP_URL = process.env.URL || `http://localhost:${APP_PORT}`;

const ACTIONS = {
  ADMIN: "admin",
  DRAW: "draw",
  CLIENT_COUNT_UPDATE: "clientCountUpdate",
};

/* app.use("/public", express.static("public"));
app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html", (err) => {
  if (err) {
    console.log('Error sending file:', err);
    res.status(500).send('File not found');
  } else {
    console.log('Sent:', req.hostname);
  }
}));
app.get("/admin", (req, res) => res.sendFile(__dirname + "/public/admin.html", (err) => {
  if (err) {
    console.log('Error sending file:', err);
    res.status(500).send('File not found');
  } else {
    console.log('Sent:', '/admin');
  }
})); */

server.listen(APP_PORT, () =>
  console.log(`Servidor ouvindo a porta ${APP_PORT}!`)
);



let clients = [];

wss.on("connection", (ws) => {
  clients.push(ws);
  updateAdminClientCount();

  ws.on("close", () => {
    clients = clients.filter((client) => client !== ws);
    updateAdminClientCount();
  });

  ws.on("message", handleIncomingMessage.bind(null, ws));
});

function handleIncomingMessage(ws, msg) {
  const data = JSON.parse(msg);
  const action = data.action;

  switch (action) {
    case ACTIONS.ADMIN:
      ws.isAdmin = true;
      break;
    case ACTIONS.DRAW:
      handleDraw(data.code);
      break;
    default:
      console.warn("Ação desconhecida:", action);
  }
}

function handleDraw(confirmationCode) {
  let participants = Array.from(wss.clients).filter(
    (client) => !client.isAdmin
  );
  const winner = participants[Math.floor(Math.random() * participants.length)];

  participants.forEach((client) => {
    let result = JSON.stringify({ status: "youlose" });
    if (client === winner) {
      result = JSON.stringify({ status: "youwin", code: confirmationCode });
    }
    client.send(result);
  });
}

function updateAdminClientCount() {
  const clientCount = Array.from(wss.clients).filter(
    (client) => !client.isAdmin
  ).length;

  Array.from(wss.clients).forEach((client) => {
    if (client.isAdmin && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          action: ACTIONS.CLIENT_COUNT_UPDATE,
          count: clientCount,
        })
      );
    }
  });
}
