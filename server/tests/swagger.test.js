// T140 — Tests de la spécification OpenAPI (T141)
const { swaggerSpec, swaggerHtml } = require('../src/config/swagger');

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];

describe('swagger — métadonnées', () => {
    test('version OpenAPI 3.x et info de base', () => {
        expect(swaggerSpec.openapi).toMatch(/^3\./);
        expect(swaggerSpec.info.title).toBe('Libertia API');
        expect(swaggerSpec.info.version).toBeDefined();
    });

    test('schéma de sécurité JWT bearer déclaré', () => {
        const scheme = swaggerSpec.components.securitySchemes.bearerAuth;
        expect(scheme).toEqual({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' });
    });
});

describe('swagger — cohérence des chemins', () => {
    test('définit un nombre conséquent d\'opérations', () => {
        const ops = Object.values(swaggerSpec.paths)
            .flatMap((p) => Object.keys(p).filter((m) => METHODS.includes(m)));
        expect(ops.length).toBeGreaterThan(40);
    });

    test('aucune référence $ref cassée', () => {
        const schemas = new Set(Object.keys(swaggerSpec.components.schemas));
        const broken = [];
        const walk = (o) => {
            if (!o || typeof o !== 'object') return;
            for (const [k, v] of Object.entries(o)) {
                if (k === '$ref' && typeof v === 'string') {
                    const name = v.replace('#/components/schemas/', '');
                    if (!schemas.has(name)) broken.push(v);
                } else {
                    walk(v);
                }
            }
        };
        walk(swaggerSpec.paths);
        expect(broken).toEqual([]);
    });

    test('chaque opération porte au moins un tag et des réponses', () => {
        for (const [path, item] of Object.entries(swaggerSpec.paths)) {
            for (const method of Object.keys(item)) {
                if (!METHODS.includes(method)) continue;
                const op = item[method];
                const where = `${method.toUpperCase()} ${path}`;
                expect(Array.isArray(op.tags) && op.tags.length > 0).toBe(true);
                expect(op.responses && Object.keys(op.responses).length > 0).toBe(true);
                // `where` documente l'emplacement en cas d'échec
                expect(typeof where).toBe('string');
            }
        }
    });

    test('les routes admin/export documentent une réponse 403', () => {
        const adminPaths = ['/api/export/utilisateurs', '/api/admin/logs', '/api/agences/{id}/valider'];
        for (const p of adminPaths) {
            const op = Object.values(swaggerSpec.paths[p])[0];
            expect(op.responses['403']).toBeDefined();
        }
    });

    test('le spec est sérialisable en JSON', () => {
        expect(() => JSON.stringify(swaggerSpec)).not.toThrow();
    });
});

describe('swagger — page HTML', () => {
    test('charge le bundle Swagger UI et pointe sur /api-docs.json', () => {
        expect(swaggerHtml).toContain('swagger-ui-bundle.js');
        expect(swaggerHtml).toContain('/api-docs.json');
    });
});
