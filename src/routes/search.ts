import express, { Application, Request, Response } from "express";
import { Property } from "../model/Properties";

const app = express();

app.post("/search", async (req: Request, res: Response) => {

    try {
        let data = await Property.find({
            propertyBuyingOption: req.body.buyingOption,
            location: req.body.location,
            tittle: req.body.tittle,
            description: req.body.description,
          });
          if (data) {
            res.send(data);
            
          } else {
            res.send(data)
          }
    } catch (error:any) {
        res.send(error.message)
    }


});

app.get("/search/:key", async (req: Request, res: Response) => {

    try {
        let data = await Property.find({
            $or: [
              { propertyBuyingOption: { $regex: req.params.key } },
              { location: { $regex: req.params.key } },
              { description: { $regex: req.params.key } },
              { tittle: { $regex: req.params.key } },
            ],
          });
          if (data) {
            res.send(data);
           
          } else {
            res.send(data)
          }
    } catch (error:any) {
        res.send(error.message)
    }

  
});

app.get("/findSigleProperty/:id", async (req:Request, res:Response) => {
  try {
    const property = await Property.findById(req.params.id);
    res.status(200).json(property);
  } catch (err) {throw err;
  }
});

// .status(500)
// .send({ status: false, message: "User doesn't has any property" });
// res.status(500).send({ status: false, message: "Can't find property" });
// res.status(500).send({ status: false, message: "Can't find property" });



export default app;
