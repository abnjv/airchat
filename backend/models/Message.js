const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: false, // Not required if it's a private message
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: false, // Not required if it's a room message
    }
}, { timestamps: true });

// Add a validator to ensure a message belongs to either a room or a conversation, but not both.
MessageSchema.pre('validate', function(next) {
    if (!this.room && !this.conversation) {
        next(new Error('Message must belong to a room or a conversation.'));
    }
    if (this.room && this.conversation) {
        next(new Error('Message cannot belong to both a room and a conversation.'));
    }
    next();
});

module.exports = mongoose.model('Message', MessageSchema);
