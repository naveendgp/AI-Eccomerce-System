const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ msg: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, "ADMIN_SECRET");
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ msg: 'Invalid token' });
    }
};

module.exports = authenticateToken;