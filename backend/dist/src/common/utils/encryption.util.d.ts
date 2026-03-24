export declare class EncryptionUtils {
    private static readonly ALGORITHM;
    private static readonly IV_LENGTH;
    private static readonly AUTH_TAG_LENGTH;
    static encrypt(text: string, key: string): string;
    static decrypt(encryptedData: string, key: string): string;
}
