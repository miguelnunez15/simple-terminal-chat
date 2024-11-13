#!/usr/bin/env node
const yargs = require('yargs');
/** @type {io.Socket} */
const io = require('socket.io-client');
const readline = require('readline');

const util = require('./util');
const pjson = require('../package.json');

const chalk = require('chalk'); 

const inquirer = require('inquirer').default;

const readlineSync = require('readline-sync');

const blueDiamond = '\u{1F539}';
const smilingFace = '\u{1F642}';
const confettiBall = '\u{1F38A}';

const notifier = require('node-notifier');

const options = {};
options.ip = "10.0.0.79";
options.nickname = "User";
options.port = "3018";
options.chat = "general";
options.insecure = true;
options.hex = "#FFC0CB";

const pink = chalk.hex('#ff00f0'); 

function selectColor() {
    return inquirer
      .prompt([
        {
          type: 'list',
          name: 'color',
          message: 'Por favor, elige un color para tu nombre:',
          choices: [
            { name: colors.pink, value: '#FFC0CB' },
            { name: colors.blue, value: '#6495ED' },
            { name: colors.green, value: '#32CD32' }
          ]
        }
      ])
      .then((answers) => {
        const selectedColor = chalk.hex(answers.color);
      })
      .catch((error) => {
        console.error('Ha ocurrido un error:', error);
      });
  }


async function getOptions() {
    await selectColor();
}

const colors = {
    pink: chalk.hex('#FFC0CB')('Rosa'),
    blue: chalk.hex('#6495ED')('Azul'),
    green: chalk.hex('#32CD32')('Verde')
  };

// Input de nickname
const questionText = chalk.blueBright(`Please enter your nickname: `);
options.nickname = readlineSync.question(questionText);
console.log(chalk.greenBright(`${smilingFace} Hello, ${options.nickname}! Welcome to our program! ${confettiBall}`));

// getOptions();

console.log(chalk.bold.blueBright("While you're in a chat, you can use the following commands:\n"));

console.log(`${chalk.cyan('/chat <chatname>')} ${chalk.green('->')} ${chalk.gray('leaves the current chat and joins a chat with that chat name')}`);
console.log(`${chalk.cyan('/color <color>')} ${chalk.green('->')} ${chalk.gray("changes your name's color to the chosen color")}`);
console.log(`${chalk.cyan('/nickname <nickname>')} ${chalk.green('->')} ${chalk.gray("changes your nickname to the chosen nickname")}`);
console.log(`${chalk.cyan('/list-chats')} ${chalk.green('->')} ${chalk.gray('lists the available chats on the server')}`);
console.log(`${chalk.cyan('/list-users')} ${chalk.green('->')} ${chalk.gray('lists the users in a chat')}`);
console.log(`${chalk.cyan('/exit')} ${chalk.green('->')} ${chalk.gray('exits the application (cleaner than CTRL+C)')}`);

console.log(!options.insecure && (options.ip.includes('localhost') || options.ip.includes('127.0.0.1')) ? 'You\'re securely trying to connect to a server on this machine, try running client with the -s flag (for http instead of https)' : '');

//VARIABLES
const socket = io(`${options.insecure ? 'http://' : 'https://'}${options.ip}${options.port ? `:${options.port}` : ''}`, {
    timeout: 10000,
    query: {
        nickname: options.nickname,
        chat: options.chat ? options.chat : 'general',
        color: options.hex ? options.hex : '#FFC0CB',
        version: pjson.version
    }
})

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//FUNCTIONS
function log(msg) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(msg);
    rl.prompt(true);
}

function chatCommand(words) {
    const cmd = words[0];

    let obj = {};
    switch (cmd) {
        case 'chat':
            if (!words[1]) return log('Missing <chatname> parameter. (e.g. "/chat general")');
            obj.command = util.COMMANDS.CHAT;
            obj.chat = words[1];
            break;
        case 'color':
            if (!words[1]) return log('Missing <color-hex> parameter. (e.g. "/color #FFAAFF")');
            obj.command = util.COMMANDS.COLOR;
            obj.color = words[1];
            break;
        case 'nickname':
            if (!words[1]) return log('Missing <nickname> parameter. (e.g. "/nickname freek")')
            obj.command = util.COMMANDS.NICKNAME;
            obj.nickname = words[1];
            break;
        case 'list-chats':
            obj.command = util.COMMANDS.LISTCHATS;
            break;
        case 'list-users':
            obj.command = util.COMMANDS.LISTUSERS;
            break;
        case 'exit':
            process.exit();
        default:
            log('Command not found.');
    }
    if (obj.command) socket.emit('command', obj);
}

//LISTENERS
console.log(`Connecting to group [${options.chat ? options.chat : 'general'}] as [${options.nickname}]`);

socket.on('connect_error', error => {
    console.log(`Connection error due to ${error.message}`);
    process.exit();
});

socket.on('joined', msg => {
    if (msg.success) {
        console.log(`Connected to [${msg.data.name}, age: ${msg.data.age}s, admin: ${msg.data.isAdmin ? 'You' : msg.data.admin}] - ${msg.data.users.length} ${msg.data.users.length < 2 ? 'user' : 'users'} online`);
        rl.prompt(true);
    } else {
        console.log(msg.error);
        process.exit();
    }
});

socket.on('message', (message) => {
    console.log(`${chalk.gray(`[${new Date().toLocaleTimeString()}]`)} ${pink(message)}`);
    notifier.notify({
        title: 'Notificación',
        message: 'Acuerdáte de enviar el email.',
        sound: true,
        wait: true
    });
});

socket.on('disconnect', msg => {
    console.log('Connection to server lost, exiting..');
    process.exit();
});

rl.on('line', line => {
    if (line[0] === '/' && line.length > 1) {
        const words = (line.substr(1, line.length - 1)).split(' ');
        chatCommand(words);
    } else {
        readline.moveCursor(process.stdout, 0, -1);
        socket.emit('message', { text: line });
    }

    rl.prompt(true);
});