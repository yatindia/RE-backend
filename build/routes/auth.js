"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../model/User");
const config_1 = __importDefault(require("../config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
var hbs = require("nodemailer-express-handlebars");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jwtToken = process.env.JWT_TOKEN_KEY;
const jwtToken2 = process.env.JWT_TOKEN_KEY2;
const jwtOTPToken = process.env.JWT_OTP_KEY;
const path_1 = __importDefault(require("path"));
const auth = (0, express_1.default)();
auth.use(express_1.default.urlencoded({ extended: true }));
let twilioNum = process.env.TWILIO_SENDER_NO;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
auth.post("/sendOTP", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // generate OTP
    console.log(otp);
    client.messages
        .create({
        body: `Your Otp Is  ${otp}`,
        from: twilioNum,
        to: phoneNumber,
    })
        .then((messages) => {
        let token = jsonwebtoken_1.default.sign({
            phone: phoneNumber,
        }, jwtOTPToken);
        res.status(200).json({ phoneNumber, otp, token });
    })
        .catch((err) => {
        console.error("phone : ", err.message);
        return res.json({ error: err.message });
    });
}));
auth.get("/checkOTP", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        status: false,
        message: "Something Went wrong.",
    };
    try {
        let { token } = req.query;
        let phoneNumber = jsonwebtoken_1.default.verify(token, jwtOTPToken, (error, decode) => {
            if (error) {
                return false;
            }
            else {
                return decode;
            }
        });
        const user = (yield User_1.User.findOne({
            phoneNumber
        })) || false;
        console.log(user);
        if (user) {
            User_1.User.findByIdAndUpdate(user._id, { mobileVerified: true }).catch(() => {
                throw new Error();
            });
            response.status = true,
                response.message = 'Mobile number Authenticated Successfully';
        }
    }
    catch (error) {
        response.status = false;
        response.message = error.message;
    }
    res.json(response);
}));
auth.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        status: false,
        message: "Something Went wrong, Could Not signup at the moment.",
    };
    const emailCheck = (yield User_1.User.findOne({
        email: req.body.email,
    })) || false;
    if (emailCheck !== false) {
        // return res.json({
        //   ...response,
        //   message: `The email Already Exists Please Signin`,
        // });
        // throw new Error("The email Already Exists Please Signin");
        response.message = `The email Already Exists Please Signin`;
    }
    else {
        try {
            let userData = {
                name: req.body.name,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                password: req.body.password,
            };
            const passwordStrengthPattern = /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/i;
            const emailPattern = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+/i;
            if (!req.body.email.match(emailPattern)) {
                throw new Error("this is not a valid email address");
            }
            if (!req.body.password.match(passwordStrengthPattern)) {
                throw new Error("weak password");
            }
            let createUser = new User_1.User(userData);
            yield createUser
                .save()
                .then(() => __awaiter(void 0, void 0, void 0, function* () {
                response.status = true;
                response.message =
                    "Account Created verify before Login verifcation link sent to your email,It will expire in 1 hour";
            }))
                .catch((error) => {
                response.status = false;
                response.message = error.message;
            });
            let token = jsonwebtoken_1.default.sign({
                email: req.body.email,
            }, jwtToken, {
                expiresIn: "1h",
            });
            ((err, str) => __awaiter(void 0, void 0, void 0, function* () {
                const transporter = nodemailer_1.default.createTransport({
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
                        partialsDir: path_1.default.resolve("./src/views/email"),
                        defaultLayout: false,
                    },
                    viewPath: path_1.default.resolve("./src/views/email"),
                    extName: ".handlebars",
                };
                transporter.use("compile", hbs(handlebarOptions));
                var mailOptions = {
                    from: "verify@test.com",
                    to: `${userData.email}`,
                    subject: "Account Verification ✔",
                    template: "email",
                    context: {
                        link: `${config_1.default.API}/auth/verify?token=${token}`,
                    },
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log("Email sent: " + info.response);
                    }
                });
            }))();
            // return res.json({
            //   response
            // });
        }
        catch (error) {
            response.status = false;
            response.message = error.message;
        }
    }
    return res.json({
        response,
    });
}));
auth.get("/verify", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        status: false,
        message: "somthing went wrong, try later",
    };
    // res.setHeader('Content-Type', 'text/html');
    try {
        let { token } = req.query;
        let user = jsonwebtoken_1.default.verify(token, jwtToken, (error, decode) => {
            if (error) {
                return false;
            }
            else {
                return decode;
            }
        });
        user =
            (yield User_1.User.findOne({
                email: user.email,
            })) || false;
        if (user) {
            console.log(user);
            User_1.User.findByIdAndUpdate(user._id, { accountVerified: true }).catch(() => {
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
        }
        else {
            throw new Error("the token is invalid");
        }
    }
    catch (error) {
        response.status = false;
        response.message = error.message;
    }
    // res.json(response)
}));
auth.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        status: false,
        message: "somthing went wrong, try later",
    };
    try {
        let loggingUser = yield User_1.User.findOne({ email: req.body.email });
        if (!loggingUser) {
            throw new Error("an account with this email does not exist");
        }
        if (loggingUser.password != req.body.password) {
            throw new Error("wrong password");
        }
        else if (loggingUser.accountVerified == false) {
            throw new Error("please verify your account");
        }
        let token = jsonwebtoken_1.default.sign({ id: loggingUser._id }, jwtToken2);
        console.log(loggingUser, token);
        yield User_1.User.findByIdAndUpdate(loggingUser._id, { login_token: token })
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
    }
    catch (error) {
        response = Object.assign(Object.assign({}, response), { status: false, message: error.message });
    }
    res.json(response);
}));
auth.post("/resetpassword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        status: false,
        message: "somthing went wrong, try later",
    };
    yield User_1.User.findOne({ email: req.body.email })
        .then((res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!res) {
            // console.log('hh')
            throw new Error("user does not exist.");
        }
        if (!res.accountVerified) {
            throw new Error("user account not verified.");
        }
        let token = jsonwebtoken_1.default.sign({
            email: req.body.email,
        }, jwtToken2);
        ((err, str) => __awaiter(void 0, void 0, void 0, function* () {
            const transporter = nodemailer_1.default.createTransport({
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
                    partialsDir: path_1.default.resolve("./src/views/password"),
                    defaultLayout: false,
                },
                viewPath: path_1.default.resolve("./src/views/password"),
                extName: ".handlebars",
            };
            transporter.use("compile", hbs(handlebarOptions));
            var mailOptions = {
                from: "verify@test.com",
                to: `${res.email}`,
                subject: "Password Recovery ✔",
                template: "password",
                context: {
                    link: `${config_1.default.API}/auth/passwordquery?token=${token}`,
                },
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log("Email sent: " + info.response);
                }
            });
        }))();
        response.status = true;
        response.message = "please check your e-mail To Reset Password";
    }))
        .catch((error) => {
        response = Object.assign(Object.assign({}, response), { status: false, message: error.message });
    });
    res.json(response);
}));
auth.get("/passwordquery", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        status: false,
        message: "somthing went wrong, try later",
    };
    // res.setHeader('Content-Type', 'text/html');
    try {
        let { token } = req.query;
        let user = jsonwebtoken_1.default.verify(token, jwtToken2, (error, decode) => {
            if (error) {
                return false;
            }
            else {
                return decode;
            }
        });
        user =
            (yield User_1.User.findOne({
                email: user.email,
            })) || false;
        if (user) {
            User_1.User.findByIdAndUpdate(user._id, { accountVerified: true }).catch(() => {
                throw new Error();
            });
            let newuser = { email: user.email };
            auth.set("view engine", "hbs");
            auth.set("views", "./src/views/passwordUpdate");
            res.render("index", { newuser });
        }
        else {
            throw new Error("the token is invalid");
        }
    }
    catch (error) {
        response.status = false;
        response.message = error.message;
    }
}));
auth.post("/updatepassword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        status: false,
        message: "somthing went wrongo, try later",
    };
    console.log(req.body);
    try {
        const passwordStrengthPattern = /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/i;
        if (!req.body.password.match(passwordStrengthPattern)) {
            throw new Error("weak password");
        }
        else {
            let user = (yield User_1.User.findOne({
                email: req.body.email,
            }));
            yield User_1.User.findByIdAndUpdate(user._id, {
                password: req.body.password,
            });
            response.message = "Password Updated Successfully";
        }
    }
    catch (error) {
        response.status = false;
        response.message = error.message;
    }
    res.json(response);
}));
auth.post("/reverification", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        status: false,
        message: "somthing went wrong, try later",
    };
    try {
        yield User_1.User.findOne({ email: req.body.email }).then((user) => __awaiter(void 0, void 0, void 0, function* () {
            if (!user) {
                throw new Error("user does not exist create new account.");
            }
            if (user && !user.accountVerified) {
                let token = jsonwebtoken_1.default.sign({
                    email: req.body.email,
                }, process.env.JWT_TOKEN_KEY);
                ((err, str) => __awaiter(void 0, void 0, void 0, function* () {
                    const transporter = nodemailer_1.default.createTransport({
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
                            partialsDir: path_1.default.resolve("./src/views/email"),
                            defaultLayout: false,
                        },
                        viewPath: path_1.default.resolve("./src/views/email"),
                        extName: ".handlebars",
                    };
                    transporter.use("compile", hbs(handlebarOptions));
                    var mailOptions = {
                        from: "verify@test.com",
                        to: `${user.email}`,
                        subject: "Account Verification ✔",
                        template: "email",
                        context: {
                            link: `${config_1.default.API}/auth/verify?token=${token}`,
                        },
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            console.log("Email sent: " + info.response);
                        }
                    });
                }))();
                response.status = true;
                response.message =
                    "verifcation link sent to your email,It will expire in 1 hour";
            }
        }));
    }
    catch (error) {
        response.status = false;
        response.message = error.message;
    }
    return res.json({
        response,
    });
}));
exports.default = auth;
