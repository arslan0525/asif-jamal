"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Receipt } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const expenses = [
  { id: "EXP-301", category: "Electricity", amount: 15000, date: "18 Sep 2023", recordedBy: "Admin" },
  { id: "EXP-302", category: "Kitchen", amount: 8500, date: "16 Sep 2023", recordedBy: "Qari Sahab" },
  { id: "EXP-303", category: "Internet", amount: 2000, date: "15 Sep 2023", recordedBy: "Admin" },
  { id: "EXP-304", category: "Repairs", amount: 4500, date: "10 Sep 2023", recordedBy: "Admin" },
]

export default function ExpensesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">Track and manage all madarsa expenditures.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">Rs 45,000</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Expense Records</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search expenses..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Recorded By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium text-xs">{expense.id}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="font-semibold">Rs {expense.amount.toLocaleString()}</TableCell>
                    <TableCell className="hidden md:table-cell">{expense.date}</TableCell>
                    <TableCell className="hidden lg:table-cell">{expense.recordedBy}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        <Receipt className="h-4 w-4 md:mr-1" />
                        <span className="hidden md:inline">Bill</span>
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
