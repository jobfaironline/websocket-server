import * as mysql from 'mysql';
import {JobHubNotificationsRepository, NotificationMessageRepository} from "./src/repositories.js";
import {server} from "./src/server.js";

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "dbo"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

const port = process.env.WEB_SOCKET_PORT || "4000";


async function start() {
    const notificationMessageRepository = new NotificationMessageRepository(con);
    const jobHubConnectionsRepository = new JobHubNotificationsRepository(con);
    server(jobHubConnectionsRepository, notificationMessageRepository).listen(port)
        .on("listening", () =>
            console.log("info", `HTTP server listening on port ${port}`)
        );

}

start();



