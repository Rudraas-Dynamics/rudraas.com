import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

export const CSRF_COOKIE_NAME = 'career_csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Double-submit-cookie CSRF check for the two endpoints that rely on the httpOnly
 * refresh-token cookie (/auth/refresh, /auth/logout) instead of a Bearer header.
 * The non-httpOnly `career_csrf` cookie is set on login; the admin SPA must echo its
 * value back in the X-CSRF-Token header for the browser's cookie-bound requests.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const cookieToken = request.cookies?.[CSRF_COOKIE_NAME];
    const headerToken = request.header(CSRF_HEADER_NAME);

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw new ForbiddenException('CSRF token missing or invalid');
    }
    return true;
  }
}
