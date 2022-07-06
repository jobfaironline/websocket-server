import express from "express";

export class Controller {
    constructor(webSocketNotifier, notificationMessageRepository) {
        this.notificationMessageRepository = notificationMessageRepository;
        this.webSocketNotifier = webSocketNotifier;
        this.router = express.Router();
        this._sendNotification();
    }

    getRouter() {
        return this.router;
    }

    _sendNotification() {
        const self = this;
        this.router.post("/notification", async (req, res, next) => {
            const {notificationId} = req.body;
            const notification = await this.notificationMessageRepository.getNotificationById(notificationId);
            self.webSocketNotifier.send(notification.userId, JSON.stringify(notification));
            res.status(200).send();
        });
    }

}