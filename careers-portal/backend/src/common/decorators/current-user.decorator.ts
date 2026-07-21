import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@/common/constants/enums';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;
    return data ? user?.[data] : user;
  },
);
