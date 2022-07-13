import express , {Request,Response} from "express";
import cors from "cors"
import dotenv from "dotenv";
import mongoose from "mongoose";
import auth from "./routes/auth"
import property from "./routes/property";
import imageupload from "./routes/imageUpload";




const app = express();
dotenv.config();
app.use(express.json())
app.use(cors())

const connect = () => {
  try { mongoose.connect(`mongodb+srv://${process.env.MONGO_USERID}:${process.env.MONGO_PASSWORD}@cluster0.segtq.mongodb.net/test`);
    console.log("Connected to mongoDB.");
  } catch (error) {
    throw error;
  }
};

app.use("/auth",auth)
app.use("/property", property)
app.use("/imageupload", imageupload)



app.get("/",(req:Request,res:Response)=>{
  res.send("okk")
})


app.listen(process.env.PORT, () => {
    connect();
    console.log(`Server Running at http://127.0.0.1:${process.env.PORT}`);
  });