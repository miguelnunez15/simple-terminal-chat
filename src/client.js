#!/usr/bin/env node
const yargs = require('yargs');
const io = require('socket.io-client');
const readline = require('readline');

const options = yargs
    .usage('Usage: -i <ip> -p <port> -n <nickname> -c <chat>')
    .options('i', { alias: 'ip', describe: 'The IP-address or Domain of the socket server', type: 'string', demandOption: 'true' })
    .options('p', { alias: 'port', describe: 'The Port the socket server is running on', type: 'string', demandOption: 'true' })
    .options('n', { alias: 'nickname', describe: 'Your Nickname', type: 'string', demandOption: 'true' })
    .options('c', { alias: 'chat', describe: 'The name of the Chat you are trying to join', type: 'string' })
    .options('h', { alias: 'hex', describe: 'The HEX of the color that your name should be (standard is orange)', type: 'string' })
    .argv;

const socket = io(`http://${options.ip}:${options.port}`, {
    query: {
        nickname: options.nickname,
        chat: options.chat ? options.chat : 'general',
        color: options.hex
    }
});
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function log(msg) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(msg);
    rl.prompt(true);
}

console.log(`Connecting to group [${options.chat ? options.chat : 'general'}] as [${options.nickname}]`);
socket.on('joined', msg => {
    if (msg.success) {
        console.log(`Connected to [${msg.data.name}, age: ${msg.data.age}s] - ${msg.data.users.length} users online`);
        rl.prompt(true);
    } else {
        console.log('Could not connect, exiting..');
        process.exit();
    }
});

socket.on('message', msg => log(msg));

rl.on('line', line => {
    if (line[0] === '/' && line.length > 1) {

    } else {
        socket.emit('newMessage', { text: line })
    }

    rl.prompt(true);
});