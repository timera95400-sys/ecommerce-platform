import express from "express";
import payload from "payload";
import path from "path";

const app = express();

app.use("/media", express.static(path.resolve(__dirname, "media")));

const start = async () => {
  await payload.init({
    secret: process.env["PAYLOAD_SECRET"] ?? "",
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  const PORT = parseInt(process.env["PORT"] ?? "3001", 10);
  app.listen(PORT, () => {
    payload.logger.info(`Server running on port ${PORT}`);
  });
};

start();
