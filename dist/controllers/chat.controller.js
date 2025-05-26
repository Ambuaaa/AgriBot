"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const client_1 = require("@prisma/client");
const generative_ai_1 = require("@google/generative-ai");
const app_config_1 = require("../config/app.config");
const logger_1 = require("../utils/logger");
const translate_service_1 = require("../services/translate.service");
const prisma = new client_1.PrismaClient();
const genAI = new generative_ai_1.GoogleGenerativeAI(app_config_1.config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
exports.chatController = {
    // Start new conversation
    async startConversation(req, res) {
        try {
            const userId = req.user?.id;
            const { title } = req.body;
            const conversation = await prisma.conversation.create({
                data: {
                    userId,
                    title: title || 'New Conversation',
                    isActive: true
                }
            });
            res.json(conversation);
        }
        catch (error) {
            logger_1.logger.error('Error in startConversation:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    // Send message and get AI response
    async sendMessage(req, res) {
        try {
            const userId = req.user?.id;
            const { conversationId, content, language = 'en' } = req.body;
            // Validate conversation
            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    userId,
                    isActive: true
                }
            });
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
            // Save user message
            const userMessage = await prisma.message.create({
                data: {
                    conversationId,
                    content,
                    role: 'user',
                    language
                }
            });
            // Translate to English if needed
            let englishContent = content;
            if (language !== 'en') {
                englishContent = await (0, translate_service_1.translateText)(content, language, 'en');
            }
            // Get chat history for context
            const previousMessages = await prisma.message.findMany({
                where: {
                    conversationId,
                    createdAt: {
                        lt: userMessage.createdAt
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                },
                take: 10 // Get last 10 messages for context
            });
            // Prepare chat history for Gemini
            const chatHistory = previousMessages.map(msg => ({
                role: msg.role,
                parts: msg.content
            }));
            // Start a new chat
            const chat = model.startChat({
                history: chatHistory,
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7,
                },
            });
            // Generate response with Gemini
            const result = await chat.sendMessage(`You are AgriBot, an AI assistant specialized in agriculture. You help farmers with crop guidance, weather information, and market prices. Be concise, practical, and use simple language. Here's the user's message: ${englishContent}`);
            const aiResponse = result.response.text();
            // Translate AI response if needed
            let translatedResponse = aiResponse;
            if (language !== 'en') {
                translatedResponse = await (0, translate_service_1.translateText)(aiResponse, 'en', language);
            }
            // Save AI response
            const assistantMessage = await prisma.message.create({
                data: {
                    conversationId,
                    content: translatedResponse,
                    role: 'assistant',
                    language
                }
            });
            // Update conversation
            await prisma.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() }
            });
            res.json({
                userMessage,
                assistantMessage
            });
        }
        catch (error) {
            logger_1.logger.error('Error in sendMessage:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    // Get conversation messages
    async getMessages(req, res) {
        try {
            const userId = req.user?.id;
            const { conversationId } = req.params;
            const messages = await prisma.message.findMany({
                where: {
                    conversationId,
                    conversation: {
                        userId
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });
            res.json(messages);
        }
        catch (error) {
            logger_1.logger.error('Error in getMessages:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    // End conversation
    async endConversation(req, res) {
        try {
            const userId = req.user?.id;
            const { conversationId } = req.params;
            const conversation = await prisma.conversation.updateMany({
                where: {
                    id: conversationId,
                    userId
                },
                data: {
                    isActive: false
                }
            });
            res.json({ message: 'Conversation ended successfully' });
        }
        catch (error) {
            logger_1.logger.error('Error in endConversation:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
//# sourceMappingURL=chat.controller.js.map