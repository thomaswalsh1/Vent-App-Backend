const VerifyId = require('./fetchId/VerifyId')
const Report =  require('../models/Report');

exports.report = async (req, res) => {
    try {
        const reportData = req.body;
        const verifiedId = VerifyId(req.headers.authorization);

        const newReport = new Report({
            ...reportData,
            reporter: verifiedId
        })

        await newReport.save();

        res.status(200).json({message: "Successfully submitted report."})
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error submitting report.", error})
    }
}