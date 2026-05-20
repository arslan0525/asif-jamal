"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your madarsa profile and system preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Madarsa Profile</CardTitle>
          <CardDescription>Update the main details of the institute.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Madarsa Name</Label>
            <Input id="name" defaultValue="Jamia Dar-ul-Uloom" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" defaultValue="123 Main Street, City" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Contact Phone</Label>
            <Input id="phone" defaultValue="0300-1234567" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}
