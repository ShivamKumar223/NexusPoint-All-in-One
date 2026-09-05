import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
    {
        companyId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Admin",
            required : true
        }, 
        memberId : {
            type : String,
            required : true
        },
        teamName : {
            type : String,
            required : true,
            trim : true
        },
        description : {
            type: String,
            required : true,
            trim : true
        },
        members : {
            type : [
                {
                    type : mongoose.Schema.Types.ObjectId,
                    ref  : "Member"
                }
            ],
            required : true
        },
    },
    {
        timestamps : true
    }
)

const Team = mongoose.model("Team", teamSchema);

export default Team;