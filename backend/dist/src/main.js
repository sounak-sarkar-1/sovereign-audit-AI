"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const transform_response_interceptor_1 = require("./common/interceptors/transform-response.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
async function bootstrap() {
    console.log('Bootstrap starting...');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    console.log('Nest application created');
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_response_interceptor_1.TransformResponseInterceptor());
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    });
    const port = process.env.PORT ?? 3000;
    console.log(`Attempting to listen on port ${port}...`);
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch(err => {
    console.error('Bootstrap failed!', err);
});
//# sourceMappingURL=main.js.map