"use client"

import { useState, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from "zod"

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormInput = z.infer<typeof formSchema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  if (!token) {
    return (
      <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
        Invalid reset link. Please{" "}
        <Link href="/forgot-password" className="underline font-medium">
          request a new one
        </Link>
        .
      </div>
    )
  }

  const onSubmit = async (data: FormInput) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      })
      const body = await res.json()
      if (!res.ok) {
        setServerError(body.error ?? "Something went wrong")
        return
      }
      setSuccess(true)
      setTimeout(() => router.push("/"), 3000)
    } catch {
      setServerError("Something went wrong. Please try again.")
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
          Password updated successfully! Redirecting you to sign in…
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Min. 8 characters"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          {...form.register("confirmPassword")}
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
          {serverError}{" "}
          {serverError.toLowerCase().includes("expired") && (
            <Link href="/forgot-password" className="underline font-medium">
              Request a new link
            </Link>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Updating…" : "Update Password"}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md px-8 py-10 bg-white rounded-2xl shadow-lg">
      <h1 className="font-serif text-3xl text-primary mb-2">Reset Password</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Choose a strong new password for your account.
      </p>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}