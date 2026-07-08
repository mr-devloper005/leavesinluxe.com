import type { LucideIcon } from 'lucide-react'
import {
  Banknote,
  BookOpen,
  Briefcase,
  Building2,
  Camera,
  Car,
  Cpu,
  Dog,
  Dumbbell,
  Film,
  Gamepad2,
  Globe2,
  GraduationCap,
  Hammer,
  Heart,
  Home,
  Landmark,
  Layers,
  Leaf,
  Megaphone,
  Newspaper,
  Palette,
  Plane,
  Scale,
  Shirt,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Truck,
  Users,
  Utensils,
  Wrench,
  Zap,
} from 'lucide-react'
import { normalizeCategory } from '@/lib/categories'
import { cn } from '@/lib/utils'

const MAP: Record<string, { Icon: LucideIcon; className: string }> = {
  business: { Icon: Briefcase, className: 'bg-slate-100 text-slate-700' },
  health: { Icon: Stethoscope, className: 'bg-emerald-100 text-emerald-700' },
  technology: { Icon: Cpu, className: 'bg-violet-100 text-violet-700' },
  'real-estate': { Icon: Building2, className: 'bg-sky-100 text-sky-700' },
  'home-improvement': { Icon: Hammer, className: 'bg-amber-100 text-amber-800' },
  automotive: { Icon: Car, className: 'bg-slate-200 text-slate-800' },
  travel: { Icon: Plane, className: 'bg-cyan-100 text-cyan-700' },
  blog: { Icon: BookOpen, className: 'bg-orange-100 text-orange-700' },
  shopping: { Icon: ShoppingBag, className: 'bg-pink-100 text-pink-700' },
  service: { Icon: Wrench, className: 'bg-neutral-200 text-neutral-800' },
  lifestyle: { Icon: Sparkles, className: 'bg-fuchsia-100 text-fuchsia-700' },
  beauty: { Icon: Heart, className: 'bg-rose-100 text-rose-600' },
  'pet-animal': { Icon: Dog, className: 'bg-lime-100 text-lime-800' },
  food: { Icon: Utensils, className: 'bg-red-100 text-red-700' },
  furniture: { Icon: Home, className: 'bg-amber-50 text-amber-900' },
  electric: { Icon: Zap, className: 'bg-yellow-100 text-yellow-800' },
  'jobs-payroll': { Icon: Users, className: 'bg-indigo-100 text-indigo-700' },
  finance: { Icon: Banknote, className: 'bg-green-100 text-green-800' },
  crypto: { Icon: Layers, className: 'bg-purple-100 text-purple-800' },
  casino: { Icon: Gamepad2, className: 'bg-red-50 text-red-800' },
  cbd: { Icon: Leaf, className: 'bg-green-50 text-green-800' },
  'social-media': { Icon: Megaphone, className: 'bg-blue-100 text-blue-700' },
  'game-sports': { Icon: Dumbbell, className: 'bg-orange-50 text-orange-800' },
  arts: { Icon: Palette, className: 'bg-purple-50 text-purple-800' },
  entertainment: { Icon: Film, className: 'bg-pink-50 text-pink-900' },
  'shipping-transportation': { Icon: Truck, className: 'bg-slate-100 text-slate-800' },
  education: { Icon: GraduationCap, className: 'bg-blue-50 text-blue-900' },
  'family-parenting': { Icon: Users, className: 'bg-teal-100 text-teal-800' },
  'law-legal': { Icon: Scale, className: 'bg-stone-200 text-stone-900' },
  fashion: { Icon: Shirt, className: 'bg-rose-50 text-rose-900' },
  photography: { Icon: Camera, className: 'bg-zinc-200 text-zinc-800' },
  adult: { Icon: Heart, className: 'bg-neutral-100 text-neutral-600' },
  event: { Icon: Sparkles, className: 'bg-violet-50 text-violet-900' },
  digital: { Icon: Globe2, className: 'bg-cyan-50 text-cyan-900' },
  news: { Icon: Newspaper, className: 'bg-neutral-100 text-neutral-800' },
  'industry-manufacturing': { Icon: Landmark, className: 'bg-slate-200 text-slate-900' },
}

export function getCategoryVisual(slug: string) {
  const key = normalizeCategory(slug)
  return MAP[key] ?? { Icon: Layers, className: 'bg-neutral-100 text-neutral-600' }
}

export function CategoryIconBadge({ slug, size = 'md' }: { slug: string; size?: 'sm' | 'md' }) {
  const { Icon, className } = getCategoryVisual(slug)
  const box = size === 'sm' ? 'h-10 w-10' : 'h-14 w-14'
  const iconSize = size === 'sm' ? 'h-5 w-5' : 'h-7 w-7'
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-full', box, className)}
      aria-hidden
    >
      <Icon className={iconSize} strokeWidth={2} />
    </span>
  )
}
