import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : true
        },
        organizationId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Organization",
            required : true,
        },
        memberId: {
            type: String,
            required: true,
            trim  : true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: [
                {
                    type: String,
                    enum: ["admin", "project-manager", "team-owner", "developer"]
                }
            ],
            required: true,
            validate: [v => Array.isArray(v) && v.length > 0, "At least one role is required."]
        },
        designation : {
            type : String,
            required : true,
            trim : true
        },
        skills: {
            type: [String], // Clean, unnested syntax
            trim: true,
            required: true
        }
    },
    {
        timestamps : true
    }
);

const Member = mongoose.model("Member", memberSchema);

export default Member;