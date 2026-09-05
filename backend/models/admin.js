import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim : true
    },
    company : {
        type: String, 
        required: true,
        trim : true
    },
    role: {
        type: String,
        default: "admin",
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

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;

