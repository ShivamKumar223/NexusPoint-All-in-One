import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Member from "../models/member.js";

const generateToken = ({ name, organizationId, id: userId, memberId, role, designation, skills }) => {
    const token = jwt.sign(
        {
            name, organizationId, userId, memberId, role, designation, skills
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    return token;
}


// login member
export const loginMember = async (req, res) => {
    try {
        const { organizationId, memberId, password } = req.body;

        const isUserExist = await Member.findOne({ organizationId, memberId });
        // console.log(isUserExist);
        if (!isUserExist) {
            return res.status(404).json({
                message: "User not exist"
            })
        }
        else {
            const isPasswordCorrect = await bcrypt.compare(password, isUserExist.password);
            if (isPasswordCorrect) {
                const token = generateToken(isUserExist);
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: true,      // HTTPS mandatory for cross-site deployment
                    sameSite: "none",  // Cross-domain delivery allow karne ke liye "none" hona zaroori hai
                    maxAge: 24 * 60 * 60 * 1000
                });

                const { password: temp, ...user } = isUserExist;
                return res.status(200).json({
                    success: true,
                    message: "Login successful",
                    data: user
                })
            }
            else {
                return res.status(401).json({
                    message: "Invalid Id or password"
                })
            }
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Login failed"
        })
    }
}

// 
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
        const user = await Member.findById(req.user.userId)
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
        await Member.findOneAndUpdate({ id: req.user.userId }, { password: hashedPassword })

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