const mongoose = require("mongoose");

const reportTypes = ["Spam/Misinformation", "Inappropriate content", "Threatening behavior", "Other (please describe)"]

const ReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetType: {
        type: String,
        required: true,
        enum: ['Post', 'User']
    },
    targetId: {
        type: mongoose.Types.ObjectId,
        refPath: "targetType",
        required: true,
    },
    reportType: {
        type: String,
        enum: reportTypes,
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Report = mongoose.model("Report", ReportSchema)
module.exports = Report;