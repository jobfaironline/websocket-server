import * as ws from "ws";
import * as url from "url";
import fetch from "node-fetch";

/*https://betterprogramming.pub/solving-real-life-problems-in-javascript-sending-server-side-notifications-through-websockets-a3bdb2cc065s
https://stackoverflow.com/questions/70371698/send-a-websocket-message-in-a-route-express-js
 */
export class NotifierService {
    constructor(jobHubConnectionsRepository) {
        this.connections = new Map();
        this.jobHubConnectionsRepository = jobHubConnectionsRepository;
    }

    connect(server) {
        this.server = new ws.WebSocketServer({noServer: true});
        this.interval = setInterval(this.checkAll.bind(this), 10000);
        this.server.on("close", this.close.bind(this));
        this.server.on("connection", this.add.bind(this));
        server.on("upgrade", async (request, socket, head) => {
            console.log("ws upgrade");
            const token = url.parse(request.url, true).query.token;
            const bearer = 'Bearer ' + token;
            const response = await fetch('http://localhost:5000/api/v1/accounts/get-info', {
                method: 'GET',
                withCredentials: true,
                credentials: 'include',
                headers: {
                    'Authorization': bearer,
                    'X-FP-API-KEY': 'iphone', //it can be iPhone or your any other attribute
                    'Content-Type': 'application/json'
                }
            });
            const json = await response.json();
            if (json.id) {
                this.server.handleUpgrade(request, socket, head, (ws) =>
                    this.server.emit("connection", json.id, ws)
                );
            } else {
                socket.destroy();
            }
        });
    }

    async add(receiverId, socket) {
        console.log("ws add", receiverId);
        const data = await this.jobHubConnectionsRepository.createNewNotification(receiverId);
        const connectionId = data.connectionId;

        socket.isAlive = true;
        socket.on("pong", () => (socket.isAlive = true));
        socket.on("close", this.remove.bind(this, connectionId));
        this.connections.set(connectionId, socket);
    }

    async send(receiverId, message) {
        console.log("ws sending message");
        const data = await this.jobHubConnectionsRepository.getNotificationByUserId(receiverId);
        console.log(data)
        const connection = this.connections.get(data.connectionId);
        connection?.send(JSON.stringify(message));
    }

    broadcast(message) {
        console.log("ws broadcast");
        this.connections.forEach((connection) =>
            connection.send(JSON.stringify(message))
        );
    }

    isAlive(id) {
        return !!this.connections.get(id);
    }

    checkAll() {
        this.connections.forEach((connection) => {
            if (!connection.isAlive) {
                return connection.terminate();
            }

            connection.isAlive = false;
            connection.ping("");
        });
    }

    async remove(id) {
        this.connections.delete(id);
        await this.jobHubConnectionsRepository.deleteNotification(id);
    }

    close(id) {
        console.log("ws close")
        console.log(id)
        clearInterval(this.interval);
    }
}