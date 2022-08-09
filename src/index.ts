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
import {Storage} from "@google-cloud/storage"
import path from "path"





const app = express();
dotenv.config();
app.use(cors())
app.use(express.json({limit: "2mb"}))
app.use("/image", express.static("uploads"))
app.use(express.urlencoded({
  extended: true
}))



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




const storage = new Storage({
  keyFilename : path.join(__dirname, "../image-upload-358514-053689216333.json"),
  projectId: "image-upload-358514"
});


async function uploadFile(bucketName:string,filePath:string, destFileName:string) {
  await storage.bucket(bucketName).upload(filePath, {
    destination: destFileName,
  });

  console.log(`${filePath} uploaded to ${bucketName}`);
}

app.get("/", async (req:Request,res:Response)=>{

 
  let file = path.join(__dirname, "../uploads/5f1a6e99-9c93-4230-85a2-996e49c7c9ec.jpg")
  let bucket =  "clp-image";
  let name = `${uuid()}.jpg`;

  uploadFile(bucket,file, name).catch(console.error)

  res.send("okk")

})

app.post("/api",(req:Request,res:Response)=>{
  res.send(req)
})


app.listen(process.env.PORT, () => {
    connect();
    console.log(`Server Running at http://127.0.0.1:${process.env.PORT}`);
  });