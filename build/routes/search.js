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
const Property_1 = require("../model/Property");
const app = (0, express_1.default)();
app.post("/search", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = yield Property_1.Property.find({
            propertyBuyingOption: req.body.buyingOption,
            location: req.body.location,
            tittle: req.body.tittle,
            description: req.body.description,
        });
        if (data) {
            res.send(data);
        }
        else {
            res.send(data);
        }
    }
    catch (error) {
        res.send(error.message);
    }
}));
app.get("/search/:key", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = yield Property_1.Property.find({
            $or: [
                { propertyBuyingOption: { $regex: req.params.key } },
                { location: { $regex: req.params.key } },
                { description: { $regex: req.params.key } },
                { tittle: { $regex: req.params.key } },
            ],
        });
        if (data) {
            res.send(data);
        }
        else {
            res.send(data);
        }
    }
    catch (error) {
        res.send(error.message);
    }
}));
app.get("/findSigleProperty/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const property = yield Property_1.Property.findById(req.params.id);
        res.status(200).json(property);
    }
    catch (err) {
        throw err;
    }
}));
// .status(500)
// .send({ status: false, message: "User doesn't has any property" });
// res.status(500).send({ status: false, message: "Can't find property" });
// res.status(500).send({ status: false, message: "Can't find property" });
exports.default = app;
