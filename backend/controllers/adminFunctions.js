import Member from "../models/member.js";
import Admin from "../models/admin.js";

export const getProfile = async (req, res) =>{
    try{
        const { email } = req.user;
        const user = await Admin.findOne({email});
        if(!user)
        {
            return res.status(404).json({
                message : "User not found"
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
            success : false,
            message : "Request failed"
        })
    }
}


export const getMembers = async (req, res) => {
    try {
        const { email } = req.user;

        const members = await Member.find({ companyId: email });

        return res.status(200).json({
            success: true,
            members
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch members"
        });
    }
};


export const registerMember = async (req, res) =>{

   try{
    const {name, role, memberId, password} = req.body;
    const companyId = req.user.email;
    const isExistUser = await Member.findOne({companyId, memberId});

    if(isExistUser)
    {
        return res.status(409).json({
            message : "User already exist"
        })
    }
    else{
        const user = await Member.create({name, companyId, role, memberId, password});
        res.status(200).json({
            success : true, 
            message : "Member's log created",
            user
        })
    }

   }
   catch(error)
    {
        return res.status(500).json({
            success: false,
            message: "Failed to create member log"
        });
    }
    
}


export const updateMember = async (req, res) =>{

    try{
        const memberId = req.params.memberId;
        const {name, role, companyId} = req.body;

        const user = await Member.findOne({companyId, memberId });
            if(!user)
                return res.status(404).json({
                    message : "User not found"
            })
            else{
                const updatedUser = await Member.findOneAndUpdate({companyId : companyId, memberId}, {name, role});
                return res.status(200).json({
                    success : true, 
                    message : "Update successful",
                    updatedUser
                })
            }
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Failed to update"
        })
    }
}


export const deleteMember = async (req, res) =>{
    try{
        const memberId  = req.params.memberId;
        const companyId  = req.user.email;

        const user = await Member.findOne({companyId, memberId});
        if(!user)
        {
            return res.status(404).json({
                message : "User not found"
            })
        }
        else{
            const deletedMember = await Member.findOneAndDelete({companyId, memberId});
            return res.status(200).json({
                message : "Delete member successfully",
                deletedMember
            })
        }
    }
    catch(error)
    {
        return res.status(500).json({
            message : "Failed to delete member"
        })
    }
}