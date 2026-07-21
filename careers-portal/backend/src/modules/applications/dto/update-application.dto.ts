import { PartialType, PickType } from '@nestjs/swagger';
import { CreateApplicationDto } from './create-application.dto';

/**
 * Editable candidate fields only. `email`, `openingId`, resume fields, `status`, and `source`
 * are intentionally excluded — those change via dedicated endpoints (or never, for email/opening).
 */
export class UpdateApplicationDto extends PartialType(
  PickType(CreateApplicationDto, [
    'name',
    'mobile',
    'linkedin',
    'portfolio',
    'currentCompany',
    'designation',
    'experienceYears',
    'qualification',
    'currentCtc',
    'expectedCtc',
    'noticePeriod',
    'currentLocation',
    'preferredLocation',
  ] as const),
) {}
