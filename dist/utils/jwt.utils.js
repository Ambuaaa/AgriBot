"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTUtils = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_config_1 = require("../config/app.config");
class JWTUtils {
    /**
     * Generate JWT token
     */
    static generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.secret, {
            expiresIn: this.expiresIn,
        });
    }
    /**
     * Verify JWT token
     */
    static verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.secret);
            return decoded;
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
    /**
     * Extract token from authorization header
     */
    static extractTokenFromHeader(header) {
        if (!header || !header.startsWith('Bearer ')) {
            throw new Error('No token provided');
        }
        return header.split(' ')[1];
    }
    /**
     * Refresh token
     */
    static refreshToken(oldToken) {
        const decoded = this.verifyToken(oldToken);
        return this.generateToken({
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        });
    }
}
exports.JWTUtils = JWTUtils;
JWTUtils.secret = app_config_1.config.jwtSecret;
JWTUtils.expiresIn = app_config_1.config.jwtExpiresIn;
//# sourceMappingURL=jwt.utils.js.map