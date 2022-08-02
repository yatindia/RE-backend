import express , {Request,Response} from "express";
import cors from "cors"
import dotenv from "dotenv";
import mongoose from "mongoose";
import auth from "./routes/auth"
import user from "./routes/user"
import property from "./routes/property";
import multer from "multer";
import config from "../config";
import {v4 as uuid} from "uuid"
import { response } from "./types/types";




const app = express();
dotenv.config();
app.use(cors())
app.use(express.json({limit: "2mb"}))
app.use("/image", express.static("uploads"))




const connect = () => {
  try { mongoose.connect(`mongodb+srv://${process.env.MONGO_USERID}:${process.env.MONGO_PASSWORD}@cluster0.segtq.mongodb.net/test`);
    console.log("Connected to mongoDB.");
  } catch (error) {
    throw error;
  }
};

app.use("/auth",auth)
app.use("/user",user)
app.use("/property", property)








app.get("/",(req:Request,res:Response)=>{
  res.send("okk")
})


app.listen(process.env.PORT, () => {
    connect();
    console.log(`Server Running at http://127.0.0.1:${process.env.PORT}`);
  });