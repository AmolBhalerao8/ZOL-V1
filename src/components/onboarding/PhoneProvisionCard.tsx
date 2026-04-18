'use client'

import { useState } from 'react'
import { Phone, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { provisionVapiAction } from '@/features/onboarding/provision-vapi'

interface PhoneProvisionCardProps {
  shopId: string
  alreadyProvisioned?: boolean
  existingPhoneNumber?: string
}

export function PhoneProvisionCard({ shopId, alreadyProvisioned, existingPhoneNumber }: PhoneProvisionCardProps) {
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState(existingPhoneNumber ?? null)
  const [error, setError] = useState<string | null>(null)

  async function handleProvision() {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('shopId', shopId)

    const result = await provisionVapiAction(formData)

    if ('error' in result && result.error) {
      setError(result.error as string)
    } else if ('phoneNumber' in result && result.phoneNumber) {
      setPhoneNumber(result.phoneNumber as string)
    }

    setLoading(false)
  }

  if (phoneNumber || alreadyProvisioned) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-4 p-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Phone number provisioned</p>
            <p className="text-xl font-mono text-green-700 mt-1">{phoneNumber ?? existingPhoneNumber}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-50 p-3">
            <Phone className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Provision Your AI Phone Line</CardTitle>
            <CardDescription>
              We&apos;ll purchase a US phone number and configure your AI receptionist. Calls to this number will be answered 24/7.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <Button onClick={handleProvision} disabled={loading} size="lg" className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Provisioning…
            </>
          ) : (
            <>
              <Phone className="h-4 w-4" />
              Get My AI Phone Number
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
