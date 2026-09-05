import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
    {
        projectId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Project",
            required : true
        },
        moduleName : {
            type : String,
            required : true,
            trim : true
        },
        description : {
            type : String,
            required : true,
            trim : true
        },
        teams :{
            type : [
                {
                    type : mongoose.Schema.Types.ObjectId,
                    ref  : "Team"
                },
            ],
            required : true
        },
        startFrom : {
            type : Date,
            default : Date.now
        },
        completeBy : {
            type : Date,
            required : true
        },
        status : {
            type : String,
            required : true,
            enum : [
                "pending",
                "inprogress",
                "review",
                "complete"
            ],
            default : "pending"
        }
    },
    {
        timestamps : true
    }
);

const Module = mongoose.model("Module", moduleSchema);

export default Module;