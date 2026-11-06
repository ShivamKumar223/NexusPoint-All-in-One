import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true
        },
        organizationId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: "",
            trim: true
        },
        dueDate: {
            type: Date,
            default: null
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Todo = mongoose.model("Todo", todoSchema);
export default Todo;
