const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const geminiRoutes = require('../routes/geminiRoutes');
const authRoutes = require('../routes/authRoutes');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let mongoServer;
let app;
let token;

// Mock the global fetch function
global.fetch = jest.fn();

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/gemini', geminiRoutes);

    // Create a user and get a token
    const userRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'geminiuser', password: 'password123' });
    token = userRes.body.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(() => {
    // Reset the mock before each test
    fetch.mockClear();
});

describe('Gemini API', () => {
    it('should return a response from Gemini when authenticated', async () => {
        const mockResponse = {
            candidates: [{ content: { parts: [{ text: 'Hello from Gemini!' }] } }]
        };
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const res = await request(app)
            .post('/api/gemini/chat')
            .set('Authorization', `Bearer ${token}`)
            .send({ prompt: 'Hello' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('response', 'Hello from Gemini!');
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should not allow access without authentication', async () => {
        const res = await request(app)
            .post('/api/gemini/chat')
            .send({ prompt: 'Hello' });

        expect(res.statusCode).toEqual(401);
        expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle errors from the Gemini API', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: { message: 'Internal API error' } }),
        });

        const res = await request(app)
            .post('/api/gemini/chat')
            .set('Authorization', `Bearer ${token}`)
            .send({ prompt: 'A prompt that causes an error' });

        expect(res.statusCode).toEqual(500);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if no prompt is provided', async () => {
        const res = await request(app)
            .post('/api/gemini/chat')
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(res.statusCode).toEqual(400);
        expect(fetch).not.toHaveBeenCalled();
    });
});
