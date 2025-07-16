const { createServer } = require('node:http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3001;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST"]
    }
  });

  const messages = [];

  io.on('connection', (socket) => {

    socket.emit('previous_messages', messages);

    socket.on('send_message', (data) => {
      
      const message = {
        id: Date.now(),
        text: data.text,
        user: data.user,
        timestamp: new Date()
      };
      
      messages.push(message);
      
      io.emit('receive_message', message);
    });

    socket.on('typing', (user) => {
      socket.broadcast.emit('user_typing', user);
    });

    socket.on('stop_typing', () => {
      socket.broadcast.emit('user_stop_typing');
    });

    socket.on('disconnect', () => {
      console.log('Usuário desconectado:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Server ready on http://${hostname}:${port}`);
    });
});
