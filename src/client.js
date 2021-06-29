#!/usr/bin/env node
const yargs = require('yargs');
const io = require('socket.io-client');
const readline = require('readline');

const options = yargs
    .usage('Usage: -i <ip> -n <nickname> -p <port> -c <chat> -h <hex> -s <secure>')
    .options('i', { alias: 'ip', describe: 'The IP-address or Domain of the socket server', type: 'string', demandOption: 'true' })
    .options('n', { alias: 'nickname', describe: 'Your Nickname', type: 'string', demandOption: 'true' })
    .options('p', { alias: 'port', describe: 'The Port the socket server is running on', type: 'string' })
    .options('c', { alias: 'chat', describe: 'The name of the Chat you are trying to join (defaults to "general")', type: 'string' })
    .options('h', { alias: 'hex', describe: 'The HEX of the color that your name should be (defaults to #FF4500)', type: 'string' })
    .options('s', { alias: 'insecure', describe: 'Whether the connection is to be insecure or not, http vs. https (defaults to false, https)', type: 'boolean' })
    .argv;

console.log(!options.insecure && (options.ip.includes('localhost') || options.ip.includes('127.0.0.1')) ? 'You\'re securely trying to connect to a server on this machine, try running client with the -s flag (for http instead of https)' : '');
const socket = io(`${options.insecure ? 'http://' : 'https://'}${options.ip}${options.port ? `:${options.port}` : ''}`, {
    query: {
        nickname: options.nickname,
        chat: options.chat ? options.chat : 'general',
        color: options.hex ? options.hex : undefined
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

socket.on('disconnect', msg => {
    console.log('Connection to server lost, exiting..');
    process.exit();
});

rl.on('line', line => {
    if (line[0] === '/' && line.length > 1) {

    } else {
        socket.emit('newMessage', { text: line })
    }

    rl.prompt(true);
});