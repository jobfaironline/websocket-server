import express from "express";

const NOTIFICATION_TYPE = {
  0: "NOTI",
  1: "VISIT_JOB_FAIR",
  2: "VISIT_JOB_FAIR_BOOTH",
  3: "WAITING_ROOM",
  4: "INTERVIEW_ROOM",
  5: "KICK_USER",
};

async function delay(delayInms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
}

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
      const { notificationId } = req.body;
      let notification =
        await this.notificationMessageRepository.getNotificationById(
          notificationId
        );
      let count = 0;
      while (notification === undefined && count < 5) {
        await delay(100);
        notification =
          await this.notificationMessageRepository.getNotificationById(
            notificationId
          );
        count++;
      }
      if (notification === undefined) return;
      if (
        notification.notificationType !== undefined &&
        notification.notificationType !== null
      )
        notification.notificationType =
          NOTIFICATION_TYPE[notification?.notificationType];
      self.webSocketNotifier.send(notification.userId, notification);
      res.status(200).send();
    });
  }
}
