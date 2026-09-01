import Member from "../models/member.js";

export const  getProfile = async (req, res) =>{
    try{
        const {companyId, memberId } = req.user;

        const user = await Member.findOne({companyId, memberId});
        if(!user)
        {
            return res.status(404).json({
                message : "User not exist"
            })
        }
        else{
            return res.status(200).json({
                success : true,
                user
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