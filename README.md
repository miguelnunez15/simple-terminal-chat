# Terminal Chat
This is a very simple terminal chat application, it contains both the server and client code.  
The package has to be installed globally, by using ```npm i -g simple-terminal-chat```, to be able to use it!

## Server
To setup the server just run ```server -p 3000``` in a terminal

### Arguments
- ```-p, --port``` -> the port on which the server will run (required)

## Client
To run a client, run ```client -i http://127.0.0.1 -p 3000 -n nick -c test -h #FFAAFF``` in a terminal

### Arguments
- ```-i, --ip``` -> the ip-address or domain of the server with HTTP/HTTPS (required)
- ```-p, --port``` -> the port on which the chat server is running (optional)
- ```-n, --nickname``` -> your desired nickname (required)
- ```-c, --chat``` -> the name of the chat that you would like to join (optional, defaults to 'general')
- ```-h, --hex``` -> the hex of the color of your name in chat (optional, defaults to #FF4500)

## TODO
- Commands (e.g. to change color and/or nickname while in chat)
- Passwords for chats
- End-to-end encryption
