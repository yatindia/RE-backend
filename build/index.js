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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const property_1 = __importDefault(require("./routes/property"));
const uuid_1 = require("uuid");
const storage_1 = require("@google-cloud/storage");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "2mb" }));
app.use("/image", express_1.default.static("uploads"));
app.use(express_1.default.urlencoded({
    extended: true
}));
const connect = () => {
    try {
        mongoose_1.default.connect(`mongodb+srv://${process.env.MONGO_USERID}:${process.env.MONGO_PASSWORD}@cluster0.segtq.mongodb.net/test`);
        console.log("Connected to mongoDB.");
    }
    catch (error) {
        throw error;
    }
};
app.use("/auth", auth_1.default);
app.use("/user", user_1.default);
app.use("/property", property_1.default);
const storage = new storage_1.Storage({
    keyFilename: path_1.default.join(__dirname, "../image-upload-358514-053689216333.json"),
    projectId: "image-upload-358514"
});
function uploadFile(bucketName, filePath, destFileName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield storage.bucket(bucketName).upload(filePath, {
            destination: destFileName,
        });
        console.log(`${filePath} uploaded to ${bucketName}`);
    });
}
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let file = path_1.default.join(__dirname, "../uploads/5f1a6e99-9c93-4230-85a2-996e49c7c9ec.jpg");
    let bucket = "clp-image";
    let name = `${(0, uuid_1.v4)()}.jpg`;
    uploadFile(bucket, file, name).catch(console.error);
    res.send("okk");
}));
app.post("/api", (req, res) => {
    res.send(req);
});
app.listen(process.env.PORT, () => {
    connect();
    console.log(`Server Running at http://127.0.0.1:${process.env.PORT}`);
});
