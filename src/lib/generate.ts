import crypto from 'node:crypto';
import { rword } from 'rword';

/**
   * Google Cloud-style project ID generator
   *
   * Two random words hyphenated with a 6-digit suffix, max 30 characters: owl-phlegmatic-522355

   * @param length (Optional, default `30`) maximum total characters
   * @param words (Optional, default `2`) number of words to generate
   * @param digits (Optional, default `6`) number of digits in suffix
   * @param separator (Optional, default `-`) separator between words
   */
export function projectId(length = 30, words = 2, digits = 6, separator = '-') {
  const word = [];
  for (let i = 0; i < words; i++) {
    word.push(
      rword.generate(1, {
        length: `${(length - digits - words * separator.length) / words / 2}-${
          length -
          digits -
          words * separator.length -
          word.reduce((sum, w) => sum + w.length, 0) / (words - i)
        }`
      })
    );
  }
  const suffix = Math.floor(
    Math.pow(10, digits - 1) -
      1 +
      Math.random() * (9 * Math.pow(10, digits - 1) + 1)
  );
  return `${word.join(separator)}${separator}${suffix}`;
}

/**
 * Randomly generated password
 *
 * @param length number of characters
 * @param encoding (Optional, default `base64`) encoding for random bytes
 */
export function password(length = 15, encoding: BufferEncoding = 'base64') {
  return crypto.randomBytes(length).toString(encoding).substring(0, length);
}
