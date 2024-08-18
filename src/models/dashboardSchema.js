const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const dashboardSchema = new mongoose.Schema({
    name: { type: String,  trim: true },
    email: { type: String,  unique: true, trim: true, lowercase: true },
    password: { type: String, minlength: 7, trim: true },
    organisationname: { type: String },
    organisationgithuburl: { type: String },
    liveurl: { type: String },
    tokens: [{
        token: { type: String, required: true }
    }]
}, {
    timestamps: true
});


dashboardSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

dashboardSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, 'secretkey'); 
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

dashboardSchema.statics.findbyCredentials = async (email, password) => {
    const user = await Dashboard.findOne({ email });
    if (!user) {
        throw new Error('Unable to login');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Unable to login');
    }
    return user;
}

dashboardSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
}

const Dashboard = mongoose.model('Dashboard', dashboardSchema);

module.exports = Dashboard;
