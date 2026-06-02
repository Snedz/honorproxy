import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-sm mx-auto px-6 py-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-tighter text-[#1c252f]">Sign in</h1>
            <p className="text-[#5c656f] mt-2 text-sm">Welcome back to HonorProxy.</p>
          </div>
          <div className="h-64 flex items-center justify-center text-[#5c656f] text-sm">Loading…</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
