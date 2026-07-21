import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/constants/enums';

@ApiTags('search')
@ApiBearerAuth('access-token')
@Controller({ path: 'search', version: '1' })
@Roles(Role.ADMIN, Role.HR)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Global backoffice search across jobs, candidates, HR users and departments',
  })
  @ApiQuery({ name: 'q', required: false, description: 'Search term (minimum 2 characters)' })
  globalSearch(@Query('q') q?: string) {
    return this.searchService.globalSearch(q ?? '');
  }
}
