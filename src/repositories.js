import * as util from "util";
import { v4 as uuidv4 } from "uuid";

export class NotificationMessageRepository {
  constructor(connection) {
    this.connection = connection;
    this.query = util.promisify(connection.query).bind(connection);
  }

  async getAllNotification() {
    const rows = await this.query("select * from `NotificationMessage`");
    return rows;
  }

  async getNotificationById(notificationId) {
    const queryString = `SELECT *
                         FROM NotificationMessage
                         WHERE notificationId = '${notificationId}'`;
    return (await this.query(queryString))[0];
  }
}

export class JobHubNotificationsRepository {
  constructor(connection) {
    this.connection = connection;
    this.query = util.promisify(connection.query).bind(connection);
  }

  async createNewConnection(userId) {
    const connectionId = uuidv4();
    const queryString = `INSERT INTO JobHubConnections (connectionId, userId)
                         VALUES ('${connectionId}', '${userId}')`;
    const result = await this.query(queryString);
    return {
      connectionId,
      userId,
    };
  }

  async deleteConnection(connectionId) {
    const queryString = `DELETE
                         FROM JobHubConnections
                         WHERE connectionId = '${connectionId}'`;
    const result = await this.query(queryString);
  }

  async getConnectionByUserId(userId) {
    const queryString = `SELECT *
                         FROM JobHubConnections
                         WHERE userId = '${userId}'`;
    return (await this.query(queryString))[0];
  }

  async getNotificationByConnectionId(connectionId) {
    const queryString = `SELECT *
                         FROM JobHubConnections
                         WHERE connectionId = '${connectionId}'`;
    return (await this.query(queryString))[0];
  }

  async deleteAllConnection() {
    const queryString = `DELETE
                         FROM JobHubConnections`;
    const result = await this.query(queryString);
  }
}
