import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : true
        },
        companyId : {
            type : String,
            required : true,
        },
        role : {
            type : [String],
            required : true,
        },
        memberId: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

const Member = mongoose.model("Member", memberSchema);

export default Member;