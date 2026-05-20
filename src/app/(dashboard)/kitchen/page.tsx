"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Utensils, AlertTriangle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const inventory = [
  { id: "INV-001", item: "Rice", remaining: "45 kg", usageToday: "5 kg", status: "Good" },
  { id: "INV-002", item: "Flour (Aata)", remaining: "8 kg", usageToday: "10 kg", status: "Low Stock" },
  { id: "INV-003", item: "Sugar", remaining: "20 kg", usageToday: "2 kg", status: "Good" },
  { id: "INV-004", item: "Cooking Oil", remaining: "3 Liters", usageToday: "1 Liter", status: "Low Stock" },
  { id: "INV-005", item: "Lentils (Daal)", remaining: "15 kg", usageToday: "2 kg", status: "Good" },
]

export default function KitchenPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kitchen Management</h2>
          <p className="text-muted-foreground">Manage grocery inventory and daily usage.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Usage History</Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Stock
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items Monitored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">2 Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Grocery Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs 28,000</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Current Inventory</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search items..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead className="hidden md:table-cell">Usage Today</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <Utensils className="h-4 w-4 text-muted-foreground hidden sm:block" />
                        {item.item}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{item.remaining}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.usageToday}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === "Low Stock" ? "destructive" : "secondary"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        Record Usage
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
