"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
exports.userController = {
    // Get user profile
    async getProfile(req, res) {
        try {
            const userId = req.user?.id;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    preferences: true,
                    subscriptions: true
                }
            });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        }
        catch (error) {
            logger_1.logger.error('Error in getProfile:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    // Update user profile
    async updateProfile(req, res) {
        try {
            const userId = req.user?.id;
            const { name, email, language, location } = req.body;
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    name,
                    email,
                    language,
                    location
                },
                include: {
                    preferences: true
                }
            });
            res.json(updatedUser);
        }
        catch (error) {
            logger_1.logger.error('Error in updateProfile:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    // Update user preferences
    async updatePreferences(req, res) {
        try {
            const userId = req.user?.id;
            const { language, voiceEnabled, weatherAlerts, priceAlerts, cropReminders, preferredCrops, preferredMarkets } = req.body;
            const preferences = await prisma.userPreference.upsert({
                where: { userId },
                update: {
                    language,
                    voiceEnabled,
                    weatherAlerts,
                    priceAlerts,
                    cropReminders,
                    preferredCrops,
                    preferredMarkets
                },
                create: {
                    userId,
                    language,
                    voiceEnabled,
                    weatherAlerts,
                    priceAlerts,
                    cropReminders,
                    preferredCrops,
                    preferredMarkets
                }
            });
            res.json(preferences);
        }
        catch (error) {
            logger_1.logger.error('Error in updatePreferences:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    // Get user conversations
    async getConversations(req, res) {
        try {
            const userId = req.user?.id;
            const conversations = await prisma.conversation.findMany({
                where: { userId },
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });
            res.json(conversations);
        }
        catch (error) {
            logger_1.logger.error('Error in getConversations:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    // Delete user account
    async deleteAccount(req, res) {
        try {
            const userId = req.user?.id;
            await prisma.user.delete({
                where: { id: userId }
            });
            res.json({ message: 'Account deleted successfully' });
        }
        catch (error) {
            logger_1.logger.error('Error in deleteAccount:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
//# sourceMappingURL=user.controller.js.map