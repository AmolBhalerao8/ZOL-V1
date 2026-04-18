import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Phone, Mail, DollarSign, Clock, Wifi, WifiOff } from 'lucide-react'
import type { PricingConfig, BusinessHours } from '@/lib/supabase/types'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_user_id', user.id)
    .maybeSingle()
  if (!shop) redirect('/create-shop')

  const pricing = (shop.pricing_config as PricingConfig) ?? {}
  const hours = (shop.business_hours as BusinessHours) ?? {}

  const isGoogleConnected = !!shop.google_email
  const isPhoneProvisioned = !!shop.vapi_phone_number_id

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shop Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shop Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Shop Name</p>
              <p className="text-sm font-medium">{shop.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <Badge variant="success" className="mt-1">{shop.onboarding_status}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Phone Number */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Number
              </CardTitle>
              {isPhoneProvisioned ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="secondary">Not provisioned</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {shop.phone_number ? (
              <p className="text-xl font-mono text-blue-600">{shop.phone_number}</p>
            ) : (
              <p className="text-sm text-gray-400">Complete onboarding to provision a number</p>
            )}
            <p className="mt-2 text-xs text-gray-400">Vapi ID: {shop.vapi_phone_number_id ?? '—'}</p>
          </CardContent>
        </Card>

        {/* Google Connection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" /> Google Account
              </CardTitle>
              {isGoogleConnected ? (
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <Wifi className="h-3 w-3" /> Connected
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <WifiOff className="h-3 w-3" /> Not connected
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {shop.google_email ? (
              <p className="text-sm text-gray-700">{shop.google_email}</p>
            ) : (
              <p className="text-sm text-gray-400">Connect Google to send quotes via Gmail</p>
            )}
          </CardContent>
        </Card>

        {/* Pricing Config */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Pricing Config
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Labor Rate</p>
              <p className="text-sm font-medium">${pricing.labor_rate ?? 120}/hr</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Parts Markup</p>
              <p className="text-sm font-medium">{((pricing.parts_markup ?? 0.3) * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Tax Rate</p>
              <p className="text-sm font-medium">{((pricing.tax_rate ?? 0.0875) * 100).toFixed(2)}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Business Hours
            </CardTitle>
            <CardDescription>Outside these hours, all calls go to the AI receptionist</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((day) => {
                const dayHours = hours[day]
                return (
                  <div key={day} className="space-y-1">
                    <p className="font-medium text-gray-700 capitalize">{day}</p>
                    {dayHours ? (
                      <>
                        <p className="text-xs text-gray-500">{dayHours.open}</p>
                        <p className="text-xs text-gray-500">{dayHours.close}</p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400">Closed</p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Future Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Twilio SMS</CardTitle>
            <CardDescription>Coming soon — send quotes via SMS</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">TechMetrix Integration</CardTitle>
            <CardDescription>Coming soon — sync with your shop management system</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
