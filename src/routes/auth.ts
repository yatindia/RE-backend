import express, { Application, Request, Response } from "express";
// import { register } from "../functions/account";
import User from "../model/User";
import sgMail from "@sendgrid/mail";
import config from "../config";
import jwt from "jsonwebtoken";
import mailer from "nodemailer";
var hbs = require("nodemailer-express-handlebars");
var {engine} = require('express-handlebars');

import path from "path";
import { response } from "../types/types";
import { trusted } from "mongoose";
import { UserInfo } from "os";



const auth: Application = express();
auth.use('/src',express.static(path.join(__dirname,'static')));

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

      await createUser.save().then(async () => {
        response.status= true;
        response.message= "Account Created verify before Login verifcation link sent to your email,It will expire in 1 hour";
        
      }).catch((error: any) => {
        response.status = false
        response.message = error.message
    })
      

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
            partialsDir: path.resolve("./src/views/email"),
            defaultLayout: false,
          },
          viewPath: path.resolve("./src/views/email"),
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
      return res.json({
        response
      });

     
    } catch (error:any) {
      response.status = false
        response.message = error.message
      return res.json({
        response
      });
    }
  }
});

auth.get("/verify", async (req: Request, res: Response)=>{

  let response: response = {
      status: false,
      message: "somthing went wrong, try later"
  }

res.setHeader('Content-Type', 'text/html');


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


          auth.engine('handlebars', engine());
          auth.set('view engine', 'handlebars');
          auth.set('views', './src/views');

res.render('main');
          // console.log(__dirname);
          // res.setHeader('Content-Type', 'text/html');
          // res.sendFile(path.join(__dirname, '/index.html'));

          // res.send(`<html lang="en">
       
          // <body>
          // <div>
          //         <h2>E-mail Successfully Verified</h2>
          //         <a href="http//:127.0.0.1.3000/login">back to login</a>
          //     </div>
          // </body>
          // </html>`);
          // res.end()
          // response.status = true;
          // response.message = "successfully Verified";



// auth.engine('handlebars', hbss({defaultLayout: 'main',
// LayoutsDir:path.join(__dirname,'views/verifScss')}));
// auth.set('view engine', 'handlebars');

// res.render('succes');
// auth.use(express.static(path.join(__dirname, 'verifScss')))
// auth.engine('handlebars', hbss({extname: 'handlebars', defaultLayout: 'layout', layoutsDir: __dirname + '/views/'}));
// auth.set('views', path.join(__dirname, 'views/verifScss'));
// auth.set('view engine', 'handlebars');
// res.render('succes');
// res.sendFile(path.join(__dirname + 'src/verifScss/succes'))
// res.setHeader('Content-Type', 'text/html');
// res.sendFile(__dirname + '/succes.html');

// res.writeHead(200, {'Content-Type': 'text/html'})
//   res.write(require('./succes.html'))
//   res.end()

      } else {
          throw new Error("the token is invalid");
          
      }
      

  } catch (error:any) {
     
    response.status = false
    response.message = error.message
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

auth.post("/resetpassword",  async (req: Request, res: Response) =>{
  let response: response = {
      status: false,
      message: "somthing went wrong, try later"
  }

  await User.findOne({email: req.body.email})
  .then(async (res:any)=>{


      if (!res) {
        // console.log('hh')
          throw new Error("user does not exist.");
          
      }
      if (!res.accountVerified) {
          throw new Error("user account not verified.");
          
      }

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
            partialsDir: path.resolve("./src/views/password"),
            defaultLayout: false,
          },
          viewPath: path.resolve("./src/views/password"),
          extName: ".handlebars",
        };

        transporter.use("compile", hbs(handlebarOptions));

        var mailOptions = {
          from: "verify@test.com", // sender address
          to: `${res.email}`, // list of receivers
          subject: "Password Recovery ✔", // Subject line

          template: "password",
          context: {
            link: `${config.API}/auth/verifypassword?token=${token}`,
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

          response.status = true
          response.message = "please check your e-mail To Reset Password"
      
  })
  .catch((error:any)=>{
              
      response = {...response, status: false, message: error.message }
   
  })
     

  res.json(response)
})





auth.post("/reverification",  async (req: any, res: Response) =>{
  
  let response: response = {
    status: false,
    message: "somthing went wrong, try later"
}

try {
  await User.findOne({email: req.body.email})
.then(async (user:any)=>{


    if (!user) {
        throw new Error("user does not exist create new account.");
    }
    if (user && !user.accountVerified) {
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
            partialsDir: path.resolve("./src/views/email"),
            defaultLayout: false,
          },
          viewPath: path.resolve("./src/views/email"),
          extName: ".handlebars",
        };

        transporter.use("compile", hbs(handlebarOptions));

        var mailOptions = {
          from: "verify@test.com", // sender address
          to: `${user.email}`, // list of receivers
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
      response.status= true;
        response.message= "verifcation link sent to your email,It will expire in 1 hour";
      
        
    }})
} catch (error:any) {
  response.status = false
    response.message = error.message
  ;
}
return res.json({
  response
})

})



export default auth;





























//  await transporter.sendMail({
//     from: 'verify@test.com', // sender address
//     to: `${req.body.email}`, // list of receivers
//     subject: "Account Verification ✔", // Subject line
//     text: `<a href="${config.API}/auth/verify?token=${token}"> Click this link to verify </a>`, // plain text body
//     html: `<a href="${config.API}/auth/verify?token=${token}">Click this link to verify </a>`, // html body
//   });
