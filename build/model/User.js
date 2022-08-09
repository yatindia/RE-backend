"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
// const mongoose = require("mongoose")
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    login_token: {
        type: String,
        required: false,
    },
    accountVerified: {
        type: Boolean,
        default: false,
    },
    mobileVerified: {
        type: Boolean,
        default: false,
    },
    properties: [
        { type: String }
    ],
    favouriteProperties: [
        { type: String }
    ]
});
exports.User = (0, mongoose_1.model)("User", UserSchema);
