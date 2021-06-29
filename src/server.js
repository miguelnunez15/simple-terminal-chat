#!/usr/bin/env node
const { Server } = require('socket.io');
const chalk = require('chalk');
const yargs = require('yargs');
const server = require('http').createServer();
/** @type {Server} */
const io = require('socket.io')(server);

const Chat = require('./chat');

const options = yargs
    .usage('Usage: -p <port>')
    .options('p', { alias: 'port', describe: 'The port the server will be running locally on', type: 'string', demandOption: 'true' })
    .argv;

const chats = [];

io.on('connection', client => {
    client.nickname = client.handshake.query.nickname;
    client.color = client.handshake.query.color ? client.handshake.query.color : '#FF4500'

    let chat = chats.find(c => c.name === client.handshake.query.chat);
    if (!chat) {
        chat = new Chat(client.handshake.query.chat, client);
        chats.push(chat);
    } else {
        chat.addSocket(client);
    }

    client.emit('joined', { success: true, data: chat.getData() });

    client.on('newMessage', msg => {
        chat.sendToGroup(chalk.hex(client.color)(`[${client.nickname}]`) + ` - ${msg.text}`, client);
    });

    client.on('disconnect', msg => {
        const empty = chat.removeSocket(client);
        if (empty) chats.splice(chats.find(c => c.name === chat.name), 1);
    });
});

server.listen(options.port);
console.log(`Listening on ${options.port}`);