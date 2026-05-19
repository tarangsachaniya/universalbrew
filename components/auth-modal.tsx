"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from "@/lib/validations/auth"

type AuthMode = "login" | "signup"

type AuthModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("login")
  const [serverError, setServerError] = useState<string | null>(null)

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const signupForm = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", name: "" },
  })

  const handleLogin = async (data: LoginInput) => {
    setServerError(null)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (result?.error) {
        setServerError("Invalid email or password")
        return
      }
      onOpenChange(false)
      router.refresh()
    } catch {
      setServerError("Something went wrong. Please try again.")
    }
  }

  const handleSignup = async (data: SignupInput) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        setServerError(body.error ?? "Signup failed")
        return
      }
      // Auto-login after signup
      await signIn("credentials", { email: data.email, password: data.password, redirect: false })
      onOpenChange(false)
      router.refresh()
    } catch {
      setServerError("Something went wrong. Please try again.")
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setServerError(null)
    loginForm.reset()
    signupForm.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

        {mode === "login" ? (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                {...loginForm.register("email")}
              />
              {loginForm.formState.errors.email && (
                <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                {...loginForm.register("password")}
              />
              {loginForm.formState.errors.password && (
                <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loginForm.formState.isSubmitting}
            >
              {loginForm.formState.isSubmitting ? "Signing in…" : "Sign In"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button type="button" onClick={() => switchMode("signup")} className="text-primary hover:underline font-medium">
                Sign up
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Name</Label>
              <Input
                id="signup-name"
                placeholder="Your name"
                {...signupForm.register("name")}
              />
              {signupForm.formState.errors.name && (
                <p className="text-sm text-destructive">{signupForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                {...signupForm.register("email")}
              />
              {signupForm.formState.errors.email && (
                <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Min. 8 characters"
                {...signupForm.register("password")}
              />
              {signupForm.formState.errors.password && (
                <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
              )}
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={signupForm.formState.isSubmitting}
            >
              {signupForm.formState.isSubmitting ? "Creating account…" : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button type="button" onClick={() => switchMode("login")} className="text-primary hover:underline font-medium">
                Sign in
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
