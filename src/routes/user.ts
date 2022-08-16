import "dotenv/config";
import express, { Application, Request, Response, NextFunction } from "express";
import {User} from "../model/User";
import { response } from "../types/types";
import  jwt  from "jsonwebtoken";
import {v4 as uuid} from "uuid"
import {Storage} from "@google-cloud/storage"
import fs from "fs"
import path from "path"

//@ts-ignore
import config from "../../config";
const user: Application = express();

const storage = new Storage({
  keyFilename : path.join(__dirname, "../../image-upload-358514-053689216333.json"),
  projectId: "image-upload-358514"
});

async function fielUpload(req:Request, res:Response, next:NextFunction) {
  let im = (req.body.image).replace(/^data:image\/png;base64,/, "")
  // let img = (req.body.image).replace(/^data:image\/jpeg;base64,/, "")

  
  let finalImage = im
  let buffer = Buffer.from( finalImage,'base64')
  // buffer to image
  let filename = uuid()+".jpg";
  fs.writeFileSync(`${config.maindir}/uploads/${filename}`,buffer)
  req.body.filename = filename

  next()

}

async function uploadFile(bucketName:string,filePath:string, destFileName:string) {
  await storage.bucket(bucketName).upload(filePath, {
    destination: destFileName,
  });

}

//Image Upload
user.post("/imageupload",fielUpload, async (req:Request, res:Response) => {

  let value = req.body.filename
  let response:response = {
      message : "File Uploaded Failed",
      status: false
  }
  
  if (value) {
      
      let file = path.join(__dirname, `../../uploads/${value}`)
      let bucket =  "clp-profile-image";
      let name = value;

      uploadFile(bucket,file, name)
      .then(()=>{
          fs.unlink(file, ()=>{})
      })
      .catch(console.error)
      
      response.status = true,
      response.message ="File Uploaded Successfully",
      response.data = value
      

     
    }

    
    res.json(response)

 
})


//Image Upload
user.post("/imageupdate",fielUpload, async (req:Request, res:Response) => {

  let value = req.body.filename
  let _id = req.body._id
  let response:response = {
      message : "File Update Failed",
      status: false
  }
  
  
  if (value) {
      
      let file = path.join(__dirname, `../../uploads/${value}`)
      let bucket =  "clp-profile-image";
      let name = value;

      await User.findByIdAndUpdate( _id, { profile: name})
      .then(async ()=>{

        let check =  await  uploadFile(bucket,file, name)
        return check
      })

      .then(()=>{
          fs.unlink(file, ()=>{})
      })
      .catch(console.error)
      .finally(()=>{
          response.status = true,
          response.message = "Profile photo Update Successful",
          response.data = value

          res.json(response)
      })


    }
    
})


user.use(express.urlencoded({ extended: true }));


user.use((req:Request, res:Response, next:NextFunction)=>{
    let headers = req.headers['authorization']
    let bearer:any = headers?.split(" ")
    let token = bearer[1]

    jwt.verify(token, process.env.JWT_TOKEN_KEY2!, function(err:any, decoded:any) {
        if (err) {
            
            res.json({
                status: false,
                message: "somthing went wrong, try later",
            })
            
        }else{
            req.body = {
                ...req.body,
                authorization : {
                    _id : decoded.id
                }
                
            }
            next()
            
        }
      });

})


user.post("/", async (req: any, res: Response)=>{

  let response: response = {
    status: false,
    message: "somthing went wrong, try later",
  };

  try {
    let loggingUser = await User.findById(req.body.authorization._id, {
      password: 0
    } );

    if (!loggingUser) {
      throw new Error("this account does not exist");
    }else if (loggingUser.accountVerified == false) {
      throw new Error("please verify your account");
    }else {
      response.data = loggingUser
      response.status = true
      response.message = "Logged in"
    }

  } catch (error: any) {
    response = {
      ...response,
      status: false,
      message: error.message,
    };
  }

  res.json(response);
})


user.get("/", async (req: any, res: Response)=>{

  let response: response = {
    status: false,
    message: "somthing went wrong, try later",
  };

  try {
    let loggingUser = await User.findById(req.body._id, {
      password: 0
    } );

    if (!loggingUser) {
      throw new Error("this account does not exist");
    }else if (loggingUser.accountVerified == false) {
      throw new Error("please verify your account");
    }else {
      response.data = loggingUser
      response.status = true
      response.message = "Logged in"
    }

  } catch (error: any) {
    response = {
      ...response,
      status: false,
      message: error.message,
    };
  }

  res.json(response);
})


user.post("/emailupdate", async (req: any, res: Response)=>{

  let response: response = {
    status: false,
    message: "somthing went wrong, try later",
  };

  try {
    await User.findByIdAndUpdate(req.body.authorization._id, {$set: {
      email: req.body.email,
      accountVerified: false
    }})
    .then(res => {
      response.status = true
      response.message = "Update successful, Please verify the email"
    })
    .catch(()=>{
      response = {
        ...response,
        status: false,
        message: "somthing went wrong, try later",
      };
    })


  } catch (error: any) {
    response = {
      ...response,
      status: false,
      message: error.message,
    };
  }

  res.json(response);
})

user.post("/passwordupdate", async (req: any, res: Response)=>{

  let response: response = {
    status: false,
    message: "somthing went wrong, try later",
  };

  let theUser = await User.findById(req.body.authorization._id );

  try {

    if (theUser?.password != req.body.oldPassword){
      throw new Error("Wrong Old Password");
      
    }
    await User.findByIdAndUpdate(req.body.authorization._id, {$set: {
      password: req.body.newPassword
    }})
    .then(res => {
      response.status = true
      response.message = "Password Updated"
    })
    .catch(()=>{
      response = {
        ...response,
        status: false,
        message: "somthing went wrong, try later",
      };
    })


  } catch (error: any) {
    response = {
      ...response,
      status: false,
      message: error.message,
    };
  }

  res.json(response);
})




export default user;



