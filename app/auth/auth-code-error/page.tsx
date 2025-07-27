'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
        <CardDescription>
          There was an error processing your authentication request
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground text-center">
          This could happen if:
          <ul className="mt-2 space-y-1 text-left">
            <li>• The authentication link has expired</li>
            <li>• The link has already been used</li>
            <li>• There was a network connectivity issue</li>
          </ul>
        </div>

        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">
              Try Signing In Again
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/auth/signup">
              Create New Account
            </Link>
          </Button>
        </div>

        <div className="text-center">
          <Link 
            href="/" 
            className="text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            Go back to homepage
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
