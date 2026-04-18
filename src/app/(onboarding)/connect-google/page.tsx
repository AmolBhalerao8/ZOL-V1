import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { connectGoogleAction } from '@/features/onboarding/connect-google'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Wrench, Mail, CheckCircle, AlertCircle } from 'lucide-react'

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

async function handleConnect(formData: FormData) {
  'use server'
  await connectGoogleAction(null, formData)
}

export default async function ConnectGooglePage({
  searchParams,
}: {
  searchParams: Promise<{ shopId?: string; error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const shopId = params.shopId

  if (!shopId) redirect('/create-shop')

  const isGoogleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <Wrench className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Connect Google</h1>
        </div>

        <OnboardingSteps current={2} />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>Gmail + Google Calendar</CardTitle>
                <CardDescription>
                  Connect your Google account so ZOL can send quotes via Gmail and book follow-ups.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {params.error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {params.error}
              </div>
            )}

            {!isGoogleConfigured && (
              <div className="flex items-start gap-2 rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Google OAuth not configured yet</p>
                  <p className="mt-1">Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env.local to enable this step.</p>
                </div>
              </div>
            )}

            <ul className="space-y-2">
              {['Send quotes via your shop Gmail', 'Book follow-ups in Google Calendar', 'Each shop uses its own Google account'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <form action={handleConnect} className="space-y-3">
              <input type="hidden" name="shopId" value={shopId} />
              <Button type="submit" disabled={!isGoogleConfigured} className="w-full">
                <Mail className="h-4 w-4" />
                Connect Google Account
              </Button>
            </form>

            <a href={`/provision-phone?shopId=${shopId}`}>
              <Button variant="ghost" className="w-full text-gray-500">
                Skip for now →
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
