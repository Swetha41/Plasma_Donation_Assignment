const mongoose = require('mongoose');
const geocoder = require("../utils/geocoder");

//schema for register te donor
const registerUserSchema = new mongoose.Schema({

    name:{
        type:String,
        required: [true, "Name should not be empty"]
    },
    bloodGroup:{
        type:String,
        required: [true, "Blood Group should not be empty"]
    },
    phoneNumber:{
        type:String,
        required: [true, "Phone number should not be empty"]
    },
    area:{
        type:String,
        required: [true, "Area should not be empty"]
    },
    city:{
        type:String,
        required: [true, "City should not be empty"]
    },
    location: {
        type: {
          type: String,
        },
        coordinates: {
          type: [Number],
        },
        city: String,
      }
});

registerUserSchema.index({ "location": 1, "name": -1, "bloodGroup": 1 }, { unique: true });

//Geo-location
registerUserSchema.pre('save',async function(next){
    const address = `${this.area},${this.city}`;

    const Getlocation = await geocoder.geocode(address);

    this.location = {
      type: "Point",
      coordinates: [Getlocation[0].longitude, Getlocation[1].latitude],
      city: Getlocation[0].city,
    };

    next()
})


module.exports= mongoose.model("RegisterUser",registerUserSchema)
