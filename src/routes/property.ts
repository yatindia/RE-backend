import express,{Application,Request,Response,NextFunction} from "express";
import {Property} from "../model/Property"
import { response } from "../types/types";
import  jwt  from "jsonwebtoken";
import multer from "multer"
import {v4 as uuid} from "uuid"
import path from "path"
//@ts-ignore
import config from "../../config"
import fs from "fs"

const upload = multer();

async function fielUpload(req:Request, res:Response, next:NextFunction) {
    console.log(  req.body);
    let im = (req.body.image).replace(/^data:image\/png;base64,/, "")
    let buffer = Buffer.from(im,'base64')
    // buffer to image
    let filename = uuid()+".jpg";
    fs.writeFileSync(`${config.maindir}/uploads/${filename}`,buffer)
    req.body.filename = filename

    next()

}



const property:Application = express();


property.use((req:Request, res:Response, next:NextFunction)=>{
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

//Image Upload
property.post("/imageupload",fielUpload, async (req:Request, res:Response) => {

    let value = req.body.filename
    let response:response = {
        message : "File Uploaded Failed",
        status: false
    }
    
    if (value) {
        //* S-Response
        
        response.status = true,
        response.message ="File Uploaded Successfully",
        response.data = value

       
      }
      console.log(value);
      
      res.json(response)

   
})


//CREATE
property.post("/create",async (req:Request, res:Response) => {

    let response:response = {
        message : "somthing went wrong",
        status: false
    }

    try {
        
        await new Property({...req.body.property, owner: req.body.authorization._id })
        .save()
        .catch( error => {
            
            throw new Error(error)
            
        })

        response.message = "Property Saved"
        response.status = true
        

    } catch (error:any) {

        response.message = "Please Enter All Essential Values"
        response.errorMessage = error.message
        
    }

    res.json(response)

});

//UPDATE
property.put("/:id", async (req:Request, res:Response) => {

    let response:response = {
        message : "somthing went wrong",
        status: false
    }

    try {
        
        await Property.findOneAndUpdate(
            {$and: [
                {_id: req.params.id}, 
                {owner: req.body.authorization._id}
            ] },
            {$set: req.body.property}
            )
        .catch( error => {
            
            throw new Error(error)
            
        })

        response.message = "Property Updated"
        response.status = true
        

    } catch (error:any) {

        response.message = "Please Enter All Essential Values"
        response.errorMessage = error.message
        
    }


    res.json(response)
 
});


//READ
property.get("/post/:id",async (req:Request, res:Response) => {
    let response:response = {
        message : "somthing went wrong",
        status: false
    }

    try {
        let data;
        await Property.findById(req.params.id)
        .then(res => {
            data = res
        })
        .catch( error => {
            
            throw new Error(error)
            
        })

        response.message = "Property Fetched"
        response.data = data
        response.status = true
        

    } catch (error:any) {

        response.message = "Please Enter All Essential Values"
        response.errorMessage = error.message
        
    }


    res.json(response)

});

//single user property
property.get("/singleuserproperty/:id",async (req:Request, res:Response) => {
    console.log('kkk')
        let response:response = {
            message : "somthing went wrong",
            status: false
        }
    
        try {
            let data;
            await Property.find({owner:req.params.id})
            .then(res => {
                data = res
            })
            .catch( error => {
                
                throw new Error(error)
                
            })
    
            response.message = "Property Fetched"
            response.data = data
            response.status = true
            
    
        } catch (error:any) {
    
            response.message = "Please Enter All Essential Values"
            response.errorMessage = error.message
            
        }
    
    
        res.json(response)
    
    });

//DELETE
property.delete("/:id", async (req:Request, res:Response) => {

    let response:response = {
        message : "somthing went wrong",
        status: false
    }

    try {
        await Property.findOne( {$and: [
            {_id: req.params.id}, 
            {owner: req.body.authorization._id}
        ] })
        .then( async (res:any) => {
            
            if (res.photos && res.photos !=[]) {
                (res.photos).forEach( (photo:any) => {
                    fs.unlink(`${config.maindir}/uploads/${photo}`, async (err)=>{})
                });
            }

            await Property.findOneAndDelete( {$and: [
                {_id: req.params.id}, 
                {owner: req.body.authorization._id}
            ] })
           
            
        })
        .catch( error => {
            
            throw new Error(error)
            
        })

        response.message = "Property Deleted"
        response.status = true
        

    } catch (error:any) {

        response.message = "Please Enter All Essential Values"
        
    }


    res.json(response)
});


property.post("/search", async (req:Request, res:Response) => {

    let response:response = {
        message : "somthing went wrong",
        status: false
    }

    try {
        let skip = req.body.skip
        let limit = req.body.limit
    
        if (typeof limit == "undefined" || typeof skip == "undefined") {
          
            throw new Error("Please Send SKIP and LIMIT values")
        }
    
    
        let searchEXP = new RegExp(`${req.body.search}`, "i")
        let searchQuery = []

        if (req.body.search) {
            searchQuery.push({address_1 : searchEXP})
            searchQuery.push({address_2 : searchEXP})
            searchQuery.push({country : searchEXP})
            searchQuery.push({state : searchEXP})
            searchQuery.push({city : searchEXP})
            searchQuery.push({year : searchEXP})                
            searchQuery.push({highlights: {$in: [searchEXP]}})         
        }

        req.body.type?  searchQuery.push({type : req.body.type}) : null
        req.body.space_use?  searchQuery.push({space_use : req.body.space_use}) : null
        req.body.for?  searchQuery.push({for : req.body.for}) : null
        req.body.country?  searchQuery.push({country : req.body.country}) : null
        req.body.state?  searchQuery.push({state : req.body.state}) : null
        req.body.city?  searchQuery.push({city : req.body.city}) : null
        req.body.zip_code?  searchQuery.push({zip_code : req.body.zip_code}) : null
     


    
        let partData = await Property.find( {$or: searchQuery}).sort({_id:-1}).limit(limit).skip(skip)
        let count = await Property.find({$or: searchQuery}).sort({_id:-1}).countDocuments()
    
        response = {
            status: true,
            message: "Success",
            data: [
              partData,
              count
            ]
           
          }
    
      } catch (error:any) {

        response.message = error.message
    
      }


    res.json(response)
});



export default property