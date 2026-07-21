import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetUrgentDto {
  @ApiProperty()
  @IsBoolean()
  isUrgent: boolean;
}
