import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./db/connectDB.js";

dotenv.config({
    path: "./.env",
  });
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({
    origin:process.env.BASE_URL,
    methods:["GET", "POST", "PUT", "DELETE"],
    allowedHeaders:["Content-Type", "Authorization"]
}));


// import routes
import userRoutes from "./routes/user.routes.js";

app.use("/api/v1/users", userRoutes);

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