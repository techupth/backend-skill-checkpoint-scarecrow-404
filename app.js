import express from "express";
import { client } from "./utils/db.js";
import cors from "cors";
import bodyParser from "body-parser";
import topicsRouter from "./apps/topics.js";
import answersRouter from "./apps/answer.js";

async function init() {
  const app = express();
  const port = 4000;
  try {
    await client.connect();
    console.log(`connect to Database successfully`);
  } catch (err) {
    console.error(`Database connection error ${err}`);
  }

  app.use(cors());
  app.use(bodyParser.json());

  app.use("/topics", topicsRouter);
  app.use("/topics", answersRouter);
  app.get("/", (req, res) => {
    return res.json("Hello Skill Checkpoint #2");
  });

  app.get("*", (req, res) => {
    return res.status(404).json("Not found");
  });

  app.listen(port, () => {
    console.log(`this is port ${port}`);
  });
}

init();
