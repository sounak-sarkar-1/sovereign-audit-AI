declare const _default: () => {
    nodeEnv: string;
    port: number;
    frontendUrl: string;
    database: {
        url: string;
        ssl: boolean;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    encryption: {
        aesKey: string;
    };
    storage: {
        driver: string;
        localPath: string;
        s3Bucket: string;
        s3Region: string;
        s3Endpoint: string;
    };
    ai: {
        requestTimeoutMs: number;
    };
    pgBoss: {
        schema: string;
    };
};
export default _default;
