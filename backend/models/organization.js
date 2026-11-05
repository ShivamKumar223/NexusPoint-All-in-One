import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
    organizationName : {
        type: String, 
        required: true,
        trim : true
    },
    ownerName: {
        type: String,
        required: true,
        trim : true
    },
    role: {
        type: String,
        default: "master-admin",
        immutable : true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase : true,
        trim : true
    },
    password: {
        type: String,
        required: true
    }
},
{
    timestamps : true
}
);

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;

