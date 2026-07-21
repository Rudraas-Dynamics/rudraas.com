import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateApplicationDto } from './create-application.dto';
import { CandidateSource } from '@/common/constants/enums';

/**
 * Used for HR-entered candidates (e.g. a walk-in or a candidate sourced via a consultancy).
 * `source` is required here (no WEBSITE default makes sense for manual entry) and
 * `sourceDetail` lets HR record who/what actually sourced the candidate.
 */
export class ManualCreateApplicationDto extends OmitType(CreateApplicationDto, ['source'] as const) {
  @ApiProperty({ enum: CandidateSource })
  @IsEnum(CandidateSource)
  source: CandidateSource;

  @ApiPropertyOptional({ description: 'e.g. recruiter or consultancy name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sourceDetail?: string;
}
