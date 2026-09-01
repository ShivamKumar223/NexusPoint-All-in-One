import jwt from "jsonwebtoken";


import Admin from "../models/admin.js";


// Handle admin registration
export const registerAdmin = async (req, res) =>{
    
    const { name, company, email, password } = req.body;

    const existingUser = await Admin.findOne({email});
    if (existingUser) {
        return res.status(409).json({
        message: "Email already exists"
        });
    }
    else{
        const role = "admin";
        try {

        const user = await Admin.create({
            name,
            company,
            role,
            email,
            password
        });

        res.status(201).json({
            message: "Log created successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}
}


// generate jwt token
const generateToken = ({name, role, email, company})=>{
    const token = jwt.sign(
        {name, role, email, company},
            process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return token;
}


// Handle Admin Login
export const loginAdmin = async(req, res) => {

    const { email, password } = req.body;
    
    const isExistUser = await Admin.findOne({email});
    if(isExistUser){
        if(isExistUser.password == password){
            const token = generateToken(isExistUser);

            res.cookie("token", token, {
                httpOnly: true,                  //cookie sirf HTTPS connection par browser se server ko send hogi
                // secure: process.env.NODE_ENV === "production",
                // sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000
            });

            return res.status(200).json({
                message: "Login successful",
            })
        }
        else{
            return res.status(401).json({
                message : "Wrong email or password",
            })
        }
    }
    else{
        return res.status(404).json({
            message: "User not found"
        });
    }
}


