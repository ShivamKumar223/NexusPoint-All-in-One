import Member from "../models/member.js";

export const  getProfile = async (req, res) =>{
    try{
        const { userId } = req.user;

        const user = await Member.findOne({ userId });
        if(!user)
            {
                return res.status(404).json({
                    message : "User not exist"
                })
            }
            else{
            const { password, ...userWithoutPassword } = user;
            return res.status(200).json({
                success : true,
                userWithoutPassword
            })
        }
    }
    catch(error)
    {
        return res.status(500).json({
            success : true,
            message : "Request failed"
        })
    }
}