import { translate } from 'google-translate-api-x';
import logger from '../utils/logger';

export async function translateText(text: string, from: string, to: string): Promise<string> {
  try {
    const result = await translate(text, { from, to });
    return result.text;
  } catch (error) {
    logger.error('Translation error:', error);
    return text; // Return original text on error
  }
} 