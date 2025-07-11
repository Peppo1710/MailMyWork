import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// import handler from "./emailer.js"; // adjust path if needed

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // to parse JSON request body
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // or restrict to your extension origin
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// app.post("/api/todos", async (req, res) => {
//   await handler(req, res);
// });
app.get("/", async (req, res) => {
  res.json({
    msg: "Lund"
  });
});

export default app;

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
