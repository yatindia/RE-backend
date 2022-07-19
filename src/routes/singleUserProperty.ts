import express, { Application, Request, Response, NextFunction } from "express";
import {User} from "../model/Users";
import {Property} from "../model/Properties"
import  jwt  from "jsonwebtoken";

const app: Application = express();

app.use(express.urlencoded({ extended: true }));

// app.use((req:Request, res:Response, next:NextFunction)=>{
//     let headers = req.headers['authorization']
//     let bearer:any = headers?.split(" ")
//     let token = bearer[1]

//     jwt.verify(token, process.env.JWT_TOKEN_KEY2!, function(err:any, decoded:any) {
//         if (err) {
            
//             res.json({
//                 status: false,
//                 message: "somthing went wrong, try later",
//             })
            
//         }else{
//             req.body = {
//                 ...req.body,
//                 authorization : {
//                     _id : decoded.id
//                 }
                
//             }
//             next()
            
//         }
//       });


   
// })

app.get("/user/:key", async (req: Request, res: Response) => {

    try {
        const loggeduser =
        (await User.findOne({
          _id: req.params.key,
        })) || false;

        console.log(loggeduser);
        

        if (!loggeduser) {
            throw new Error("User not exist");
          }else{
            let data = await Property.find({
                $or: [{ user_id: { $regex: req.params.key } }],
              });
            
              if (data) {
                res.send(data);
            
                
              } else {
                res.send(data)
                
              }
          }

        
    } catch (err) {throw err}

  
});

export default app