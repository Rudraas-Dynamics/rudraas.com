import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthResult, AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser, CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CSRF_COOKIE_NAME, CsrfGuard } from '@/common/guards/csrf.guard';

const REFRESH_COOKIE_NAME = 'career_refresh_token';
const AUTH_COOKIE_PATH = '/api/v1/auth';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email + password and start a session' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(dto, this.meta(req));
    this.setAuthCookies(res, result);
    return this.toResponseDto(result);
  }

  @Public()
  @UseGuards(CsrfGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the refresh token and issue a new access token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    const result = await this.authService.refresh(rawRefreshToken, this.meta(req));
    this.setAuthCookies(res, result);
    return this.toResponseDto(result);
  }

  @UseGuards(CsrfGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End the current session and revoke its refresh token' })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    await this.authService.logout(
      rawRefreshToken,
      { userId: user.userId, email: user.email },
      this.meta(req),
    );
    this.clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }

  private meta(req: Request): { ip?: string; userAgent?: string } {
    return { ip: req.ip, userAgent: req.header('user-agent') };
  }

  private toResponseDto(result: AuthResult): AuthResponseDto {
    return { accessToken: result.accessToken, expiresIn: result.expiresIn, user: result.user };
  }

  private setAuthCookies(
    res: Response,
    result: { refreshToken: string; refreshExpiresAt: Date; csrfToken: string },
  ): void {
    const isProduction = this.configService.get<string>('env') === 'production';
    const maxAge = Math.max(result.refreshExpiresAt.getTime() - Date.now(), 0);
    const baseOptions = {
      secure: isProduction,
      sameSite: 'strict' as const,
      path: AUTH_COOKIE_PATH,
      maxAge,
    };

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, { ...baseOptions, httpOnly: true });
    res.cookie(CSRF_COOKIE_NAME, result.csrfToken, { ...baseOptions, httpOnly: false });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: AUTH_COOKIE_PATH });
    res.clearCookie(CSRF_COOKIE_NAME, { path: AUTH_COOKIE_PATH });
  }
}
