const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    description: {
        type: String,
        default: 'Public chat room.'
    },
    // يمكننا إضافة حقول أخرى مثل:
    // owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // إذا أردنا ربط الغرفة بمالك
    // participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // قائمة بالمستخدمين داخل الغرفة حالياً
    // maxParticipants: { type: Number, default: 50 },
    // image: { type: String, default: 'default-bg.jpg' } // صورة خلفية للغرفة
}, {
    timestamps: true // يضيف حقول createdAt و updatedAt
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
