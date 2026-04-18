import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PhoneProvisionCard } from '@/components/onboarding/PhoneProvisionCard'
import { Button } from '@/components/ui/button'
import { Wrench } from 'lucide-react'

function OnboardingSteps({ current }: { current: number }) {
  const steps = ['Shop Info', 'Connect Google', 'Get Phone Number']
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
            i + 1 === current ? 'bg-blue-600 text-white' :
            i + 1 < current ? 'bg-green-500 text-white' :
            'bg-gray-200 text-gray-500'
          }`}>
            {i + 1}
          </div>
          <span className={`ml-2 text-sm ${i + 1 === current ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
            {step}
          </span>
          {i < steps.length - 1 && <div className="mx-4 h-px w-12 bg-gray-300" />}
        </div>
      ))}
    </div>
  )
}

export default async function ProvisionPhonePage({
  searchParams,
}: {
  searchParams: Promise<{ shopId?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const shopId = params.shopId

  if (!shopId) redirect('/create-shop')

  const { data: shop } = await supabase
    .from('shops')
    .select('id, phone_number, onboarding_status')
    .eq('id', shopId)
    .single()

  if (!shop) redirect('/create-shop')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <Wrench className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Your AI Phone Line</h1>
        </div>

        <OnboardingSteps current={3} />

        <PhoneProvisionCard
          shopId={shopId}
          alreadyProvisioned={shop.onboarding_status === 'phone_provisioned' || shop.onboarding_status === 'active'}
          existingPhoneNumber={shop.phone_number ?? undefined}
        />

        {(shop.onboarding_status === 'phone_provisioned' || shop.onboarding_status === 'active') && (
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to Dashboard →</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
