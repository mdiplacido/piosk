import * as WebSocket from "ws";

const wss = new WebSocket.Server({ port: 8080 });

// tslint:disable-next-line:no-expression-statement
wss.on('connection', ws => {
    // tslint:disable-next-line:no-expression-statement
    ws.on('message', message => {
        console.log('received: %s', message);
    });

    // tslint:disable-next-line:no-expression-statement
    ws.send('something');
});
