import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayNotEmpty, IsMongoId } from 'class-validator';

export class BulkDownloadDto {
  @ApiProperty({ type: [String], maxItems: 100 })
  @IsMongoId({ each: true })
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  ids: string[];
}
