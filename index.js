const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");

const bodyParser = require("body-parser");

const router = require("express").Router();

const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");
const predictRoutes = require("./routes/predict.js"); // tao 1 route moi

/*test*/
// const { spawn } = require("child_process");
// const pythonPath = "./testML.py"; // Replace with the actual path

// function callPython(guests, bedrooms, beds, bathrooms) {
//   const arguments = {
//     guests,
//     bedrooms,
//     beds,
//     bathrooms,
//   };

//   const jsonData = JSON.stringify(arguments);

//   return new Promise((resolve, reject) => {
//     const pythonProcess = spawn("python", [pythonPath, jsonData]);

//     pythonProcess.stdout.on("data", (data) => {
//       const predictedPrice = parseFloat(data.toString().trim());
//       resolve(predictedPrice); // Resolve the promise with the predicted price
//     });

//     pythonProcess.stderr.on("data", (data) => {
//       reject(new Error(`Python script error: ${data}`)); // Reject the promise on error
//     });
//   });

//   // const pythonProcess = spawn("python", [pythonPath, jsonData]);
//   // pythonProcess.stdout.on("data", (data) => {
//   //   const predictedPrice = parseFloat(data.toString().trim());
//   //   console.log(`Suggested price: $${predictedPrice.toFixed(2)}`);
//   // });
//   // pythonProcess.stderr.on("data", (data) => {
//   //   console.error(`Python script error: ${data}`);
//   // });
// }

/* Important */
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// /*Test*/
// callPython(5,2,3,2);
// app.post("/predict-price", async (req, res) => {
//   try {
//     console.log(req.body);

//     const { guestCount, bedroomCount, bedCount, bathroomCount } = req.body;

//     console.log(guestCount)
//     console.log(bedroomCount)
//     console.log(bedCount)
//     console.log(bathroomCount)

//     const predictedPrice = await callPython(guestCount, bedroomCount, bedCount, bathroomCount);

//     console.error("Sending back:", predictedPrice);
//     res.status(200).json(predictedPrice);
//   } catch (error) {
//     console.error("Error predicting price:", error);
//     res.status(500).send("Failed to predict price");
//   }
// });
//chay print("hello World") o testML.py
/*test*/

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ROUTES (more than one, one by one following) */
app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);

app.use("/users", userRoutes);
app.use("/predict", predictRoutes); // su dung route moi tao

// console.log("ABCTest");

/* MONGOOSE SETUP */
const PORT = 3001;
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "Need_A_Nest_User_Profile",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((err) => console.log(`${err} did not connect`));
