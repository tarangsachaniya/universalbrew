"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth"

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        setServerError(body.error ?? "Something went wrong")
        return
      }
      setSubmitted(true)
    } catch {
      setServerError("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="w-full max-w-md px-8 py-10 bg-white rounded-2xl shadow-lg">
      <h1 className="font-serif text-3xl text-primary mb-2">Forgot Password</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
            If an account with that email exists, a password reset link has been sent.
            Check your inbox (and spam folder).
          </div>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline font-medium">
              Back to home
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Sending…" : "Send Reset Link"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}