'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const USERS_KEY = 'slot4:local-auth-users'
const SESSION_KEY = 'slot4:local-auth-session'

type LocalUser = {
  name: string
  email: string
  password: string
  createdAt: string
}

const readUsers = (): LocalUser[] => {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(USERS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveUsers = (users: LocalUser[]) => {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

const saveSession = (user: Pick<LocalUser, 'name' | 'email'>) => {
  window.localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ name: user.name, email: user.email, loggedInAt: new Date().toISOString() })
  )
  window.dispatchEvent(new Event('slot4-auth-change'))
}

export function LocalLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    const user = readUsers().find((item) => item.email.toLowerCase() === normalizedEmail)

    if (!user || user.password !== password) {
      setStatus('error')
      setMessage('No local account found with these details. Create an account first, then login.')
      return
    }

    saveSession(user)
    setStatus('success')
    setMessage(`Logged in locally as ${user.name}. Redirecting...`)
    window.setTimeout(() => router.push('/'), 500)
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={submit}>
      <Input type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <Input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      {message ? (
        <p className={`rounded-2xl px-4 py-3 text-sm ${status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </p>
      ) : null}
      <Button type="submit" className="rounded-full bg-[#2f1d16] text-[#fff4e4] hover:bg-[#452920]">Continue</Button>
    </form>
  )
}

export function LocalSignupForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()
    if (password.length < 4) {
      setStatus('error')
      setMessage('Use at least 4 characters for local demo password.')
      return
    }

    const users = readUsers()
    const nextUser: LocalUser = {
      name: normalizedName || normalizedEmail.split('@')[0] || 'Local User',
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
    }
    const withoutExisting = users.filter((item) => item.email.toLowerCase() !== normalizedEmail)
    saveUsers([nextUser, ...withoutExisting])
    saveSession(nextUser)
    setStatus('success')
    setMessage('Local account created. Redirecting...')
    window.setTimeout(() => router.push('/'), 500)
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={submit}>
      <Input placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} className="border-white/15 bg-white/10 text-white placeholder:text-white/50" required />
      <Input type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} className="border-white/15 bg-white/10 text-white placeholder:text-white/50" required />
      <Input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} className="border-white/15 bg-white/10 text-white placeholder:text-white/50" required />
      {message ? (
        <p className={`rounded-2xl px-4 py-3 text-sm ${status === 'success' ? 'bg-emerald-400/15 text-emerald-100' : 'bg-red-400/15 text-red-100'}`}>
          {message}
        </p>
      ) : null}
      <Button type="submit" className="rounded-full bg-[#d7b56d] text-[#241711] hover:bg-[#e2c884]">Start now</Button>
    </form>
  )
}

export function useLocalAuthSession() {
  const [session, setSession] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const load = () => {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null')
        setSession(parsed && typeof parsed.email === 'string' ? parsed : null)
      } catch {
        setSession(null)
      }
    }
    load()
    window.addEventListener('slot4-auth-change', load)
    window.addEventListener('storage', load)
    return () => {
      window.removeEventListener('slot4-auth-change', load)
      window.removeEventListener('storage', load)
    }
  }, [])

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY)
    window.dispatchEvent(new Event('slot4-auth-change'))
    setSession(null)
  }

  return { session, logout }
}
