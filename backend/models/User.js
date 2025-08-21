const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true, default: null },
    password: { type: String, required: true },
    profilePicture: { type: String, default: 'https://placehold.co/128x128/3b82f6/ffffff?text=U' },
    bio: { type: String, default: 'No bio yet...', maxLength: 150 }
}, { timestamps: true });

// دالة لفحص كلمة المرور عند تسجيل الدخول
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// تشفير كلمة المرور قبل الحفظ
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);
