import { useState } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type LoginFormValues = {
  email: string
  password: string
}

const inputHeightClass = 'h-10 rounded-lg'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
  })

  function onSubmit(values: LoginFormValues) {
    console.log(values)
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-200 p-4 dark:bg-neutral-900">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <img
            src="/motor-sights-international-logo.png"
            alt="Motor Sights International"
            className="mx-auto h-14 w-auto"
          />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Sign in to your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-t-4 border-t-primary shadow-2xl shadow-black/10">
            <CardHeader className="px-8 mt-4">
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your email and password below
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <FieldGroup>
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    className={inputHeightClass}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                  <FieldError errors={[errors.email]} />
                </Field>

                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      aria-invalid={!!errors.password}
                      className={`${inputHeightClass} pr-10`}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <FieldError errors={[errors.password]} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full gap-1.5 rounded-xl shadow-lg"
          >
            Sign in
            <LogIn />
          </Button>
        </form>
      </div>
    </div>
  )
}
