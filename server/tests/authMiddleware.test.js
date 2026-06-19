// T140 — Tests unitaires du middleware d'authentification / autorisation
const { proteger, admin } = require('../src/middlewares/authMiddleware');

// Fabrique un objet réponse Express minimal et instrumenté
const makeRes = () => {
    const res = { statusCode: null, body: null };
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (b) => { res.body = b; return res; };
    return res;
};

describe('authMiddleware — admin', () => {
    test('laisse passer un administrateur', () => {
        const req = { user: { role: 'admin' } };
        const res = makeRes();
        const next = jest.fn();

        admin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBeNull();
    });

    test('bloque un utilisateur standard avec 403', () => {
        const req = { user: { role: 'user' } };
        const res = makeRes();
        const next = jest.fn();

        admin(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/administrateurs/i);
    });

    test('bloque quand req.user est absent', () => {
        const res = makeRes();
        const next = jest.fn();

        admin({}, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(403);
    });
});

describe('authMiddleware — proteger (sans token)', () => {
    test('renvoie 401 quand aucun header Authorization n\'est fourni', async () => {
        const req = { headers: {} };
        const res = makeRes();
        const next = jest.fn();

        await proteger(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toMatch(/token manquant/i);
    });

    test('renvoie 401 quand le header n\'est pas de type Bearer', async () => {
        const req = { headers: { authorization: 'Basic abc' } };
        const res = makeRes();
        const next = jest.fn();

        await proteger(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(401);
    });
});
