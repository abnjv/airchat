const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    avatar: {
        type: String,
        default: 'default-avatar.png' // صورة افتراضية للمستخدم
    },
    level: {
        type: Number,
        default: 1
    },
    xp: {
        type: Number,
        default: 0
    },
    coins: {
        type: Number,
        default: 100 // عملات افتراضية للمستخدم الجديد
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    // يمكنك إضافة المزيد من الحقول هنا مثل الرصيد، الرتبة، إلخ.
}, {
    timestamps: true // يضيف حقول createdAt و updatedAt تلقائياً
});

// تشفير كلمة المرور قبل حفظ المستخدم
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// مقارنة كلمة المرور المدخلة بكلمة المرور المشفرة
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
