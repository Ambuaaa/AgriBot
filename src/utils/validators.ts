import Joi from 'joi';
import { body } from 'express-validator';

export const authValidation = {
  register: Joi.object({
    phone: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be a valid 10-digit Indian mobile number'
      }),
    name: Joi.string()
      .min(2)
      .max(50)
      .required(),
    email: Joi.string()
      .email()
      .optional(),
    language: Joi.string()
      .valid('hi', 'en', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml')
      .default('hi'),
    location: Joi.string()
      .optional()
  }),

  login: Joi.object({
    phone: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be a valid 10-digit Indian mobile number'
      })
  }),

  verify: Joi.object({
    phone: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required(),
    otp: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.pattern.base': 'OTP must be a 6-digit number'
      })
  }),

  updatePreferences: Joi.object({
    language: Joi.string()
      .valid('hi', 'en', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml'),
    voiceEnabled: Joi.boolean(),
    weatherAlerts: Joi.boolean(),
    priceAlerts: Joi.boolean(),
    cropReminders: Joi.boolean(),
    preferredCrops: Joi.array()
      .items(Joi.string()),
    preferredMarkets: Joi.array()
      .items(Joi.string())
  })
};

export const chatValidation = {
  sendMessage: Joi.object({
    content: Joi.string()
      .required(),
    conversationId: Joi.string()
      .optional(),
    messageType: Joi.string()
      .valid('text', 'voice', 'image')
      .default('text'),
    language: Joi.string()
      .valid('hi', 'en', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml')
      .default('hi')
  })
};

export const marketValidation = {
  getPrices: Joi.object({
    crop: Joi.string()
      .required(),
    market: Joi.string()
      .optional(),
    state: Joi.string()
      .optional(),
    fromDate: Joi.date()
      .optional(),
    toDate: Joi.date()
      .optional()
  }),

  setAlert: Joi.object({
    crop: Joi.string()
      .required(),
    market: Joi.string()
      .required(),
    targetPrice: Joi.number()
      .required(),
    condition: Joi.string()
      .valid('above', 'below')
      .required()
  })
};

export const weatherValidation = {
  getWeather: Joi.object({
    location: Joi.string()
      .required(),
    type: Joi.string()
      .valid('current', 'forecast')
      .default('current')
  }),

  setAlert: Joi.object({
    location: Joi.string()
      .required(),
    alertType: Joi.string()
      .valid('rain', 'temperature', 'humidity')
      .required(),
    threshold: Joi.number()
      .required()
  })
};

export const authValidators = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('name')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters long')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  forgotPassword: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email')
  ],

  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error('New password must be different from current password');
        }
        return true;
      })
  ]
}; 