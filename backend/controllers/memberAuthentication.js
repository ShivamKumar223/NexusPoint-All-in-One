import jwt from "jsonwebtoken";

import Member from "../models/member.js";

const generateToken = ({name, organizationId, _id : userId, memberId, role, designation, skills})=>{
    const token =  jwt.sign(
        {
            name, organizationId, userId, memberId, role, designation, skills
        },
         process.env.JWT_SECRET,
         {
            expiresIn : "1d"
         }
    );

    return token;
}


// login member
export const loginMember = async (req, res)=>{
    try{
        const { organizationId, memberId, password } = req.body;

        const isUserExist = await Member.findOne({organizationId, memberId});
        if(!isUserExist)
        {
            return res.status(404).json({
                message : "User not exist"
            })
        }
        else{
            const isPasswordCorrect = await bcrypt.compare(password, isUserExist.password);
            if(isPasswordCorrect)
            {
               const token = generateToken(isUserExist);
               res.cookie("token", token, 
                {
                     httpOnly: true,                  //cookie sirf HTTPS connection par browser se server ko send hogi
                    // secure: process.env.NODE_ENV === "production",
                    // sameSite: "strict",
                    maxAge: 24 * 60 * 60 * 1000
                }
               )
               return res.status(200).json({
                 success : true,
                 message : "Login successful"
               })
            }
            else{
                return res.status(401).json({
                    message : "Invalid Id or password"
                })
            }
        }
    }
    catch(error)
    {
        return res.status(500).json({
            success : false,
            message : "Login failed"
        })
    }
}