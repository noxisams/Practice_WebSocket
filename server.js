// Mise en place d'un serveur avec NodeJs et utilisation des WebSockets natifs

const http = require('http');
const fs = require('fs');
const ws = new require('ws');

const wss = new ws.Server({noServer: true});
const clients = new Set();

let log;
if (!module.parent) {
    log = console.log;
    log('Server started on port 8080');
    log('http://localhost:8080/');
    http.createServer(accept).listen(8080);
} else {
    log = function() {};
    // log = console.log;
    exports.accept = accept;
}

function accept(req, res) {
    if (req.url == '/ws' && req.headers.upgrade &&
        req.headers.upgrade.toLowerCase() == 'websocket' &&
        // can be Connection: keep-alive, Upgrade
        req.headers.connection.match(/\bupgrade\b/i)) {
        wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
    } else if (req.url == '/') { // index.html
        fs.createReadStream('./index.html').pipe(res);
    } else { // page not found
        res.writeHead(404);
        res.end();
    }
}

function onSocketConnect(ws) {
    clients.add(ws);
    log(`new connection`);

    ws.on('message', function(message) {
        log(`message received: ${message}`);

        for (let client of clients) {
            client.send(message.toString());
        }
    });

    ws.on('close', function() {
        log(`connection closed`);
        clients.delete(ws);
    });
}
