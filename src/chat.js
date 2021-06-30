class Chat {
    constructor(name, socket) {
        this.name = name;
        this.sockets = [socket];
        this.admin = socket;
        this.createdAt = new Date();
    }

    addSocket(socket) {
        this.sockets.push(socket);
        this.sendToOtherUsers(`${socket.nickname} joined!`, socket);
    }

    removeSocket(socket) {
        this.sockets.splice(this.sockets.findIndex(s => s.id === socket.id), 1);
        this.sendToAllUsers(`${socket.nickname} left..`);

        if (this.sockets.length === 0) {
            return true;
        } else {
            if (this.admin.id === socket.id) {
                this.admin = this.sockets[0];
                this.sockets[0].emit('message', 'You are now the admin of this chat!');
            }
            return false;
        }
    }

    sendToOtherUsers(text, sender) {
        this.sockets.forEach(s => {
            if (s.id !== sender.id) s.emit('message', text);
        });
    }

    sendToAllUsers(text) {
        this.sockets.forEach(s => s.emit('message', text));
    }

    getData(client) {
        return {
            name: this.name,
            users: Array.from(this.sockets.filter(s => s.nickname !== 'SERVER'), s => s.nickname),
            age: ((new Date()) - this.createdAt) / 1000,
            isAdmin: this.admin.id === client.id,
            admin: this.admin.nickname
        }
    }
}

module.exports = Chat;