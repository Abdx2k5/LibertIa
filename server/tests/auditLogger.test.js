// T140 — Tests du logger d'audit (SA4 / T127)
// On isole le modèle Mongo et le logger Winston pour éviter toute I/O.

jest.mock('../src/models/AuditLog', () => ({
    create: jest.fn().mockResolvedValue({}),
}));

const AuditLog = require('../src/models/AuditLog');
const logger = require('../src/config/logger');
const { auditLog } = require('../src/utils/auditLogger');

const fakeReq = {
    ip: '203.0.113.5',
    headers: { 'user-agent': 'jest' },
};

describe('auditLogger — auditLog', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('persiste l\'action en base avec ip et userAgent', async () => {
        await auditLog({ userId: 'u1', action: 'login', req: fakeReq, success: true });

        expect(AuditLog.create).toHaveBeenCalledTimes(1);
        const arg = AuditLog.create.mock.calls[0][0];
        expect(arg).toMatchObject({
            userId: 'u1',
            action: 'login',
            ip: '203.0.113.5',
            userAgent: 'jest',
            success: true,
        });
    });

    test('succès → trace logger.info', async () => {
        const info = jest.spyOn(logger, 'info').mockImplementation(() => {});
        await auditLog({ userId: 'u1', action: 'admin_valider_agence', req: fakeReq, success: true });
        expect(info).toHaveBeenCalledWith('audit:admin_valider_agence', expect.objectContaining({ success: true }));
        info.mockRestore();
    });

    test('échec métier → trace logger.warn', async () => {
        const warn = jest.spyOn(logger, 'warn').mockImplementation(() => {});
        await auditLog({ action: 'login', req: fakeReq, success: false, details: { raison: 'mauvais mot de passe' } });
        expect(warn).toHaveBeenCalledWith('audit:login', expect.objectContaining({ success: false, raison: 'mauvais mot de passe' }));
        warn.mockRestore();
    });

    test('une erreur d\'écriture en base ne propage pas (logguée en error)', async () => {
        AuditLog.create.mockRejectedValueOnce(new Error('DB down'));
        const error = jest.spyOn(logger, 'error').mockImplementation(() => {});

        await expect(
            auditLog({ action: 'logout', req: fakeReq, success: true })
        ).resolves.toBeUndefined();

        expect(error).toHaveBeenCalledWith(expect.stringMatching(/audit_logs.*DB down/));
        error.mockRestore();
    });
});
