"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, TrendingUp, Users, Wallet } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">Generate and download comprehensive madarsa reports.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /> Financial Report</CardTitle>
            <CardDescription>Monthly income, expenses, and pending fees.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Attendance Report</CardTitle>
            <CardDescription>Student and teacher attendance summaries.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="secondary"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Donations Report</CardTitle>
            <CardDescription>Detailed breakdown of zakat and sadaqah.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline"><Download className="mr-2 h-4 w-4" /> Download Excel</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
