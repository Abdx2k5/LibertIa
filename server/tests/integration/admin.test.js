// =============================================================
// T140 — Tests d'intégration : RBAC admin + journaux d'audit (T127)
// =============================================================

const request = require('supertest');
const app = require('../../src/app');
const db = require('../helpers/db');
const User = require('../../src/models/User');
const Agency = require('../../src/models/Agency');
const AuditLog = require('../../src/models/AuditLog');

beforeAll(async () => { await db.connect(); });
afterEach(async () => { await db.clear(); });
afterAll(async () => { await db.disconnect(); });

// Enregistre un utilisateur et renvoie son token ; promeut admin si demandé.
async function makeUser({ email, admin = false } = {}) {
    const reg = await request(app).post('/api/auth/register').send({
        nom: admin ? 'Admin' : 'User',
        email: email || (admin ? 'admin@email.com' : 'user@email.com'),
        motDePasse: 'Secret123!',
    });
    if (admin) {
        await User.findByIdAndUpdate(reg.body._id, { role: 'admin' });
    }
    return { token: reg.body.token, id: reg.body._id };
}

describe('RBAC — routes réservées admin', () => {
    test('un utilisateur standard reçoit 403 sur /api/agences/en-attente', async () => {
        const user = await makeUser();
        const res = await request(app)
            .get('/api/agences/en-attente')
            .set('Authorization', `Bearer ${user.token}`);
        expect(res.status).toBe(403);
    });

    test('un admin reçoit 200 sur /api/agences/en-attente', async () => {
        const admin = await makeUser({ admin: true });
        const res = await request(app)
            .get('/api/agences/en-attente')
            .set('Authorization', `Bearer ${admin.token}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('sans token → 401', async () => {
        const res = await request(app).get('/api/admin/logs');
        expect(res.status).toBe(401);
    });

    test('utilisateur standard → 403 sur /api/admin/logs', async () => {
        const user = await makeUser();
        const res = await request(app)
            .get('/api/admin/logs')
            .set('Authorization', `Bearer ${user.token}`);
        expect(res.status).toBe(403);
    });
});

describe('Validation d\'agence + audit (T127)', () => {
    test('valider une agence : statut approuvee + log admin_valider_agence', async () => {
        const user = await makeUser({ email: 'owner@email.com' });
        const admin = await makeUser({ admin: true });

        // Création de l'agence par l'utilisateur
        const creation = await request(app)
            .post('/api/agences')
            .set('Authorization', `Bearer ${user.token}`)
            .send({ nom: 'Sakura Travel', localisation: 'Tokyo' });
        expect(creation.status).toBe(201);
        const agenceId = creation.body.data._id;

        // Validation par l'admin
        const res = await request(app)
            .patch(`/api/agences/${agenceId}/valider`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(res.status).toBe(200);
        expect(res.body.data.statut).toBe('approuvee');

        // Persistance + audit
        const agence = await Agency.findById(agenceId);
        expect(agence.statut).toBe('approuvee');
        expect(agence.verifiee).toBe(true);

        const log = await AuditLog.findOne({ action: 'admin_valider_agence' });
        expect(log).not.toBeNull();
        expect(log.success).toBe(true);
        expect(String(log.userId)).toBe(String(admin.id));
        expect(log.details.agenceId).toBe(String(agenceId));
    });

    test('rejeter une agence : statut rejetee + motif + log admin_rejeter_agence', async () => {
        const user = await makeUser({ email: 'owner2@email.com' });
        const admin = await makeUser({ admin: true });

        const creation = await request(app)
            .post('/api/agences')
            .set('Authorization', `Bearer ${user.token}`)
            .send({ nom: 'Sunset Deals' });
        const agenceId = creation.body.data._id;

        const res = await request(app)
            .patch(`/api/agences/${agenceId}/rejeter`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ motif: 'Avis frauduleux' });
        expect(res.status).toBe(200);
        expect(res.body.data.statut).toBe('rejetee');
        expect(res.body.data.motifRejet).toBe('Avis frauduleux');

        const log = await AuditLog.findOne({ action: 'admin_rejeter_agence' });
        expect(log).not.toBeNull();
        expect(log.details.motif).toBe('Avis frauduleux');
    });
});

describe('GET /api/admin/logs (T127)', () => {
    test('renvoie les journaux paginés à l\'admin', async () => {
        const admin = await makeUser({ admin: true });
        // l'inscription a déjà produit des logs "register"
        const res = await request(app)
            .get('/api/admin/logs?action=register')
            .set('Authorization', `Bearer ${admin.token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.pagination).toMatchObject({ page: 1 });
        // le filtre par action est respecté
        expect(res.body.data.every((l) => l.action === 'register')).toBe(true);
    });

    test('expose des statistiques agrégées', async () => {
        const admin = await makeUser({ admin: true });
        const res = await request(app)
            .get('/api/admin/logs/stats')
            .set('Authorization', `Bearer ${admin.token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.total).toBeGreaterThan(0);
        expect(Array.isArray(res.body.data.parAction)).toBe(true);
    });
});
