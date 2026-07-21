export type UserRole = 'ADMIN' | 'HR'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface LoginResponse {
  accessToken: string
  expiresIn: number
  user: User
}
