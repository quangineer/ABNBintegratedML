const router = require("express").Router()

const { spawn } = require("child_process");
const pythonPath = "./testML.py";
const bodyParser = require('body-parser');

function callPython(guests, bedrooms, beds, bathrooms) {
    const arguments = {
      guests,
      bedrooms,
      beds,
      bathrooms,
    };
  
    const jsonData = JSON.stringify(arguments);
  
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn("python", [pythonPath, jsonData]);
  
      pythonProcess.stdout.on("data", (data) => {
        const predictedPrice = parseFloat(data.toString().trim());
        resolve(predictedPrice); // Resolve the promise with the predicted price
      });
  
      pythonProcess.stderr.on("data", (data) => {
        reject(new Error(`Python script error: ${data}`)); // Reject the promise on error
      });
    });
}

// router.use(bodyParser.urlencoded({ extended: false }));
// router.use(bodyParser.json());
router.post("/predict-price", async (req, res) => {
  try {
    console.log(req.body);
    
    const { guestCount, bedroomCount, bedCount, bathroomCount } = req.body;

    console.log(guestCount)
    console.log(bedroomCount)
    console.log(bedCount)
    console.log(bathroomCount)

    const predictedPrice = await callPython(guestCount, bedroomCount, bedCount, bathroomCount);
    
    console.error("Sending back:", predictedPrice);
    res.status(200).json(predictedPrice);
  } catch (error) {
    console.error("Error predicting price:", error);
    res.status(500).send("Failed to predict price");
  }
});

router.get("/predict-price", async (req, res) => {
  console.log("REACH HERE");
});
module.exports = router

