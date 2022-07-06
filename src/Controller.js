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
        function delay(delayInms) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(2);
                }, delayInms);
            });
        }


        const self = this;
        this.router.post("/notification", async (req, res, next) => {
            const {notificationId} = req.body;
            await delay(1000);
            const notification = await this.notificationMessageRepository.getNotificationById(notificationId);
            console.log(notification)
            self.webSocketNotifier.send(notification.userId, JSON.stringify(notification));
            res.status(200).send();
        });
    }

}