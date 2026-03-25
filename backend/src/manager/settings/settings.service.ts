import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class ManagerSettingsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getSettings(managerId: string) {
    // Return mock settings or actual user preferences if available
    const manager = await this.userRepo.findOne({ where: { id: managerId } });
    return {
      notifications: {
        email: true,
        inApp: true,
        summaryFrequency: 'daily',
      },
      displayPreference: 'standard',
    };
  }

  async updateSettings(managerId: string, data: any) {
    // Logic to save settings
    return { success: true, ...data };
  }
}
