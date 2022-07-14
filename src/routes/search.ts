import express, { Application, Request, Response } from "express";
import { Properties } from "../model/Model";

const app = express();

app.post("/search", async (req: Request, res: Response) => {

    try {
        let data = await Properties.find({
            propertyBuyingOption: req.body.buyingOption,
            location: req.body.location,
            tittle: req.body.tittle,
            description: req.body.description,
          });
          if (data) {
            res.send(data);
            // res.status(500).send({ status: false, message: "Can't find property" });
          } else {
            res.send(data)
          }
    } catch (error:any) {
        res.send(error.message)
    }


});

app.get("/search/:key", async (req: Request, res: Response) => {

    try {
        let data = await Properties.find({
            $or: [
              { propertyBuyingOption: { $regex: req.params.key } },
              { location: { $regex: req.params.key } },
              { description: { $regex: req.params.key } },
              { tittle: { $regex: req.params.key } },
            ],
          });
          if (data) {
            res.send(data);
            // res.status(500).send({ status: false, message: "Can't find property" });
          } else {
            res.send(data)
          }
    } catch (error:any) {
        res.send(error.message)
    }

  
});

app.get("/user/:key", async (req: Request, res: Response) => {

    try {
        let data = await Properties.find({
            $or: [{ user_id: { $regex: req.params.key } }],
          });
        
          if (data) {
            res.send(data);
        
            
          } else {
            res.send(data)
            //   .status(500)
            //   .send({ status: false, message: "User doesn't has any property" });
          }
    } catch (error:any) {
        res.send(error.message)
    }

  
});

export default app;
