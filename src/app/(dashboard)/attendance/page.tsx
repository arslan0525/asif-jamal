"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock Data
const students = [
  { id: "STU-001", name: "Ahmed Raza", class: "Hifz Class 1", status: "Present" },
  { id: "STU-002", name: "Bilal Khan", class: "Hifz Class 1", status: "Absent" },
  { id: "STU-003", name: "Omar Farooq", class: "Nazra", status: "Present" },
  { id: "STU-004", name: "Zaid Abdullah", class: "Hifz Class 2", status: "Leave" },
  { id: "STU-005", name: "Hassan Ali", class: "Nazra", status: "Present" },
]

export default function AttendancePage() {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState("all")
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground">Mark and review daily attendance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><CalendarIcon className="mr-2 h-4 w-4" /> View Monthly</Button>
          <Button>Save Attendance</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Daily Register</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-background">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-[130px]"
                />
              </div>
              <Select value={selectedClass} onValueChange={(val) => setSelectedClass(val || "all")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="hifz1">Hifz Class 1</SelectItem>
                  <SelectItem value="hifz2">Hifz Class 2</SelectItem>
                  <SelectItem value="nazra">Nazra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="hidden md:table-cell">Class</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{student.class}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant={student.status === "Present" ? "default" : "outline"} 
                          size="sm" 
                          className={student.status === "Present" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                        >
                          <CheckCircle2 className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline">Present</span>
                        </Button>
                        <Button 
                          variant={student.status === "Absent" ? "destructive" : "outline"} 
                          size="sm"
                        >
                          <XCircle className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline">Absent</span>
                        </Button>
                        <Button 
                          variant={student.status === "Leave" ? "secondary" : "outline"} 
                          size="sm"
                        >
                          <Clock className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline">Leave</span>
                        </Button>
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
