"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateText = void 0;
const google_translate_api_x_1 = require("google-translate-api-x");
const logger_1 = require("../utils/logger");
const translateText = async (text, fromLang, toLang) => {
    try {
        if (!text || fromLang === toLang) {
            return text;
        }
        const result = await (0, google_translate_api_x_1.translate)(text, {
            from: fromLang,
            to: toLang
        });
        return result.text;
    }
    catch (error) {
        logger_1.logger.error('Translation error:', error);
        // Return original text if translation fails
        return text;
    }
};
exports.translateText = translateText;
//# sourceMappingURL=translate.service.js.map