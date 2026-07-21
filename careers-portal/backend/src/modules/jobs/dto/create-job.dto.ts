import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { EmploymentType } from '@/common/constants/enums';
import { ExperienceRangeDto } from './experience-range.dto';
import { JobAttachmentDto } from './job-attachment.dto';

export class CreateJobDto {
  @ApiProperty({ example: 'Senior Backend Engineer', minLength: 3, maxLength: 150 })
  @IsString()
  @Length(3, 150)
  title: string;

  @ApiProperty({ example: 'Engineering' })
  @IsString()
  department: string;

  @ApiProperty({ example: 'Bengaluru, India' })
  @IsString()
  location: string;

  @ApiProperty({ enum: EmploymentType })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @ApiProperty({ type: ExperienceRangeDto })
  @ValidateNested()
  @Type(() => ExperienceRangeDto)
  experience: ExperienceRangeDto;

  @ApiProperty({ type: [String], maxItems: 30 })
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({ description: 'Sanitized rich-text HTML' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Sanitized rich-text HTML' })
  @IsString()
  @IsNotEmpty()
  responsibilities: string;

  @ApiProperty({ description: 'Sanitized rich-text HTML' })
  @IsString()
  @IsNotEmpty()
  requirements: string;

  @ApiPropertyOptional({ example: '₹18-25 LPA', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  budget?: string;

  @ApiPropertyOptional({ type: JobAttachmentDto, description: 'Set from the Upload module response' })
  @IsOptional()
  @ValidateNested()
  @Type(() => JobAttachmentDto)
  jdAttachment?: JobAttachmentDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  openingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  closingDate?: string;
}
