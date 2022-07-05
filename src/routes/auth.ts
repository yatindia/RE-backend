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

var process: NodeJS.Process;

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
      await createUser.save();

      let token = jwt.sign(
        {
          email: req.body.email,
        },
        process.env.JWT_TOKEN_KEY!
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
            partialsDir: path.resolve(".src/views"),
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

export default auth;





























//  await transporter.sendMail({
//     from: 'verify@test.com', // sender address
//     to: `${req.body.email}`, // list of receivers
//     subject: "Account Verification ✔", // Subject line
//     text: `<a href="${config.API}/auth/verify?token=${token}"> Click this link to verify </a>`, // plain text body
//     html: `<a href="${config.API}/auth/verify?token=${token}">Click this link to verify </a>`, // html body
//   });
