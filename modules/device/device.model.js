const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
    },
    type: {
      type: String,
      // required: true,
    },
    state: {
      type: Boolean,
      default: false,
    },
    value: Number,
    valueLog: [
      {
        time: {
          type: Date,
          default: Date.now,
        },
        value: Number,
      },
    ],
    min_value: {
      type: Number,
    },
    max_value: {
      type: Number,
    },
    user_owner: {
      type: String,
    },
    room_owner: {
      type: String,
    },
    stateLog: [
      {
        time: {
          type: Date,
          default: Date.now,
        },
        state: Boolean,
      },
    ],
  },
  { timestamps: true }
);

// Method to update stateLog when state changes
// deviceSchema.pre('save', function(next) {
//   if (this.isModified('state')) {
//     this.stateLog.push({ time: new Date(), state: this.state });
//   }
//   next();
// });

// // Method to update stateLog when state changes
// deviceSchema.methods.updateStateLog = function () {
//   if (this.isModified("state")) {
//     this.stateLog.push({ time: new Date(), state: this.state });
//   }
// };

// deviceSchema.pre('save', function(next) {
//   if (this.isModified('state')) {
//     this.stateLog.push({ time: new Date(), state: this.state });
//   }
//   next();
// });

// Pre-save hook to update stateLog when state changes
// deviceSchema.pre('save', function(next) {
//   if (this.isModified('state') && !this.isNew) {
//     this.stateLog.push({ time: new Date(), state: this.state });
//   }
//   next();
// });

// const Device = mongoose.model("Device", deviceSchema);

module.exports = deviceSchema;
