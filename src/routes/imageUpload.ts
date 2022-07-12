const router = require("express").Router();
import { Request, Response } from "express";
const cloudinary = require("cloudinary").v2;
import dotenv from "dotenv";
dotenv.config();
import upload from "../functions/multer";
import { User, Properties, Image } from "../model/Model";
import { Message } from "twilio/lib/twiml/MessagingResponse";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

router.post("/", upload.single("image"), async (req: any, res: Response) => {
  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Create new user
    let user = new Image({
      cloudinary_id: result.public_id,
      propertyImage: result.secure_url,
    });
    // Save user
    await user.save();
    res.json(user);
  } catch (err) {
    console.log(err);
  }
});

// router.get("/", async (req:Request, res:Response) => {
//   try {
//     let user = await Properties.find();
//     res.json(user);
//   } catch (err) {
//     console.log(err);
//   }
// });

router.delete("/delete/:id", async (req: Request, res: Response) => {
  try {
    // Find user by id
    let user: any = await Image.findById(req.params.id);
    // Delete image from cldinary
    await cloudinary.uploader.destroy(user.cloudinary_id);
    // Delete user from db
    await user.remove();
    res.json({ message: "Successfullt deleted" });
  } catch (err) {
    console.log(err);
    res.json({ message: "Can't find image" });
  }
});

// router.put("/update/:id", upload.single("image"), async (req:Request, res:Response) => {
//   try {
//     let user:any = await Image.findById(req.params.id);
//     // Delete image from cloudinary
//     await cloudinary.uploader.destroy(user.cloudinary_id);
//     // Upload image to cloudinary
//     let result;
//     if (req.file) {
//       result = await cloudinary.uploader.upload(req.file.path);
//     }
//     const data = {
//       cloudinary_id: result.public_id || user.cloudinary_id,
//     };
//     user = await Image.findByIdAndUpdate(req.params.id, data, { new: true });
//     res.json(user);
//   } catch (err) {
//     console.log(err);
//   }
// });

// router.get("/:id", async (req, res) => {
//   try {
//     // Find user by id
//     let user = await Properties.findById(req.params.id);
//     res.json(user);
//   } catch (err) {
//     console.log(err);
//   }
// });

export default router;
