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
const generateToken = ({ id : organizationId, organizationName, ownerName, email, role})=>{
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
            const {password : temp, ...user} = isExistUser;
            return res.status(200).json({
                success :  true,
                message: "Login successful",
                data : user
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


// Change Password
export const updatePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;

        // 1. Validate input
        if (!newPassword) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        // 2. Find logged-in user
        const user = await Organization.findById(req.user.userId)
            .select("+password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 3. Verify old password
        // const isMatch = await bcrypt.compare(
        //     oldPassword,
        //     user.password
        // );

        // if (!isMatch) {
        //     return res.status(400).json({
        //         message: "Incorrect old password"
        //     });
        // }

        // 4. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 5. Update password
        // user.password = hashedPassword;
        // await user.save();
        await Organization.findOneAndUpdate({id : req.user.userId},{password : hashedPassword})

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};