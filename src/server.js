import {NotifierService} from "./NotifierService.js";
import {Controller} from "./Controller.js";
import express from "express";
import http from "http";
/*

ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'root';

flush privileges;
 */
export const server = (jobHubConnectionsRepository, notificationMessageRepository) => {
    const notifier = new NotifierService(jobHubConnectionsRepository);
    const controller = new Controller(notifier, notificationMessageRepository);
    const app = express();
    app.use(express.json())
    const server = http.createServer(app);
    notifier.connect(server);
    app.use(controller.getRouter());
    return server;
}