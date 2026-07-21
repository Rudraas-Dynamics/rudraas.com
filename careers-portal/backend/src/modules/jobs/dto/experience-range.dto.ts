import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class ExperienceRangeDto {
  @ApiProperty({ example: 2, minimum: 0 })
  @IsNumber()
  @Min(0)
  minYears: number;

  @ApiProperty({ example: 5, minimum: 0 })
  @IsNumber()
  @Min(0)
  maxYears: number;
}
