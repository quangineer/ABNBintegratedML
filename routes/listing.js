const router = require("express").Router()
const multer = require("multer") // for file upload

const Listing = require("../models/Listing")
const User = require("../models/User")

/* Configuration Multer for File Uploads */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,"public/uploads/")  //Store uploaded files in the "uploads" folder
    },
    filename: function(req,file,cb) {
        cb(null,file.originalname)  // User the original file name
    }
})

const upload = multer({storage})

/* CREATE LISTING (POST) */

router.post("/create",upload.array("listingPhotos"), async (req,res) => {
    try{
        /*Take the info from the form here*/
        const{creator, category, type, streetAddress, aptSuite, city, 
                province, country, guestCount, bedroomCount, bedCount, 
                    bathroomCount, amenities,title,description,highlight,highlightDesc,price} = req.body;
        
        // const user = await User.findById(userId) // how to create a new user with userId: Don't matter; just ignore





        const listingPhotos = req.files
        if(!listingPhotos){
            return res.status(400).send("No files uploaded!")
        }

        const listingPhotoPaths = listingPhotos.map((file) => file.path) // we store the path, Not the file in the MDB
    
        const newListing = new Listing({
            creator,
            category,
            type,
            streetAddress, 
            aptSuite, 
            city, 
            province, 
            country, 
            guestCount, 
            bedroomCount, 
            bedCount, 
            bathroomCount, 
            amenities,
            listingPhotoPaths,
            title,
            description,
            highlight,
            highlightDesc,
            price,
        })    

        await newListing.save()

        res.status(200).json(newListing)
    } catch (err) {
        res.status(409).json({message: "Fail to create Listing", error: err.message})
        console.log(err)
    }
})


/* GET LISINGTS BY CATEGORY - API involved to fetch all the listing */
router.get("/", async(req,res) => {
    const qCategory = req.query.category    //categorize based on types of houses

    try {
        let listings 
        if (qCategory) {
            //go to the Listing schema to find the category we take from the
            // query, then populate to the creator to have a list 
            listings = await Listing.find({ category: qCategory}).populate("creator") 
        } else {
            // if you don't have a specific query => fetch all
            listings = await Listing.find().populate("creator") 
        }

        res.status(200).json(listings)
    } catch (err) {
        res.status(404).json({message: "Fail to fetch the listings", error: err.message})
        console.log(err)
    }
})

/* GET LISTINGS BY SEARCH */
router.get("/search/:search", async(req,res) => {
    const { search } = req.params

    try {
        let listings = []
        if (search === "all") {
            listings = await Listing.find().populate("creator")
        } else {
            listings = await Listing.find({
                $or: [
                    { category: {$regex: search, $options: "i" }},
                    { title: {$regex: search, $options: "i" }}
                ]
            }).populate("creator")
        }
        res.status(200).json(listings)
    } catch(err) {
        res.status(404).json({message: "Fail to fetch the listings", error: err.message})
        console.log(err)
    }
})

/* LISTING DETAILS */
router.get("/:listingId", async(req,res) => {
    try{
        const{ listingId } = req.params
        const listing = await Listing.findById(listingId).populate("creator")
        res.status(202).json(listing)
    } catch (err) {
        res.status(404).json({ message: "Listing cannot be found!", error: err.message})
    }
})

module.exports = router