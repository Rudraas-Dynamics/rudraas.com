import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Marks a route as accessible without a JWT — used only for public career-site endpoints. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
