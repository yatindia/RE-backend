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
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const User_1 = require("../model/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user = (0, express_1.default)();
user.use(express_1.default.urlencoded({ extended: true }));
user.use((req, res, next) => {
    let headers = req.headers['authorization'];
    let bearer = headers === null || headers === void 0 ? void 0 : headers.split(" ");
    let token = bearer[1];
    jsonwebtoken_1.default.verify(token, process.env.JWT_TOKEN_KEY2, function (err, decoded) {
        if (err) {
            res.json({
                status: false,
                message: "somthing went wrong, try later",
            });
        }
        else {
            req.body = Object.assign(Object.assign({}, req.body), { authorization: {
                    _id: decoded.id
                } });
            next();
        }
    });
});
user.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        status: false,
        message: "somthing went wrong, try later",
    };
    try {
        let loggingUser = yield User_1.User.findById(req.body.authorization._id, {
            password: 0
        });
        if (!loggingUser) {
            throw new Error("this account does not exist");
        }
        else if (loggingUser.accountVerified == false) {
            throw new Error("please verify your account");
        }
        else {
            response.data = loggingUser;
            response.status = true;
            response.message = "Logged in";
        }
    }
    catch (error) {
        response = Object.assign(Object.assign({}, response), { status: false, message: error.message });
    }
    res.json(response);
}));
user.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        status: false,
        message: "somthing went wrong, try later",
    };
    try {
        let loggingUser = yield User_1.User.findById(req.body._id, {
            password: 0
        });
        if (!loggingUser) {
            throw new Error("this account does not exist");
        }
        else if (loggingUser.accountVerified == false) {
            throw new Error("please verify your account");
        }
        else {
            response.data = loggingUser;
            response.status = true;
            response.message = "Logged in";
        }
    }
    catch (error) {
        response = Object.assign(Object.assign({}, response), { status: false, message: error.message });
    }
    res.json(response);
}));
user.post("/emailupdate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        status: false,
        message: "somthing went wrong, try later",
    };
    try {
        yield User_1.User.findByIdAndUpdate(req.body.authorization._id, { $set: {
                email: req.body.email,
                accountVerified: false
            } })
            .then(res => {
            response.status = true;
            response.message = "Update successful, Please verify the email";
        })
            .catch(() => {
            response = Object.assign(Object.assign({}, response), { status: false, message: "somthing went wrong, try later" });
        });
    }
    catch (error) {
        response = Object.assign(Object.assign({}, response), { status: false, message: error.message });
    }
    res.json(response);
}));
user.post("/passwordupdate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        status: false,
        message: "somthing went wrong, try later",
    };
    let theUser = yield User_1.User.findById(req.body.authorization._id);
    try {
        if ((theUser === null || theUser === void 0 ? void 0 : theUser.password) != req.body.oldPassword) {
            throw new Error("Wrong Old Password");
        }
        yield User_1.User.findByIdAndUpdate(req.body.authorization._id, { $set: {
                password: req.body.newPassword
            } })
            .then(res => {
            response.status = true;
            response.message = "Password Updated";
        })
            .catch(() => {
            response = Object.assign(Object.assign({}, response), { status: false, message: "somthing went wrong, try later" });
        });
    }
    catch (error) {
        response = Object.assign(Object.assign({}, response), { status: false, message: error.message });
    }
    res.json(response);
}));
exports.default = user;
