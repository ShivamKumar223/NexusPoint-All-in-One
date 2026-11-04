
// There are just following different functions of Master Admin

import Organization from "../models/organization";

// Show profile of the user(Admin)
export const getProfile = async (req, res) =>{
    const { _id:memberId, role} = req.user;
     if(role != "master-admin")
        {
           return res.status(403).json({
                success : false,
                message: "You are not authorized to access this resource",
            })
        }

    try{

        const user = await Organization.findOneAndUpdate({ _id: memberId }, { password : 0 });
          
        if(!user)
        {
            return res.status(404).json({
                success : false,
                message : "User not found"
            })
        }
        else{
            return res.status(200).json({
                success : true,
                message : "Success",
                data: user
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


// Update profile of the user(Admin)
export const updateProfile = async (req, res) =>{
    const { _id:memberId, role} = req.user;
    const { organizationName, ownerName } = req.body;
     if(role == "master-admin")
        {
           return res.status(403).json({
                success : false,
                message: "You are not authorized to access this resource",
            })
        }
        
    try{

        const user = await Organization.findOne({ id }, { organizationName, ownerName });
   
        if(!user)
        {
            return res.status(404).json({
                success : false,
                message : "User not found"
            })
        }
        else{
            return res.status(200).json({
                success : true,
                data : user
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
