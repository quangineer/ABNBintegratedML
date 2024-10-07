const router = require("express").Router()
const Booking = require("../models/Booking")
const User = require("../models/User")
const Listing = require("../models/Listing")

/* API TO GET TRIP LIST */
router.get("/:userId/trips", async(req,res) => {
    try{
        const{userId} = req.params //take userId from line 7 to userId here
        const trips = await Booking.find({ customerId: userId}).populate("customerId hostId listingId")
        res.status(202).json(trips) 
    } catch (err) {
        console.log(err)
        res.status(404).json({message:"Cannot find trips!",error: err.message})
    }
})

/* API TO ADD LISTING TO WISH LIST */
router.patch("/:userId/:listingId", async(req,res) => {
    try{
        const{userId, listingId} = req.params
        const user = await User.findById(userId)
        const listing = await Listing.findById(listingId).populate("creator")

        const favoriteListing = user.wishList.find((item) => item._id.toString() === listingId)

        if(favoriteListing){
            user.wishList = user.wishList.filter((item) => item._id.toString() !== listingId)
            await user.save()
            res.status(200).json({ message: "Listing is removed from wish list", wishList: user.wishList})
        } else {
            user.wishList.push(listing)
            await user.save()
            res.status(200).json({ message: "Listing is added to wish list", wishList: user.wishList})

        }
    } catch (err) {
        console.log(err)
        res.status(404).json({error: err.message})
    }
})

/* API TO GET RESERVATION LIST */
router.get("/:userId/reservations", async(req,res) => {
    try{
        const{userId} = req.params //take userId from line 7 to userId here
        const reservations = await Booking.find({ hostId: userId}).populate("customerId hostId listingId")
        res.status(202).json(reservations) 
    } catch (err) {
        console.log(err)
        res.status(404).json({message:"Cannot find reservations!",error: err.message})
    }
})

module.exports = router