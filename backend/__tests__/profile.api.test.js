const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const profileRoutes = require('../routes/profileRoutes');
const authRoutes = require('../routes/authRoutes');
const User = require('../models/User');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const fs = require('fs');

let mongoServer;
let app;
let token;
let userId;

// Create uploads directory for tests
beforeAll(async () => {
    fs.mkdirSync(path.join(__dirname, '../../uploads'), { recursive: true });

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/profile', profileRoutes);
    app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

    const user = await User.create({ username: 'profiletestuser', password: 'password123', email: 'profile@test.com' });
    userId = user._id;
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Profile API', () => {
    it('should update a user bio', async () => {
        const newBio = "This is my new bio.";
        const res = await request(app)
            .put('/api/profile')
            .set('Authorization', `Bearer ${token}`)
            .send({ bio: newBio });

        expect(res.statusCode).toEqual(200);
        expect(res.body.bio).toBe(newBio);
    });

    it('should upload a profile picture', async () => {
        const res = await request(app)
            .post('/api/profile/upload')
            .set('Authorization', `Bearer ${token}`)
            .attach('profilePicture', 'test_assets/test-image.png'); // Assuming a test image exists

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('profilePicture');
        expect(res.body.profilePicture).toMatch(/^\/uploads\//);
    });
});
