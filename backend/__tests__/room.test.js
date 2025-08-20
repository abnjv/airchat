const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const roomRoutes = require('../routes/roomRoutes');
const authRoutes = require('../routes/authRoutes'); // Need for user creation/login
const User = require('../models/User');
const Room = require('../models/Room');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let mongoServer;
let app;
let token;
let userId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    // Mount auth routes to be able to log in and get a token
    app.use('/api/auth', authRoutes);
    app.use('/api/rooms', roomRoutes);

    // Create a user and get a token
    const userRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' });
    token = userRes.body.token;
    userId = userRes.body._id;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Room.deleteMany({});
});

describe('Room API', () => {
    it('should create a room when authenticated', async () => {
        const res = await request(app)
            .post('/api/rooms')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Test Room' });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('name', 'Test Room');
        expect(res.body.owner).toHaveProperty('_id', userId);
    });

    it('should not create a room when not authenticated', async () => {
        const res = await request(app)
            .post('/api/rooms')
            .send({ name: 'Another Room' });

        expect(res.statusCode).toEqual(401);
    });

    it('should get all rooms', async () => {
        // Create a room first
        await Room.create({ name: 'Room 1', owner: userId });
        await Room.create({ name: 'Room 2', owner: userId });

        const res = await request(app).get('/api/rooms');

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(2);
    });

    it('should get a single room by ID', async () => {
        const room = await Room.create({ name: 'Unique Room', owner: userId });

        const res = await request(app).get(`/api/rooms/${room._id}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'Unique Room');
    });

    it('should return 404 for a non-existent room ID', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app).get(`/api/rooms/${nonExistentId}`);

        expect(res.statusCode).toEqual(404);
    });
});
