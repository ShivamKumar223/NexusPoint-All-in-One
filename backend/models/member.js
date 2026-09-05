import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : true
        },
        companyId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Admin",
            required : true,
        },
        memberId: {
            type: String,
            required: true,
            unique: true,
            trim  : true
        },
        password: {
            type: String,
            required: true
        },
        role : {
            type : [String],
            required : true,
            enum: [
                "admin",
                "project-manager",
                "team-owner",
                "developer"
            ],
        },
        designation : {
            type : String,
            required : true,
            trim : true
        },
        skills : {
            type : [
                {
                    type : String,
                    trim : true
                }],
            required : true,
        }
    },
    {
        timestamps : true
    }
);

const Member = mongoose.model("Member", memberSchema);

export default Member;