import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { EmploymentType } from '@/common/constants/enums';

/** Filters for the public career site job list — always restricted to published/open/non-archived jobs. */
export class PublicJobQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search across title/department/skills/location' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional({ description: 'Minimum years of experience the candidate has' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experienceMin?: number;

  @ApiPropertyOptional({ description: 'Maximum years of experience the candidate has' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experienceMax?: number;
}
