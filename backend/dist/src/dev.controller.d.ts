import { Repository } from 'typeorm';
import { User } from './database/entities/user.entity';
export declare class DevController {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    setupAdmin(): Promise<{
        message: string;
        email: string;
        password: string;
    } | {
        message: string;
        email: string;
        password?: undefined;
    }>;
}
