import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CandidateSource } from '@/common/constants/enums';

/** Public application form. Arrives as multipart/form-data, hence the explicit `@Type()` coercions. */
export class CreateApplicationDto {
  @ApiProperty({ description: 'Job opening id being applied to' })
  @IsMongoId()
  openingId: string;

  @ApiProperty({ minLength: 2, maxLength: 120 })
  @IsString()
  @Length(2, 120)
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[0-9+\-\s()]{7,20}$/, { message: 'mobile must be a valid phone number' })
  mobile: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  portfolio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentCompany?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiProperty({ minimum: 0, maximum: 60 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(60)
  experienceYears: number;

  @ApiProperty()
  @IsString()
  qualification: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentCtc?: string;

  @ApiProperty()
  @IsString()
  expectedCtc: string;

  @ApiProperty()
  @IsString()
  noticePeriod: string;

  @ApiProperty()
  @IsString()
  currentLocation: string;

  @ApiProperty()
  @IsString()
  preferredLocation: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  introduction?: string;

  @ApiPropertyOptional({ enum: CandidateSource, description: 'Defaults to WEBSITE when omitted' })
  @IsOptional()
  @IsEnum(CandidateSource)
  source?: CandidateSource;

  @ApiProperty()
  @Type(() => Boolean)
  @IsBoolean()
  consentGiven: boolean;
}
