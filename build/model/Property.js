"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = void 0;
const mongoose_1 = require("mongoose");
const PropertySchema = new mongoose_1.Schema({
    owner: { type: String, required: true },
    video: { type: String, required: false },
    title: { type: String, required: true },
    photos: [{ type: String, required: true }],
    type: { type: String, required: true },
    space_use: { type: String, required: true },
    for: { type: String, required: true },
    address_1: { type: String, required: true },
    address_2: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    zip_code: { type: Number, required: true },
    year_built: { type: Number, required: true },
    renovated: { type: Boolean, required: false, default: false },
    renovated_year: { type: Number, required: false, default: 0 },
    building_size: { type: Number, required: true },
    lot_size: { type: Number, required: true },
    construction_type: { type: String, required: true },
    sewer: { type: String, required: true },
    electricity: { type: String, required: true },
    zoning: { type: String, required: true },
    highlights: [{ type: String, required: true }],
    featured: { type: Boolean, required: false },
    importance: { type: Number, required: false },
    gps: {
        lat: { type: Number, required: false },
        lng: { type: Number, required: false }
    },
    floors: [
        {
            required: false,
            type: {
                floor_number: { type: Number, required: true },
                floor_size: { type: Number, required: true },
                term: { type: String, required: true },
                rate: { type: String || Number, required: true },
                space_use: { type: String, required: true },
                condition: { type: String, required: true },
                amenities: [{ type: String, required: true }],
                period_of_tenure: { type: Number, required: true },
                avaliable: { type: Boolean, required: true },
            }
        }
    ]
});
exports.Property = (0, mongoose_1.model)("Properties", PropertySchema);
