import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsEnum, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApplicationStatus } from '@/common/constants/enums';

export class BulkStatusUpdateDto {
  @ApiProperty({ type: [String] })
  @IsMongoId({ each: true })
  @ArrayNotEmpty()
  ids: string[];

  @ApiProperty({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remark?: string;
}
