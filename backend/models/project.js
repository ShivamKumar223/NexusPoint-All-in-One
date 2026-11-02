import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },

    projectManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },

    projectName: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
      }
    ],

    startFrom: {
      type: Date,
      default: Date.now
    },

    completeBy: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: [
        "pending",
        "inprogress",
        "review",
        "complete"
      ],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;