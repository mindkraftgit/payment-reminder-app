import { useState } from 'react'
import {
  House,
  Lightning,
  DeviceMobile,
  ShieldCheck,
  Heartbeat,
  Sparkle,
  HandFist,
  GraduationCap,
  Car,
  Monitor,
  CreditCard,
  TShirt,
  ForkKnife,
  GameController,
  TrendUp,
  DotsThree,
  Question,
  type IconProps,
} from '@phosphor-icons/react'

interface CategoryIconProps {
  category: string
  size?: number
  iconUrl?: string
  iconDataUri?: string
}

const CATEGORY_MAP: Record<string, { icon: React.FC<IconProps>; bg: string }> = {
  'Fixed Expenses':           { icon: House,             bg: '#3B82F6' },
  'Utilities':                { icon: Lightning,         bg: '#F59E0B' },
  'Internet & Mobile':        { icon: DeviceMobile,      bg: '#8B5CF6' },
  'Insurance and Loans':      { icon: ShieldCheck,       bg: '#10B981' },
  'Health & Medical':         { icon: Heartbeat,         bg: '#EF4444' },
  'Health & Beauty':          { icon: Sparkle,           bg: '#EC4899' },
  'Gym Membership':           { icon: HandFist,          bg: '#F97316' },
  'Children & Education':     { icon: GraduationCap,     bg: '#6366F1' },
  'Transportation':           { icon: Car,               bg: '#14B8A6' },
  'Subscriptions':            { icon: Monitor,           bg: '#A855F7' },
  'Credit & Loans':           { icon: CreditCard,        bg: '#0EA5E9' },
  'Clothing':                 { icon: TShirt,            bg: '#D946EF' },
  'Food & Dining':            { icon: ForkKnife,         bg: '#22C55E' },
  'Entertainment':            { icon: GameController,    bg: '#E11D48' },
  'Savings & Investments':    { icon: TrendUp,           bg: '#059669' },
  'Other':                    { icon: DotsThree,         bg: '#6B7280' },
  'Uncategorized':            { icon: Question,          bg: '#9CA3AF' },
}

const DEFAULT_ENTRY = { icon: DotsThree, bg: '#6B7280' }

export default function CategoryIcon({ category, size = 64, iconUrl, iconDataUri }: CategoryIconProps) {
  const { icon: Icon, bg } = CATEGORY_MAP[category] || DEFAULT_ENTRY
  const iconSize = Math.round(size * 0.5)
  const [imgFailed, setImgFailed] = useState(false)

  const displayUrl = iconDataUri || iconUrl
  if (displayUrl && !imgFailed) {
    return (
      <div
        className="rounded-full flex items-center justify-center shrink-0 overflow-hidden"
        style={{ width: size, height: size, backgroundColor: bg }}
      >
        <img
          src={displayUrl}
          alt={category}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      </div>
    )
  }

  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size, backgroundColor: bg }}
    >
      <Icon size={iconSize} weight="duotone" color="white" />
    </div>
  )
}
