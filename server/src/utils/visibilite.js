const User = require('../models/User');

// ─────────────────────────────────────────────
//  Un voyage est-il visible pour cet utilisateur ?
//   - propriétaire        → toujours
//   - visibilite "public" → tout le monde
//   - visibilite "amis"   → propriétaire + ses followers
//   - visibilite "prive"  → propriétaire uniquement
// ─────────────────────────────────────────────
async function estVoyageVisiblePour(voyage, user) {
    if (!user) return voyage.visibilite === 'public';
    if (voyage.user.toString() === user._id.toString()) return true;

    if (voyage.visibilite === 'public') return true;

    if (voyage.visibilite === 'amis') {
        const proprietaire = await User.findById(voyage.user).select('followers');
        return !!proprietaire?.followers?.some(f => f.toString() === user._id.toString());
    }

    return false;
}

module.exports = { estVoyageVisiblePour };
