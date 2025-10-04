import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (
    data: unknown,
    ctx: ExecutionContext,
  ): {
    sub: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
  } => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as {
      sub: string;
      username: string;
      email: string;
      roles: string[];
      permissions: string[];
    };
  },
);
