const { Client } = require('ssh2');
const readline = require('readline')
const fs = require('fs');

function callShell(command) {
    var response = '';
    var prompt = 0;
    var conn = new Client();
    conn.on('ready', function() {
      console.log('Client :: ready');
      conn.shell(function(err, stream) {
        if (err) throw err;
    
        var rl = readline.createInterface(process.stdin, process.stdout)

        stream.on('close', function() {
          process.stdout.write('Connection closed.')
          console.log('Stream :: close');
          conn.end();
        }).on('data', function(dataBuf) {
            if (dataBuf) {
                let data = dataBuf + '';
                response += data;
                
                console.log('data:' + data + '::');
                if (data.trim().endsWith('$')) {
                    prompt += 1;
                }

                if (prompt >= 2) {
                    console.log('closing stream.. ');
                    stream.end();
                }
            }
        }).stderr.on('data', function(data) {
          process.stderr.write(data);
        });
    
        rl.on('line', function (d) {
            // send data to through the client to the host
            console.log('rl:: ' + d);
            stream.write(d.trim() + '\n')
        });
      
        rl.on('SIGINT', function () {
            // stop input
            process.stdin.pause()
            process.stdout.write('\nEnding session\n')
            rl.close()
      
            // close connection
            stream.end('exit\n')
        });

        if (command && prompt < 2) {
                //stream.write(command.trim() + '\n');
        } 
      });
    }).connect({
        host: '13.234.112.160',
        port: 22,
        username: 'ec2-user',
        //password: 'PASSWORD' // or provide a privateKey
        privateKey: fs.readFileSync('D:/Abiz/Technical/aws/WebKP.pem')
    });

    return response;
}

module.exports = { callShell };