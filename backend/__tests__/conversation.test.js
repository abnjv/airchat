const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const conversationRoutes = require('../routes/conversationRoutes');
const authRoutes = require('../routes/authRoutes');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const path = require('path');
const jwt = require('jsonwebtoken'); // Added this line
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let mongoServer;
let app;
let user1Token, user2Token;
let user1Id, user2Id;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    // We need the protect middleware, so we need to mount the routes that use it.
    // The middleware itself is not directly applied to the app instance in tests.
    app.use('/api/auth', authRoutes);
    app.use('/api/conversations', conversationRoutes);

    // Add a basic error handler for tests
    app.use((err, req, res, next) => {
        console.error("TEST_ERROR_HANDLER:", err.stack);
        res.status(res.statusCode || 500).json({ message: err.message });
    });

    // Create two users directly in the database to bypass controller logic and avoid email index issue
    const user1 = await User.create({ username: 'user1', password: 'password123', email: 'user1@test.com' });
    user1Id = user1._id;
    user1Token = jwt.sign({ id: user1Id }, process.env.JWT_SECRET);

    const user2 = await User.create({ username: 'user2', password: 'password123', email: 'user2@test.com' });
    user2Id = user2._id;
    user2Token = jwt.sign({ id: user2Id }, process.env.JWT_SECRET);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await Conversation.deleteMany({});
});

describe('Conversation API', () => {
    it('should create a new conversation if one does not exist', async () => {
        const res = await request(app)
            .post('/api/conversations')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ userId: user2Id });

        expect(res.statusCode).toEqual(201);
        expect(res.body.participants).toContain(user1Id.toString());
        expect(res.body.participants).toContain(user2Id.toString());
    });

    it('should fetch an existing conversation if one exists', async () => {
        // First, create it
        await request(app)
            .post('/api/conversations')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ userId: user2Id });

        // Then, try to create it again
        const res = await request(app)
            .post('/api/conversations')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ userId: user2Id });

        expect(res.statusCode).toEqual(200); // Should return existing one
    });

    it('should get all conversations for a user', async () => {
        // Create a conversation
        await request(app)
            .post('/api/conversations')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ userId: user2Id });

        const res = await request(app)
            .get('/api/conversations')
            .set('Authorization', `Bearer ${user1Token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(1);
        expect(res.body[0].participants.some(p => p.username === 'user1')).toBe(true);
    });
});
