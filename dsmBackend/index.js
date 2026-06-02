import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import app from "./src/app.js";
import logger from "./src/utils/logger.js";
import DB from "./src/config/database.js";
import "./src/utils/cron.js";
import { connectRedis } from "./src/config/redis.js"; 
import {Server} from "socket.io";
import { ChatSocket } from "./src/Socket/chat.socket.js";
import { seedRoles } from "./src/utils/seeder.js";

const startServer = async () => {
  // Wait for DB before accepting requests
  await DB();
  await seedRoles();

  // Connect to Redis in background — never blocks startup
  connectRedis().catch(() => {
    logger.warn("Redis could not be connected. Proceeding without Redis.");
  });

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  app.set("io", io);
  new ChatSocket(io);
};

startServer();
