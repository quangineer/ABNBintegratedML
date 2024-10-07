// APIs

const router = require("express").Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const multer = require("multer")

const User = require("../models/User")

/* Confi Multer for file upload*/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,"public/uploads/")  //Store uploaded files in the "uploads" folder
    },
    filename: function(req,file,cb) {
        cb(null,file.originalname)  // User the original file name
    }
})
const upload = multer({storage})  //done with config for the Multer to store files uploaded

/* User Register */
router.post("/register", upload.single('profileImage'), async (req,res) =>{
    try{
        /* Take all info from the registration form */
        const {firstName, lastName, email, password} = req.body
        /* The uploaded file is available as req.file */
        const profileImage = req.file

        if(!profileImage){
            return res.status(400).send("No file uploaded")
        }

        /* create a path to the uploaded profile photo */
        const profileImagePath = profileImage.path    // we can store the path in the MongoDB

        /* Check if user exists , avoid same user */
        const existingUser = await User.findOne({ email})
        if(existingUser){
            return res.status(409).json({message: "User already exists!"})
        }

        /* hash the password */
        const salt = await bcrypt.genSalt()
        const hashPassword = await bcrypt.hash(password, salt)

        /*Create a new User */
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashPassword,
            profileImagePath,
        });

        /* Save the new User */
        await newUser.save();

        /* Send a successful message */
        res.status(200).json({ message: "User registered successfully!", user: newUser})
    } catch(err){
        console.log(err)
        res.status(500).json({ message: "Registration failed!", error: err.message})
    }
})

/* USER LOGIN */
router.post("/login", async(req,res)=>{
    try{
        /*First take the info from the form */
        const {email,password}=req.body
        
        /*Check if user exists*/
        const user = await User.findOne({ email})
        if(!user){
            return res.status(409).json({message: "User does not exist!"})
        }

        /*Compare the password with the hashed password*/
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({message:"Invalid Credentials!"})
        }

        /*Generate JWT token*/
        const token = jwt.sign({id: user._id},process.env.JWT_SECRET)
        delete user.password

        res.status(200).json({token, user, message:"You have signed in successfully!"})
    } catch (err) {
        console.log(err)
        res.status(500).json({error: err.message})
    }
})
module.exports = router