const JWTService = require('../services/JWTService');
const User = require('../models/user');
const UserDTO = require('../dto/user');

const auth = async (req, res, next) => {
    try {
        let accessToken = req.cookies?.accessToken;

        // Also allow Bearer token from headers
        const authHeader = req.headers.authorization;
        if (!accessToken && authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.split(' ')[1];
        }

        if (!accessToken) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        let _id;
        try {
            _id = JWTService.verifyAccessToken(accessToken)._id;
        } catch (error) {
            return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
        }

        let user;
        try {
            user = await User.findById(_id);
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized: User not found' });
            }
        } catch (error) {
            return next(error);
        }

        const userDto = new UserDTO(user);
        req.user = userDto;

        next();
    } catch (error) {
        return next(error);
    }
};

const adminAuth = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }
        next();
    } catch (error) {
        return next(error);
    }
};

module.exports = auth;
module.exports.auth = auth;
module.exports.adminAuth = adminAuth;