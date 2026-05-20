"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, HeartHandshake, Download } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const donations = [
  { id: "DON-201", donor: "Haji Abdul Rehman", amount: 50000, type: "Zakat", date: "15 Sep 2023" },
  { id: "DON-202", donor: "Anonymous", amount: 5000, type: "Sadaqah", date: "12 Sep 2023" },
  { id: "DON-203", donor: "Muhammad Usman", amount: 10000, type: "Kitchen Only", date: "10 Sep 2023" },
  { id: "DON-204", donor: "Tariq Jamil", amount: 25000, type: "General", date: "05 Sep 2023" },
]

export default function DonationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Donations</h2>
          <p className="text-muted-foreground">Manage Zakat, Sadaqah, and General Donations.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Donation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Zakat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Rs 50,000</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sadaqah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">Rs 5,000</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kitchen Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">Rs 10,000</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">General Fund</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs 25,000</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Donation Records</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search donors..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Donor Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell className="font-medium text-xs">{donation.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <HeartHandshake className="h-4 w-4 text-muted-foreground hidden sm:block" />
                        {donation.donor}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">Rs {donation.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        donation.type === "Zakat" ? "border-primary text-primary" :
                        donation.type === "Sadaqah" ? "border-secondary text-secondary" :
                        donation.type === "Kitchen Only" ? "border-orange-500 text-orange-500" : ""
                      }>
                        {donation.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{donation.date}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
