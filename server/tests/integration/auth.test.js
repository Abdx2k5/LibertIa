// =============================================================
// T140 — Tests d'intégration : authentification (route-level)
// supertest + mongodb-memory-server, sans ouvrir de port.
// =============================================================

const request = require('supertest');
const app = require('../../src/app');
const db = require('../helpers/db');
const User = require('../../src/models/User');

beforeAll(async () => { await db.connect(); });
afterEach(async () => { await db.clear(); });
afterAll(async () => { await db.disconnect(); });

const VALID = { nom: 'Marie Dupont', email: 'marie@email.com', motDePasse: 'Secret123!', age: 29 };

describe('POST /api/auth/register', () => {
    test('crée un compte et renvoie un token', async () => {
        const res = await request(app).post('/api/auth/register').send(VALID);

        expect(res.status).toBe(201);
        expect(res.body.token).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
        expect(res.body.email).toBe('marie@email.com');
        expect(res.body.role).toBe('user');
        // le mot de passe ne doit jamais transiter
        expect(res.body.motDePasse).toBeUndefined();

        // persistance effective + hash bcrypt
        const inDb = await User.findOne({ email: 'marie@email.com' });
        expect(inDb).not.toBeNull();
        expect(inDb.motDePasse).not.toBe(VALID.motDePasse);
    });

    test('refuse un email déjà utilisé (400)', async () => {
        await request(app).post('/api/auth/register').send(VALID);
        const res = await request(app).post('/api/auth/register').send(VALID);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/déjà utilisé/i);
    });
});

describe('POST /api/auth/login', () => {
    beforeEach(async () => { await request(app).post('/api/auth/register').send(VALID); });

    test('connecte avec les bons identifiants', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: VALID.email, motDePasse: VALID.motDePasse });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    test('rejette un mauvais mot de passe (401)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: VALID.email, motDePasse: 'mauvais' });

        expect(res.status).toBe(401);
        expect(res.body.token).toBeUndefined();
    });

    test('rejette un email inconnu (401)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'inconnu@email.com', motDePasse: 'x' });

        expect(res.status).toBe(401);
    });
});

describe('GET /api/auth/me (route protégée)', () => {
    test('401 sans token', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });

    test('401 avec un token bidon', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer not.a.real.token');
        expect(res.status).toBe(401);
    });

    test('200 et profil avec un token valide', async () => {
        const reg = await request(app).post('/api/auth/register').send(VALID);
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${reg.body.token}`);

        expect(res.status).toBe(200);
        expect(res.body.email).toBe('marie@email.com');
        expect(res.body.motDePasse).toBeUndefined();
    });
});
