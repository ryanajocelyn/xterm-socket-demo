// Node.js WebSocket server script
const http = require('http');
const { Client } = require('ssh2');
const fs = require('fs');

const WebSocketServer = require('websocket').server;

const server = http.createServer();

server.listen(5000);
const wsServer = new WebSocketServer({
    httpServer: server
});

let cmd = '';
var prompt = 0;
var dataSent = 0;
var conn = new Client();

conn.on('ready', function () {
    console.log('Client :: connected');
    conn.shell(function (err, stream) {
        if (err) throw err;

        wsServer.on('request', function (request) {
            const connection = request.accept(null, request.origin);

            stream.on('close', function () {
                process.stdout.write('Connection closed.')
                console.log('Stream :: close');
                conn.end();
            }).on('data', function (dataBuf) {
                if (dataBuf) {
                    let data = dataBuf + '';
                    console.log(data, dataSent);

                    if (dataSent < 2) {
                        data = "\n" + data;
                        console.log('appending new line');
                    } 
                    connection.sendUTF(data);
                    
                    dataSent += 1;
                }
            }).stderr.on('data', function (data) {
                process.stderr.write(data);
            });

            connection.on('message', function (message) {
                let utfMsg = message.utf8Data;
                if (utfMsg == '\r') {
                    utfMsg = '\n';
                    dataSent = 0;

                    if (cmd) {
                        if (cmd == "exit") {
                            console.log("closing stream.. ");
                            stream.end("Closing Stream... ");
                        } else {
                            console.log('Writing...  ', cmd);
                            stream.write(cmd.trim() + utfMsg);
                            cmd = '';
                        }
                    }
                } else {
                    cmd += utfMsg;
                }

            });

            connection.on('close', function (reasonCode, description) {
                console.log('Client has disconnected.');
            });
        });
    });
}).connect({
    host: '65.0.31.164',
    port: 22,
    username: 'ec2-user',
    //password: 'PASSWORD' // or provide a privateKey
    privateKey: fs.readFileSync('D:/Abiz/Technical/aws/WebKP.pem')
});

