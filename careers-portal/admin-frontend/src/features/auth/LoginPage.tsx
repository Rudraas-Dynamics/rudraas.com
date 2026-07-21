import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { useAuth } from '@/features/auth/auth-context'
import { getApiErrorMessage } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true)
    try {
      await login(values.email, values.password)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Invalid email or password'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-rudraas-bg px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-rudraas-muted">
            Rudraas Dynamics
          </p>
          <h1 className="mt-2 font-heading text-2xl font-semibold text-rudraas-fg">
            Careers Portal
          </h1>
        </div>

        <Card className="border-rudraas-border bg-rudraas-bg/60 text-rudraas-fg backdrop-blur">
          <CardHeader>
            <CardTitle className="text-rudraas-fg">Sign in</CardTitle>
            <CardDescription className="text-rudraas-body">
              Enter your admin or HR credentials to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-rudraas-fg">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="you@rudraas.com"
                          className="border-rudraas-border bg-transparent text-rudraas-fg placeholder:text-rudraas-muted"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-rudraas-fg">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          className="border-rudraas-border bg-transparent text-rudraas-fg placeholder:text-rudraas-muted"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-rudraas-fg text-rudraas-bg hover:bg-rudraas-fg/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center font-mono text-xs text-rudraas-muted">
          Internal use only &middot; Rudraas Dynamics HR/Admin
        </p>
      </div>
    </div>
  )
}
