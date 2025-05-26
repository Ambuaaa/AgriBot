import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/app.config';
import logger from '../utils/logger';
import { translateText } from '../services/translate.service';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const chatController = {
  // Start new conversation
  async startConversation(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { title } = req.body;

      const conversation = await prisma.conversation.create({
        data: {
          userId,
          title: title || 'New Conversation',
          isActive: true
        }
      });

      res.json(conversation);
    } catch (error) {
      logger.error('Error in startConversation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Send message and get AI response
  async sendMessage(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
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
        englishContent = await translateText(content, language, 'en');
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
        parts: [{ text: msg.content }]
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
        translatedResponse = await translateText(aiResponse, 'en', language);
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
    } catch (error) {
      logger.error('Error in sendMessage:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get conversation messages
  async getMessages(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
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
    } catch (error) {
      logger.error('Error in getMessages:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // End conversation
  async endConversation(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
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
    } catch (error) {
      logger.error('Error in endConversation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}; 