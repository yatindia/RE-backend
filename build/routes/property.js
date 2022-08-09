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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const storage_1 = require("@google-cloud/storage");
const path_1 = __importDefault(require("path"));
//@ts-ignore
const config_1 = __importDefault(require("../../config"));
const fs_1 = __importDefault(require("fs"));
const storage = new storage_1.Storage({
    keyFilename: path_1.default.join(__dirname, "../../image-upload-358514-053689216333.json"),
    projectId: "image-upload-358514"
});
const upload = (0, multer_1.default)();
function fielUpload(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let im = (req.body.image).replace(/^data:image\/png;base64,/, "");
        let img = im.replace(/^data:image\/jpeg;base64,/, "");
        let buffer = Buffer.from(im, 'base64');
        // buffer to image
        let filename = (0, uuid_1.v4)() + ".jpg";
        fs_1.default.writeFileSync(`${config_1.default.maindir}/uploads/${filename}`, buffer);
        req.body.filename = filename;
        next();
    });
}
function uploadFile(bucketName, filePath, destFileName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield storage.bucket(bucketName).upload(filePath, {
            destination: destFileName,
        });
        console.log(`${filePath} uploaded to ${bucketName}`);
    });
}
function deleteFile(bucketName, fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield storage.bucket(bucketName).file(fileName).delete();
        console.log(`${fileName} deleted from ${bucketName}`);
    });
}
const property = (0, express_1.default)();
property.use((req, res, next) => {
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
//Image Upload
property.post("/imageupload", fielUpload, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let value = req.body.filename;
    let response = {
        message: "File Uploaded Failed",
        status: false
    };
    if (value) {
        let file = path_1.default.join(__dirname, `../../uploads/${value}`);
        let bucket = "clp-image";
        let name = value;
        uploadFile(bucket, file, name)
            .then(() => {
            fs_1.default.unlink(file, () => { });
        })
            .catch(console.error);
        response.status = true,
            response.message = "File Uploaded Successfully",
            response.data = value;
    }
    res.json(response);
}));
//Image Upload
property.post("/imageupdate", fielUpload, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let value = req.body.filename;
    let _id = req.body._id;
    let response = {
        message: "File Update Failed",
        status: false
    };
    if (value) {
        let file = path_1.default.join(__dirname, `../../uploads/${value}`);
        let bucket = "clp-image";
        let name = value;
        yield Property_1.Property.findByIdAndUpdate(_id, { $addToSet: { photos: name } })
            .then(() => __awaiter(void 0, void 0, void 0, function* () {
            let check = yield uploadFile(bucket, file, name);
            return check;
        }))
            .then(() => {
            fs_1.default.unlink(file, () => { });
        })
            .catch(console.error)
            .finally(() => {
            response.status = true,
                response.message = "File Update Successfull",
                response.data = value;
            res.json(response);
        });
    }
}));
property.post("/imagedelete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let name = req.body.filename;
    let property = req.body._id;
    let response = {
        message: "File Uploaded Failed",
        status: false
    };
    if (name && property) {
        Property_1.Property.findByIdAndUpdate(property, { $pull: { photos: name } })
            .then(() => {
            let bucket = "clp-image";
            deleteFile(bucket, name)
                .catch(console.error);
            response.status = true,
                response.message = "File Deleted Successfully";
        });
    }
    res.json(response);
}));
//CREATE
property.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        message: "somthing went wrong",
        status: false
    };
    try {
        yield new Property_1.Property(Object.assign(Object.assign({}, req.body.property), { owner: req.body.authorization._id }))
            .save()
            .catch(error => {
            throw new Error(error);
        });
        response.message = "Property Saved";
        response.status = true;
    }
    catch (error) {
        response.message = "Please Enter All Essential Values";
        response.errorMessage = error.message;
    }
    res.json(response);
}));
//UPDATE
property.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        message: "somthing went wrong",
        status: false
    };
    try {
        yield Property_1.Property.findOneAndUpdate({ $and: [
                { _id: req.params.id },
                { owner: req.body.authorization._id }
            ] }, { $set: req.body.property })
            .catch(error => {
            throw new Error(error);
        });
        response.message = "Property Updated";
        response.status = true;
    }
    catch (error) {
        response.message = "Please Enter All Essential Values";
        response.errorMessage = error.message;
    }
    res.json(response);
}));
//READ
property.get("/post/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        message: "somthing went wrong",
        status: false
    };
    try {
        let data;
        yield Property_1.Property.findById(req.params.id)
            .then(res => {
            data = res;
        })
            .catch(error => {
            throw new Error(error);
        });
        response.message = "Property Fetched";
        response.data = data;
        response.status = true;
    }
    catch (error) {
        response.message = "Please Enter All Essential Values";
        response.errorMessage = error.message;
    }
    res.json(response);
}));
//single user property
property.get("/singleuserproperty/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('kkk');
    let response = {
        message: "somthing went wrong",
        status: false
    };
    try {
        let data;
        yield Property_1.Property.find({ owner: req.params.id })
            .then(res => {
            data = res;
        })
            .catch(error => {
            throw new Error(error);
        });
        response.message = "Property Fetched";
        response.data = data;
        response.status = true;
    }
    catch (error) {
        response.message = "Please Enter All Essential Values";
        response.errorMessage = error.message;
    }
    res.json(response);
}));
//DELETE
property.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        message: "somthing went wrong",
        status: false
    };
    try {
        yield Property_1.Property.findOne({ $and: [
                { _id: req.params.id },
                { owner: req.body.authorization._id }
            ] })
            .then((res) => __awaiter(void 0, void 0, void 0, function* () {
            if (res.photos && res.photos != []) {
                (res.photos).forEach((photo) => {
                    fs_1.default.unlink(`${config_1.default.maindir}/uploads/${photo}`, (err) => __awaiter(void 0, void 0, void 0, function* () { }));
                });
            }
            yield Property_1.Property.findOneAndDelete({ $and: [
                    { _id: req.params.id },
                    { owner: req.body.authorization._id }
                ] });
        }))
            .catch(error => {
            throw new Error(error);
        });
        response.message = "Property Deleted";
        response.status = true;
    }
    catch (error) {
        response.message = "Please Enter All Essential Values";
    }
    res.json(response);
}));
property.post("/search", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = {
        message: "somthing went wrong",
        status: false
    };
    try {
        let skip = req.body.skip;
        let limit = req.body.limit;
        if (typeof limit == "undefined" || typeof skip == "undefined") {
            throw new Error("Please Send SKIP and LIMIT values");
        }
        let searchEXP = new RegExp(`${req.body.search}`, "i");
        let searchQuery = [];
        if (req.body.search) {
            searchQuery.push({ address_1: searchEXP });
            searchQuery.push({ address_2: searchEXP });
            searchQuery.push({ country: searchEXP });
            searchQuery.push({ state: searchEXP });
            searchQuery.push({ city: searchEXP });
            searchQuery.push({ year: searchEXP });
            searchQuery.push({ highlights: { $in: [searchEXP] } });
        }
        req.body.type ? searchQuery.push({ type: req.body.type }) : null;
        req.body.space_use ? searchQuery.push({ space_use: req.body.space_use }) : null;
        req.body.for ? searchQuery.push({ for: req.body.for }) : null;
        req.body.country ? searchQuery.push({ country: req.body.country }) : null;
        req.body.state ? searchQuery.push({ state: req.body.state }) : null;
        req.body.city ? searchQuery.push({ city: req.body.city }) : null;
        req.body.zip_code ? searchQuery.push({ zip_code: req.body.zip_code }) : null;
        let partData = yield Property_1.Property.find({ $or: searchQuery }).sort({ _id: -1 }).limit(limit).skip(skip);
        let count = yield Property_1.Property.find({ $or: searchQuery }).sort({ _id: -1 }).countDocuments();
        response = {
            status: true,
            message: "Success",
            data: [
                partData,
                count
            ]
        };
    }
    catch (error) {
        response.message = error.message;
    }
    res.json(response);
}));
exports.default = property;
