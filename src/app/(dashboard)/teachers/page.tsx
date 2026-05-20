"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, UserSquare2, Phone, MoreHorizontal } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const teachers = [
  { id: "TCH-001", name: "Qari Tariq", class: "Hifz Class 1", phone: "0300-1112223", salary: 25000, status: "Active" },
  { id: "TCH-002", name: "Maulana Usman", class: "Aalim Course", phone: "0311-4445556", salary: 35000, status: "Active" },
  { id: "TCH-003", name: "Hafiz Bilal", class: "Nazra", phone: "0322-7778889", salary: 20000, status: "On Leave" },
]

export default function TeachersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teachers</h2>
          <p className="text-muted-foreground">Manage teaching staff and their classes.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Teacher
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Teaching Staff</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search teachers..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead className="hidden md:table-cell">Assigned Class</TableHead>
                  <TableHead className="hidden lg:table-cell">Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 hidden sm:flex">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {teacher.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{teacher.name}</span>
                          <span className="text-xs text-muted-foreground md:hidden">{teacher.class}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{teacher.class}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" /> {teacher.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        teacher.status === "Active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                      }`}>
                        {teacher.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
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
