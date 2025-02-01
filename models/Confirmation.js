const mongoose = require('mongoose')

const ConfirmationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
        type: String,
        required: true
    },
    token: {
      type: String,
      required: true
    },
    confirmed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

const Confirmation = mongoose.model('Confirmation', ConfirmationSchema)
module.exports = Confirmation
