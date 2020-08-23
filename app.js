const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const geocoder = require("./utils/geocoder")
require('dotenv').config();
const Donor = require("./models/registerUser");

const app = express();

//middlewares
app.use(bodyParser.urlencoded({ extended : false }))
app.use(express.json())

// mongodb connection
mongoose
.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then(() => console.log('DB Connected'));

//simple response
app.get("/", function(req, res){
    res.send("Hello World");
});

// Route for creating Donor deatils

app.post("/registerdonor", function(req, res) {
    var donor = new Donor();
    donor.name = req.body.name;
    donor.bloodGroup = req.body.bloodGroup;
    donor.phoneNumber = req.body.phoneNumber;
    donor.area = req.body.area;
    donor.city = req.body.city;

        donor.save((err, user) => {
            if (err) {
                res.send(err);
            }
            res.json({
                user
            });
        });
  });

  // Route to get all Donor deatils
    app.get("/Donors", function(req,res){
      Donor.find({}, function(err, foundItems){
          if(err){
              res.send(err);
          }
          res.json({foundItems})
      });
  });
    
    //Route for Searching Donor
    app.post("/searchdonor",async (req,res) => {
      try {

          const address = `${req.body.area},${req.body.city}`;

          const Getlocation = await geocoder.geocode(address);

          const latitude = Getlocation[0].latitude;
          const longitude = Getlocation[1].longitude;
          const radius = req.body.distance / 6378;
            // console.log(Getlocation)
        const donars = await Donor.find({
                bloodGroup: req.body.bloodGroup,
                    location: {
                        $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
                }
        }).select(["name","phoneNumber","-_id"])
            
        res.status(200).json({ success : true , data: donars })
      } catch (error) {
       res.status(500).json({ success: false, error: error.message });
    }
    });


    const port = process.env.PORT || 8000;

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
});

