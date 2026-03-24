"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionUtils = void 0;
const crypto = require("crypto");
class EncryptionUtils {
    static encrypt(text, key) {
        const iv = crypto.randomBytes(this.IV_LENGTH);
        const cipher = crypto.createCipheriv(this.ALGORITHM, Buffer.from(key, 'hex'), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    }
    static decrypt(encryptedData, key) {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encryptedText = Buffer.from(parts[2], 'hex');
        const decipher = crypto.createDecipheriv(this.ALGORITHM, Buffer.from(key, 'hex'), iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedText, undefined, 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
exports.EncryptionUtils = EncryptionUtils;
EncryptionUtils.ALGORITHM = 'aes-256-gcm';
EncryptionUtils.IV_LENGTH = 16;
EncryptionUtils.AUTH_TAG_LENGTH = 16;
//# sourceMappingURL=encryption.util.js.map