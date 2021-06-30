#!/usr/bin/env node
const { Server } = require('socket.io');
const chalk = require('chalk');
const yargs = require('yargs');
const server = require('http').createServer();
/** @type {Server} */
const io = require('socket.io')(server);

const Chat = require('./chat');
const util = require('./util');

// VARIABLES
const options = yargs
.usage('Usage: -p <port>')
.options('p', { alias: 'port', describe: 'The port the server will be running locally on', type: 'string', demandOption: 'true' })
    .argv;

const chats = [];

//FUNCTIONS
/**
 * 
 * @param {string} name 
 * @param {Server} client
 * @returns {Chat}
 */
function getOrCreateChat(name, client) {
    let chat = chats.find(c => c.name === name);
    if (!chat) {
        chat = new Chat(name, client);
        chats.push(chat);
    } else {
        chat.addSocket(client);
    }
    return chat;
}

function removeClientFromChat(chat, client) {
    const empty = chat.removeSocket(client);
    if (empty) chats.splice(chats.find(c => c.name === chat.name), 1);
}

//LISTENERS
io.on('connection', client => {
    client.nickname = client.handshake.query.nickname;
    client.color = client.handshake.query.color;
    console.log(`[${chalk.hex(client.color)(client.nickname)}] is connecting...`);

    let chat = getOrCreateChat(client.handshake.query.chat, client);

    client.on('message', msg => {
        chat.sendToAllUsers(`[${chalk.hex(client.color)(client.nickname)}] - ${msg.text}`, client);
    });

    client.on('command', msg => {
        switch (msg.command) {
            case util.COMMANDS.CHAT:
                if (msg.chat === chat.name) return client.emit('message', 'You are already in that chat.');

                const oldName = chat.name;
                removeClientFromChat(chat, client);
                chat = getOrCreateChat(msg.chat, client);
                client.emit('message', `Left [${oldName}] and joined [${msg.chat}]!`);
                break;
            case util.COMMANDS.COLOR:
                if (msg.color === client.color) return client.emit('message', `[${chalk.hex(client.color)(client.color)}] is already your color!`);

                const oldColor = client.color;
                client.color = msg.color;
                client.emit('message', `Your color is now [${chalk.hex(client.color)(client.color)}]`);
                chat.sendToOtherUsers(`[${chalk.hex(oldColor)(client.nickname)}] -> [${chalk.hex(client.color)(client.nickname)}]`, client);
                break;
            case util.COMMANDS.NICKNAME:
                if (msg.nickname === client.nickname) return client.emit('message', `[${chalk.hex(client.color)(client.nickname)}] is already your nickname!`);

                const oldNickname = client.nickname;
                client.nickname = msg.nickname;
                client.emit('message', `Your nickname is now [${chalk.hex(client.color)(client.nickname)}]`);
                chat.sendToOtherUsers(`[${chalk.hex(client.color)(oldNickname)}] -> [${chalk.hex(client.color)(client.nickname)}]`, client);
                break;
            default:
                client.emit('message', 'Command not found.');
        }
    });

    client.on('disconnect', msg => {
        console.log(`[${chalk.hex(client.color)(client.nickname)}] has disconnected...`);
        removeClientFromChat(chat, client);
    });

    client.emit('joined', { success: true, data: chat.getData() });
});

server.listen(options.port);
console.log(`Listening on ${options.port}`);