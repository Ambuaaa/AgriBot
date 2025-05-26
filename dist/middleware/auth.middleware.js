"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_config_1 = require("../config/app.config");
const protect = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token, authorization denied'
            });
        }
        const token = authHeader.split(' ')[1];
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, app_config_1.config.jwtSecret);
        // Add user to request
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};
exports.protect = protect;
class AuthMiddleware {
    /**
     * Check if user has required role
     */
    static hasRole(role) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }
            if (req.user.role !== role) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden access'
                });
            }
            next();
        };
    }
    /**
     * Refresh token middleware
     */
    static refreshToken(req, res) {
        try {
            const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);
            const newToken = JWTUtils.refreshToken(token);
            res.json({
                success: true,
                token: newToken
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    }
}
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=auth.middleware.js.map