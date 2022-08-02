import "dotenv/config";
import express, { Application, Request, Response, NextFunction } from "express";
import {User} from "../model/User";
import config from "../config";
import { response } from "../types/types";
import  jwt  from "jsonwebtoken";

const user: Application = express();

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



