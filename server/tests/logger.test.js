// T140 — Tests du logger Winston (T138)
const logger = require('../src/config/logger');

describe('logger — configuration Winston', () => {
    test('expose les méthodes de log standard', () => {
        for (const level of ['error', 'warn', 'info', 'http', 'debug']) {
            expect(typeof logger[level]).toBe('function');
        }
    });

    test('niveau "http" conservé (logs Morgan non filtrés)', () => {
        // priorités winston : error0 warn1 info2 http3 debug5
        expect(logger.levels.http).toBeLessThanOrEqual(logger.levels.debug);
    });

    test('écrit dans des transports fichier (error.log + combined.log)', () => {
        const fileTransports = logger.transports.filter((t) => t.filename);
        const names = fileTransports.map((t) => t.filename);
        expect(names).toEqual(expect.arrayContaining(['error.log', 'combined.log']));
    });

    test('aucune sortie console en environnement de test', () => {
        const hasConsole = logger.transports.some(
            (t) => t.constructor.name === 'Console'
        );
        expect(hasConsole).toBe(false);
    });

    test('expose un stream compatible Morgan', () => {
        expect(typeof logger.stream.write).toBe('function');
        expect(() => logger.stream.write('GET /test 200\n')).not.toThrow();
    });
});
