"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Filter, MoreHorizontal, FileText, Phone, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock Data
const students = [
  { id: "STU-001", name: "Ahmed Raza", class: "Hifz Class 1", parentName: "Muhammad Ali", phone: "0300-1234567", status: "Active" },
  { id: "STU-002", name: "Bilal Khan", class: "Nazra", parentName: "Tariq Khan", phone: "0311-9876543", status: "Active" },
  { id: "STU-003", name: "Omar Farooq", class: "Aalim Course", parentName: "Usman Farooq", phone: "0322-4567890", status: "Inactive" },
  { id: "STU-004", name: "Zaid Abdullah", class: "Hifz Class 2", parentName: "Abdullah", phone: "0333-1122334", status: "Active" },
  { id: "STU-005", name: "Hassan Ali", class: "Nazra", parentName: "Ali Reza", phone: "0344-5566778", status: "Active" },
]

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">Manage all registered students across classes.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Enter the details of the new student to enroll them in the madarsa.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="E.g. Ahmed Raza" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parent">Parent/Guardian Name</Label>
                <Input id="parent" placeholder="Father's name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input id="phone" placeholder="0300-1234567" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Students</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search students..." 
                  className="pl-8" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden md:table-cell">Class</TableHead>
                  <TableHead className="hidden lg:table-cell">Parent</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 hidden sm:flex">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {student.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{student.name}</span>
                            <span className="text-xs text-muted-foreground md:hidden">{student.class}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{student.class}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-col">
                          <span>{student.parentName}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {student.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          student.status === "Active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                        }`}>
                          {student.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem><FileText className="mr-2 h-4 w-4" /> View Profile</DropdownMenuItem>
                            <DropdownMenuItem><Phone className="mr-2 h-4 w-4" /> Contact Parent</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Collect Fee</DropdownMenuItem>
                            <DropdownMenuItem>Mark Attendance</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
