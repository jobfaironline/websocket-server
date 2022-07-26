import * as mysql from "mysql";
import {
  JobHubNotificationsRepository,
  NotificationMessageRepository,
} from "./src/repositories.js";
import { server } from "./src/server.js";

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "dbo",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Database connected!");
});

const port = process.env.WEB_SOCKET_PORT || "4000";
const notificationMessageRepository = new NotificationMessageRepository(con);
const jobHubConnectionsRepository = new JobHubNotificationsRepository(con);

async function start() {
  server(jobHubConnectionsRepository, notificationMessageRepository)
    .listen(port)
    .on("listening", () =>
      console.log("info", `HTTP server listening on port ${port}`)
    );
}

start();

function exitHandler(options, exitCode) {
  jobHubConnectionsRepository.deleteAllConnection();
  if (options.cleanup) console.log("Server closed");
  if (exitCode || exitCode === 0) console.log("Server exit: ", exitCode);
  if (options.exit) {
    setTimeout(() => {
      process.exit();
    }, 100);
  }
}

//do something when app is closing
process.on("exit", exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, { exit: true }));
// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));
//catches uncaught exceptions
process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
