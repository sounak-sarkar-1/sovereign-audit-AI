"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const users_service_1 = require("../admin/users/users.service");
const user_entity_1 = require("../database/entities/user.entity");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const userService = app.get(users_service_1.AdminUsersService);
    const adminEmail = 'admin@example.com';
    const adminPassword = 'Password123!';
    try {
        const existing = await userService.findByEmail(adminEmail);
        if (existing) {
            console.log('Admin user already exists');
        }
        else {
            await userService.create({
                email: adminEmail,
                fullName: 'System Administrator',
                role: user_entity_1.UserRole.ADMIN,
                defaultPassword: adminPassword,
            });
            console.log('Admin user created successfully');
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
        }
    }
    catch (error) {
        console.error('Error seeding admin user:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=seed.js.map