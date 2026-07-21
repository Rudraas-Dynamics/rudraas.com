import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '@/common/decorators/current-user.decorator';
import { Role } from '@/common/constants/enums';

@ApiTags('dashboard')
@ApiBearerAuth('access-token')
@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin overview dashboard: openings/applications cards and charts' })
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('hr')
  @Roles(Role.HR)
  @ApiOperation({
    summary: 'HR overview dashboard: assigned openings, pipeline and screening status',
  })
  getHrDashboard(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.dashboardService.getHrDashboard(currentUser);
  }
}
