// Fail at boot rather than fall back to a known value. A default secret here
// would mean a misconfigured deployment silently issues tokens that anyone
// reading this file could forge.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Copy backend/.env.example to backend/.env and fill it in.');
}

module.exports = {
    JWT_SECRET
}
