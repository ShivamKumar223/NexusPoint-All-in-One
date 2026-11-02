import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


import Organization from "../models/organization.js";


// Handle organization registration
export const registerOrganization = async (req, res) =>{
    
    try {
    const { organizationName, ownerName, email, password } = req.body;

    const existingUser = await Organization.findOne({email});
    if (existingUser) {
        return res.status(409).json({
        message: "Email already exists"
        });
    }
    else{
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await Organization.create({
            organizationName,
            ownerName,
            email,
            password : hashedPassword
        });

        res.status(201).json({
            message: "Organization created successfully",
            user                                                  // temperory 
        });

    }
   }
   catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}



// generate jwt token
const generateToken = ({ _id : organizationId, organizationName, ownerName, email, role})=>{
    const token = jwt.sign(
        { organizationId, organizationName, ownerName, email, role},
            process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return token;
}



// Handle organization Login
export const loginOrganization = async(req, res) => {

   try{
         const { email, password } = req.body;
    
    const isExistUser = await Organization.findOne({email});
    if(isExistUser){
        const isPasswordCorrect = await bcrypt.compare(password, isExistUser.password);

        if(isPasswordCorrect){
            const token = generateToken(isExistUser);

            res.cookie("token", token, {
                httpOnly: true,                  //cookie sirf HTTPS connection par browser se server ko send hogi
                // secure: process.env.NODE_ENV === "production",
                // sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000
            });

            return res.status(200).json({
                success :  true,
                message: "Login successful",
            })
        }
        else{
            return res.status(401).json({
                message : "Invalid email or password",
            })
        }
    }
    else{
        return res.status(404).json({
            message: "User not found"
        });
    }
    }
    catch(error){
       return res.status(500).json(
        {
            success : false,
            message : "Login failed"
        }
    );
   }
}


