import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true
        },
        projectManagerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
            required: true
        },
        teamName: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        members: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Member",
            required: true,
        },
    },
    {
        timestamps: true
    }
)

const Team = mongoose.model("Team", teamSchema);

export default Team;