import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ msg: "Lund" });
});

export const handler = serverless(app);
