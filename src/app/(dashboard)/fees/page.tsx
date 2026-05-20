"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, ReceiptText, Phone } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const feeRecords = [
  { id: "FEE-101", student: "Ahmed Raza", amount: 2000, month: "Sep 2023", status: "Paid", date: "05 Sep 2023" },
  { id: "FEE-102", student: "Bilal Khan", amount: 2000, month: "Sep 2023", status: "Pending", date: "-" },
  { id: "FEE-103", student: "Omar Farooq", amount: 1500, month: "Sep 2023", status: "Paid", date: "01 Sep 2023" },
  { id: "FEE-104", student: "Zaid Abdullah", amount: 2000, month: "Sep 2023", status: "Pending", date: "-" },
]

export default function FeesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fees Management</h2>
          <p className="text-muted-foreground">Collect fees and track payment history.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Collect Fee
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collected This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs 45,000</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">Rs 12,000</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Recent Fee Records</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search records..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Month</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium text-xs">{record.id}</TableCell>
                    <TableCell>{record.student}</TableCell>
                    <TableCell>Rs {record.amount}</TableCell>
                    <TableCell className="hidden md:table-cell">{record.month}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        record.status === "Paid" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                      }`}>
                        {record.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {record.status === "Paid" ? (
                          <Button variant="outline" size="sm">
                            <ReceiptText className="h-4 w-4 md:mr-1" />
                            <span className="hidden md:inline">Receipt</span>
                          </Button>
                        ) : (
                          <Button size="sm" variant="secondary">
                            <Phone className="h-4 w-4 md:mr-1" />
                            <span className="hidden md:inline">Remind</span>
                          </Button>
                        )}
                      </div>
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
