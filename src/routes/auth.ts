import express, { Application, Request, Response } from "express";
// import { register } from "../functions/account";
import User from "../model/User";
import sgMail from "@sendgrid/mail";
import config from "../config";
import jwt from "jsonwebtoken";
import mailer from "nodemailer";
var hbs = require("nodemailer-express-handlebars");
import path from "path";
import { response } from "../types/types";
import { trusted } from "mongoose";
import { UserInfo } from "os";



const auth: Application = express();

auth.post("/register", async (req: Request, res: Response) => {
  console.log("hhh");

  const emailCheck =
    (await User.findOne({
      email: req.body.email,
    })) || false;

  let response: response = {
    status: false,
    message: "Something Went wrong, Could Not signup at the moment.",
  };

  if (emailCheck !== false) {
    return res.json({
      ...response,
      message: `The email Already Exists Please Signin`,
    });
  } else {
    try {
      let userData = {
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
      };

      const passwordStrengthPattern =
        /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/i;

      const emailPattern = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+/i;

      if (!req.body.email.match(emailPattern)) {
        throw new Error("this is not a valid email address");
      }
      if (!req.body.password.match(passwordStrengthPattern)) {
        throw new Error("weak password");
      }
      let createUser = new User(userData);

      await createUser.save()

      let token = jwt.sign(
        {
          email: req.body.email,
        },
        'process.env.JWT_TOKEN_KEY!'
      );
      (async (err, str) => {
        const transporter = mailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          auth: {
            user: "maci.medhurst97@ethereal.email",
            pass: "hVZ63n8vnVcf6JhhXb",
          },
        });

        const handlebarOptions = {
          viewEngine: {
            extName: ".handlebars",
            partialsDir: path.resolve("./src/views"),
            defaultLayout: false,
          },
          viewPath: path.resolve("./src/views"),
          extName: ".handlebars",
        };

        transporter.use("compile", hbs(handlebarOptions));

        var mailOptions = {
          from: "verify@test.com", // sender address
          to: `${userData.email}`, // list of receivers
          subject: "Account Verification ✔", // Subject line

          template: "email",
          context: {
            link: `${config.API}/auth/verify?token=${token}`,
          },
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      })();

      let response: any = {
        status: true,
        message: "Account Created Please verify before Login",
        msg: userData,
      };
      res.json(response);
    } catch (error) {
      return res.json({
        response,
      });
    }
  }
});

auth.get("/verify", async (req: Request, res: Response)=>{

  let response: response = {
      status: false,
      message: "somthing went wrong, try later"
  }

  try {
      let {token} : any = req.query
      let user:any = jwt.verify(token, 'process.env.JWT_TOKEN_KEY!', (error:any, decode:any)=>{
          if (error) { return false }
          else { return decode }
      })
      user =
    (await User.findOne({
      email: user.email,
    })) || false;

      if (user) {
          console.log(user);
          
          User
          .findByIdAndUpdate(user._id, {accountVerified: true})
          .catch(()=>{throw new Error})

          response.status = true;
          response.message = "successfully Verified";
      } else {
          throw new Error("the token is invalid");
          
      }
      

  } catch (error) {
     
     response
  }

  res.json(response)
})

auth.post('/login', async (req: any, res: Response) => {

  let response: response = {
      status: false,
      message: "somthing went wrong, try later"
  }

  try {

      let loggingUser = await User.findOne({email: req.body.email})

      if (!loggingUser) {
          throw new Error("an account with this email does not exist")
      }

      if (loggingUser.password != req.body.password ) {
          throw new Error("wrong password")
      }else if (loggingUser.accountVerified == false) {
          throw new Error("please verify your account")
      }


      let token = jwt.sign({id:loggingUser._id}, 'process.env.JWT_TOKEN2!');
      console.log(loggingUser,token);
  
      

      await User.findByIdAndUpdate(loggingUser._id, {login_token: token})
      .then(()=>{

          response = {
              status : true,
              message : "logged in",
              data : {token},
          }

      })
      .catch(()=>{
          throw new Error("token authorization failed");
          
      })

  } catch (error:any) {
      response = {
          ...response,
          status : false,
          message : error.message,
      }
  }

  res.json(response)
});




export default auth;





























//  await transporter.sendMail({
//     from: 'verify@test.com', // sender address
//     to: `${req.body.email}`, // list of receivers
//     subject: "Account Verification ✔", // Subject line
//     text: `<a href="${config.API}/auth/verify?token=${token}"> Click this link to verify </a>`, // plain text body
//     html: `<a href="${config.API}/auth/verify?token=${token}">Click this link to verify </a>`, // html body
//   });
