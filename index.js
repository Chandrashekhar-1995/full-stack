import express, { urlencoded } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/db/connectDB.js";

dotenv.config({
    path: "./.env",
  });
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(urlencoded({extended:true}));
app.use(cors({
    origin:"localhost:3000",
    methods:["GET", "POST", "PUT", "DELETE"],
    allowedHeaders:["Content-Type", "Authorization"]
}));


app.get("/", (req, res)=> {
    res.send("Hello world")
});

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
  })
  .catch((err) => {
    console.error("Mongodb connection error", err);
    process.exit(1);
  });