import express, { Application, Request, Response } from "express";
import User from "../model/User";
import config from "../config";
import jwt from "jsonwebtoken";
import mailer from "nodemailer";
var hbs = require("nodemailer-express-handlebars");

import dotenv from "dotenv";
dotenv.config();
const jwtToken = process.env.JWT_TOKEN_KEY!;
const jwtToken2 = process.env.JWT_TOKEN_KEY2!;
const jwtOTPToken = process.env.JWT_OTP_KEY!;

import path from "path";
import { response } from "../types/types";

const auth: Application = express();

auth.use(express.urlencoded({ extended: true }));

let twilioNum = process.env.TWILIO_SENDER_NO!;
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = require("twilio")(accountSid, authToken);

auth.post("/sendOTP", async (req, res) => {
  const { phoneNumber } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000); // generate OTP

  console.log(otp);

  client.messages

    .create({
      body: `Your Otp Is  ${otp}`,

      from: twilioNum,

      to: phoneNumber,
    })

    .then((messages: any) => {
      let token = jwt.sign(
        {
          phone:phoneNumber,
        },
        jwtOTPToken,
      );
      res.status(200).json({ phoneNumber, otp ,token });
    })

    .catch((err: any) => {
      console.error("phone : ", err.message);

      return res.json({ error: err.message });
    });
});

auth.get("/checkOTP", async (req, res) => {
  let response: response = {
    status: false,
    message: "Something Went wrong.",
  };
  try {
    let { token }: any = req.query;
    let phoneNumber: any = jwt.verify(token, jwtOTPToken, (error: any, decode: any) => {
      if (error) {
        return false;
      } else {
        return decode;
      }
    });
    const user =
    (await User.findOne({
      phoneNumber
    })) || false;
    console.log(user);
    
  if (user) {
    User.findByIdAndUpdate(user._id, { mobileVerified: true }).catch(() => {
      throw new Error();
    });
    response.status= true,
    response.message = 'Mobile number Authenticated Successfully';
  }}catch (error: any) {
    response.status = false;
    response.message = error.message;
  }
  res.json(response);
})


auth.post("/register", async (req: Request, res: Response) => {
  let response: response = {
    status: false,
    message: "Something Went wrong, Could Not signup at the moment.",
  };

  const emailCheck =
    (await User.findOne({
      email: req.body.email,
    })) || false;



  if (emailCheck !== false) {
    // return res.json({
    //   ...response,
    //   message: `The email Already Exists Please Signin`,

    // });
    // throw new Error("The email Already Exists Please Signin");
    response.message = `The email Already Exists Please Signin`;
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

      await createUser
        .save()
        .then(async () => {
          response.status = true;
          response.message =
            "Account Created verify before Login verifcation link sent to your email,It will expire in 1 hour";
        })
        .catch((error: any) => {
          response.status = false;
          response.message = error.message;
        });

      let token = jwt.sign(
        {
          email: req.body.email,
        },
        jwtToken,
        {
          expiresIn: "1h",
        }
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
      // return res.json({
      //   response
      // });
    } catch (error: any) {
      response.status = false;
      response.message = error.message;
    }
  }
  return res.json({
    response,
  });
});

auth.get("/verify", async (req: Request, res: Response) => {
  let response: response = {
    status: false,
    message: "somthing went wrong, try later",
  };

  // res.setHeader('Content-Type', 'text/html');

  try {
    let { token }: any = req.query;
    let user: any = jwt.verify(token, jwtToken, (error: any, decode: any) => {
      if (error) {
        return false;
      } else {
        return decode;
      }
    });
    user =
      (await User.findOne({
        email: user.email,
      })) || false;

    if (user) {
      console.log(user);

      User.findByIdAndUpdate(user._id, { accountVerified: true }).catch(() => {
        throw new Error();
      });

      // auth.set('view engine', 'ejs');
      // res.render('index');

      auth.set("view engine", "hbs");
      auth.set("views", "./src/views/verifySuccess");
      res.render("index");

      // auth.engine('handlebars', engine());
      // auth.set('views', './src/views');

      // auth.set('view engine', 'hbs');

      // res.render('index');

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
  } catch (error: any) {
    response.status = false;
    response.message = error.message;
  }

  // res.json(response)
});

auth.post("/login", async (req: any, res: Response) => {
  let response: response = {
    status: false,
    message: "somthing went wrong, try later",
  };

  try {
    let loggingUser = await User.findOne({ email: req.body.email });

    if (!loggingUser) {
      throw new Error("an account with this email does not exist");
    }

    if (loggingUser.password != req.body.password) {
      throw new Error("wrong password");
    } else if (loggingUser.accountVerified == false) {
      throw new Error("please verify your account");
    }

    let token = jwt.sign({ id: loggingUser._id }, jwtToken2);
    console.log(loggingUser, token);

    await User.findByIdAndUpdate(loggingUser._id, { login_token: token })
      .then(() => {
        response = {
          status: true,
          message: "logged in",
          data: { token },
        };
      })
      .catch(() => {
        throw new Error("token authorization failed");
      });
  } catch (error: any) {
    response = {
      ...response,
      status: false,
      message: error.message,
    };
  }

  res.json(response);
});

auth.post("/resetpassword", async (req: Request, res: Response) => {
  let response: response = {
    status: false,
    message: "somthing went wrong, try later",
  };

  await User.findOne({ email: req.body.email })
    .then(async (res: any) => {
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
        jwtToken2
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
            link: `${config.API}/auth/passwordquery?token=${token}`,
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

      response.status = true;
      response.message = "please check your e-mail To Reset Password";
    })
    .catch((error: any) => {
      response = { ...response, status: false, message: error.message };
    });

  res.json(response);
});

auth.get("/passwordquery", async (req: Request, res: Response) => {
  let response: response = {
    status: false,
    message: "somthing went wrong, try later",
  };

  // res.setHeader('Content-Type', 'text/html');

  try {
    let { token }: any = req.query;
    let user: any = jwt.verify(token, jwtToken2, (error: any, decode: any) => {
      if (error) {
        return false;
      } else {
        return decode;
      }
    });
    user =
      (await User.findOne({
        email: user.email,
      })) || false;

    if (user) {
      User.findByIdAndUpdate(user._id, { accountVerified: true }).catch(() => {
        throw new Error();
      });
      let newuser = { email: user.email };
      auth.set("view engine", "hbs");
      auth.set("views", "./src/views/passwordUpdate");
      res.render("index", { newuser });
    } else {
      throw new Error("the token is invalid");
    }
  } catch (error: any) {
    response.status = false;
    response.message = error.message;
  }
});

auth.post("/updatepassword", async (req: Request, res: Response) => {
  let response: response = {
    status: false,
    message: "somthing went wrongo, try later",
  };
  console.log(req.body);
  try {
    const passwordStrengthPattern =
      /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/i;
    if (!req.body.password.match(passwordStrengthPattern)) {
      throw new Error("weak password");
    } else {
     let user:any =
      (await User.findOne({
        email: req.body.email,
      }));
      await User.findByIdAndUpdate(user._id, {
        password: req.body.password,
      });

      response.message = "Password Updated Successfully";
    }
  } catch (error: any) {
    response.status = false;
    response.message = error.message;
  }

  res.json(response);
});

auth.post("/reverification", async (req: any, res: Response) => {
  let response: response = {
    status: false,
    message: "somthing went wrong, try later",
  };

  try {
    await User.findOne({ email: req.body.email }).then(async (user: any) => {
      if (!user) {
        throw new Error("user does not exist create new account.");
      }
      if (user && !user.accountVerified) {
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
        response.status = true;
        response.message =
          "verifcation link sent to your email,It will expire in 1 hour";
      }
    });
  } catch (error: any) {
    response.status = false;
    response.message = error.message;
  }
  return res.json({
    response,
  });
});

export default auth;



