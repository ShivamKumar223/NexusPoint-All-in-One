import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import adminRoutes from "./routes/adminRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import connectMongoDB from "./config/db.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());  //This middleware is used to parse incoming JSON request bodies.
app.use(cookieParser());  //This middleware is used to parse incoming cookies request bodies.

app.get('/', (req, res) => {
    res.end("Welcome to DevColab");
})

await connectMongoDB();               //database connection

app.use("/api/admins", adminRoutes);
app.use("/api/members", memberRoutes);

const PORT = process.env.PORT || 7000;

app.listen(PORT, ()=>{
    console.log(`Server run on PORT : ${PORT}`);
})
