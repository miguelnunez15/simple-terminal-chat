class Chat {
    constructor(name, socket) {
        this.name = name;
        this.sockets = [socket];
        this.createdAt = new Date();
    }

    addSocket(socket) {
        this.sockets.push(socket);
        this.sendToGroup(`${socket.nickname} joined!`, socket);
    }

    removeSocket(socket) {
        this.sockets.splice(this.sockets.findIndex(s => s.id === socket.id), 1);
        this.sendToGroup(`${socket.nickname} left..`, null, true);

        if (this.sockets.length === 0) return true;
        return false;
    }

    sendToGroup(text, sender, override = false) {
        this.sockets.forEach(s => {
            if (override || s.id !== sender.id) s.emit('message', text);
        });
    }

    getData() {
        return {
            name: this.name,
            users: Array.from(this.sockets, s => s.nickname),
            age: (new Date()).getSeconds() - this.createdAt.getSeconds()
        }
    }
}

module.exports = Chat;