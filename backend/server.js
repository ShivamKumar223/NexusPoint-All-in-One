import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import masterAdminRoutes from "./routes/masterAdminRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import pmRoutes from "./routes/projectManagerRoutes.js"
import tmownerRoutes from "./routes/teamOwnerRoutes.js"
import employeeRoutes from "./routes/employeeRoutes.js"

dotenv.config();

const app = express();
app.use(express.json());  //This middleware is used to parse incoming JSON request bodies.


const allowedOrigins = ['https://devcolab.netlify.app', 'http://localhost:5173'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true 
}));


app.use(cookieParser());  //This middleware is used to parse incoming cookies request bodies.

app.get('/', (req, res) => {
    res.end("Welcome to DevColab");
})

await connectDB();               //database connection

app.use("/api/master-admin", masterAdminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/project-manager", pmRoutes);
app.use("/api/team-owner", tmownerRoutes);
app.use("/api/employee", employeeRoutes);

const PORT = process.env.PORT || 7000;

app.listen(PORT, ()=>{
    console.log(`Server run on PORT : ${PORT}`);
})
