import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Public } from '@/common/decorators/public.decorator';

@ApiExcludeController()
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Public()
  @Get()
  check() {
    const dbState = this.connection.readyState === 1 ? 'up' : 'down';
    return {
      status: dbState === 'up' ? 'ok' : 'degraded',
      uptimeSeconds: Math.floor(process.uptime()),
      mongo: dbState,
      timestamp: new Date().toISOString(),
    };
  }
}
