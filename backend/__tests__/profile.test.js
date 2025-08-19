const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const profileRoutes = require('../routes/profileRoutes');
const authRoutes = require('../routes/authRoutes');
const User = require('../models/User');
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
    app.use('/api/auth', authRoutes);
    app.use('/api/profile', profileRoutes);

    // Create a user and get a token
    const userRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'profileuser', password: 'password123' });
    token = userRes.body.token;
    userId = userRes.body._id;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Profile API', () => {
    it('should get a user profile by ID', async () => {
        const res = await request(app).get(`/api/profile/${userId}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('username', 'profileuser');
        expect(res.body).not.toHaveProperty('password'); // Ensure password is not returned
    });

    it('should return 404 for a non-existent user profile', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app).get(`/api/profile/${nonExistentId}`);

        expect(res.statusCode).toEqual(404);
    });

    it('should update profile picture when authenticated', async () => {
        const newImageUrl = 'http://example.com/new-pic.jpg';
        const res = await request(app)
            .put('/api/profile/picture')
            .set('Authorization', `Bearer ${token}`)
            .send({ imageUrl: newImageUrl });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('profilePicture', newImageUrl);

        // Verify in the database
        const user = await User.findById(userId);
        expect(user.profilePicture).toBe(newImageUrl);
    });

    it('should not update profile picture when not authenticated', async () => {
        const newImageUrl = 'http://example.com/another-pic.jpg';
        const res = await request(app)
            .put('/api/profile/picture')
            .send({ imageUrl: newImageUrl });

        expect(res.statusCode).toEqual(401);
    });

    it('should return 400 if imageUrl is not provided', async () => {
        const res = await request(app)
            .put('/api/profile/picture')
            .set('Authorization', `Bearer ${token}`)
            .send({}); // No imageUrl

        expect(res.statusCode).toEqual(400);
    });
});
