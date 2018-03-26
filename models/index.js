const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

UserSchema.pre('save', async function(next) {
    const user = this;
    try {
        const hash = await bcrypt.hash(user.password, 10);
        user.password = hash;
        next();
    } catch (error) {
        return next(err);
    }
});

UserSchema.statics.authenticate = async function(username, password, callback) {
    try {
        const user = await User.findOne({ username })
        bcrypt.compare(password, user.password, function(err, result) {
            if(result === true) {
                return callback(null, user);
            } else {
                return callback();
            }
        });
    } catch (error) {
        return callback(error);
    }
};
const User = mongoose.model('User', UserSchema);

const NoteSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    _author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, { timestamps: true });

const Note = mongoose.model('Note', NoteSchema);

module.exports = { User, Note };