import express, { urlencoded } from "express";
import cors from "cors";

const app = express();
const port = 3000;
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

app.listen(port, ()=>{
    console.log("Server on running on port: ", port);
    
});