import express,{Application,Request,Response,NextFunction} from "express";
import {Property} from "../model/Properties"
import {User} from "../model/Users";
import { response } from "../types/types";
import  jwt  from "jsonwebtoken";




const favourite:Application = express();

favourite.use(express.urlencoded({ extended: true }));


favourite.use((req:Request, res:Response, next:NextFunction)=>{
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

favourite.put("/addproperty",async (req:Request, res:Response) => {

    

    let response: response = {
      status: false,
      message: "Something Went wrong.",
    };

    let property_id = await req.body.favouritproperty;

    try {
        const loggeduser:any =
        (await User.findOne({
          _id: req.body.authorization._id,
        })) || false;

        if (!loggeduser) {
            throw new Error("User not exist");
          }else{
            await User.findByIdAndUpdate(loggeduser._id,{$push: {favourite: 
                {property_id}}}, 
                {new: true},(err)=>{
                    if(err){
                        throw new Error("Something Went wrong.");
                        
                    }else{
                        response = {
                            status: true,
                            message: "Property saved as favourite.",
                          }; 
                    }
                })
            
          }
        
    } catch (error:any) {
        response = {
            ...response,
            status: false,
            message: error.message,
          };
    }
   
   res.json({
      response
    })
    
  
  });

  favourite.get("/ownfanvourites" , async(req:Request,res:Response) => {
try {
    const loggeduser:any =
        (await User.findOne({
          _id: req.body.authorization._id,
        })) || false;

        if (!loggeduser) {
            throw new Error("User not exist");
          }else{
            res.json(loggeduser.favouriteProperties)
          }


} catch (error) {throw error}
    

  })