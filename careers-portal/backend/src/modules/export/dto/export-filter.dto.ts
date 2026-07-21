import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsMongoId, IsOptional, IsString, Min } from 'class-validator';
import { ApplicationStatus, CandidateSource } from '@/common/constants/enums';

/**
 * Shape owned by the Applications module's `GET /applications/export` route. Defined here
 * (rather than in `applications`) because the Export module is the consumer of these filters
 * via `ExportService.generateApplicationsExcel()`.
 */
export class ApplicationExportFilterDto {
  @ApiPropertyOptional({ description: 'Job opening id to restrict the export to' })
  @IsOptional()
  @IsMongoId()
  opening?: string;

  @ApiPropertyOptional({ enum: ApplicationStatus })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ enum: CandidateSource })
  @IsOptional()
  @IsEnum(CandidateSource)
  source?: CandidateSource;

  @ApiPropertyOptional({ description: 'Case-insensitive match against the opening job department' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Case-insensitive match against candidate current OR preferred location',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Applications submitted on/after this date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateFrom?: Date;

  @ApiPropertyOptional({ description: 'Applications submitted on/before this date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateTo?: Date;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experienceMin?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experienceMax?: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Best-effort filter parsed from free-text expectedCtc' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  expectedCtcMin?: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Best-effort filter parsed from free-text expectedCtc' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  expectedCtcMax?: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Best-effort filter parsed from free-text currentCtc' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  currentCtcMin?: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Best-effort filter parsed from free-text currentCtc' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  currentCtcMax?: number;
}
