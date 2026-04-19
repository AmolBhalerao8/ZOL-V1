import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Wrench, Building2, Phone, DollarSign } from 'lucide-react'
import { createShopAction } from '@/features/onboarding/create-shop'

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

async function handleCreate(formData: FormData) {
  'use server'
  await createShopAction(null, formData)
}

export default async function CreateShopPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <Wrench className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Set Up Your Shop</h1>
        </div>

        <OnboardingSteps current={1} />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>Shop Information</CardTitle>
                <CardDescription>Tell us about your mechanic shop</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form action={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Shop Name *</Label>
                <Input id="name" name="name" placeholder="e.g. Dave's Auto Repair" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="humanRedirectNumber">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Human Redirect Number
                  </div>
                </Label>
                <Input
                  id="humanRedirectNumber"
                  name="humanRedirectNumber"
                  type="tel"
                  placeholder="+14155551234 (for business hours)"
                />
                <p className="text-xs text-gray-500">
                  E.164 with country code (e.g. +14155551234). Used as Vapi fallback when buying a number; if
                  blank, set <span className="font-mono">VAPI_FALLBACK_E164</span> in server env.
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-700">Pricing Config</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="laborRate">Labor ($/hr)</Label>
                    <Input id="laborRate" name="laborRate" type="number" defaultValue="120" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partsMarkup">Parts Markup</Label>
                    <Input id="partsMarkup" name="partsMarkup" type="number" defaultValue="0.3" step="0.05" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate</Label>
                    <Input id="taxRate" name="taxRate" type="number" defaultValue="0.0875" step="0.001" />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Continue to Google →
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
