"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, Check } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocalStorage, initialStudents, Student } from "@/lib/store"

interface AttendanceRecord {
  [studentId: string]: "Present" | "Absent" | "Leave"
}

interface DailyAttendanceLogs {
  [dateKey: string]: AttendanceRecord
}

export default function AttendancePage() {
  const [studentsList] = useLocalStorage<Student[]>("madarsa_students", initialStudents)
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState("all")
  
  // Attendance records mapped by date -> { studentId: status }
  const [attendanceLogs, setAttendanceLogs] = useLocalStorage<DailyAttendanceLogs>("madarsa_attendance_logs", {
    // Initial mock attendance for today
    [new Date().toISOString().split('T')[0]]: {
      "STU-001": "Present",
      "STU-002": "Absent",
      "STU-003": "Present",
      "STU-004": "Leave",
      "STU-005": "Present",
    }
  })

  const [currentAttendance, setCurrentAttendance] = useState<AttendanceRecord>({})
  const [isSavedOpen, setIsSavedOpen] = useState(false)

  // Load attendance for selected date
  useEffect(() => {
    if (attendanceLogs && attendanceLogs[date]) {
      setCurrentAttendance(attendanceLogs[date])
    } else {
      // Default to "Present" for all active students if no log exists
      const defaultRecord: AttendanceRecord = {}
      if (studentsList) {
        studentsList.forEach(s => {
          if (s.status === "Active") {
            defaultRecord[s.id] = "Present"
          }
        })
      }
      setCurrentAttendance(defaultRecord)
    }
  }, [date, studentsList, attendanceLogs])

  const toggleStatus = (studentId: string, status: "Present" | "Absent" | "Leave") => {
    setCurrentAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleSaveAttendance = () => {
    setAttendanceLogs(prev => ({
      ...prev,
      [date]: currentAttendance
    }))
    setIsSavedOpen(true)
    
    // Add to activity logs
    try {
      const acts = JSON.parse(window.localStorage.getItem("madarsa_activities") || "[]")
      const newAct = {
        id: Date.now(),
        title: "Attendance Saved",
        description: `Attendance register saved for ${new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        time: "Just now"
      }
      window.localStorage.setItem("madarsa_activities", JSON.stringify([newAct, ...acts].slice(0, 10)))
    } catch(e) {}
  }

  // Filter students based on selected class
  const filteredStudents = (studentsList || []).filter(s => {
    if (s.status !== "Active") return false
    if (selectedClass === "all") return true
    if (selectedClass === "hifz1" && s.class === "Hifz Class 1") return true
    if (selectedClass === "hifz2" && s.class === "Hifz Class 2") return true
    if (selectedClass === "nazra" && s.class === "Nazra") return true
    if (selectedClass === "aalim" && s.class === "Aalim Course") return true
    return false
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground">Mark and review daily attendance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><CalendarIcon className="mr-2 h-4 w-4" /> View Monthly</Button>
          <Button onClick={handleSaveAttendance}>Save Attendance</Button>
        </div>
      </div>

      {/* Save Success Dialog */}
      <Dialog open={isSavedOpen} onOpenChange={setIsSavedOpen}>
        <DialogContent className="sm:max-w-[350px] text-center p-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 mb-4">
            <Check className="h-6 w-6" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center font-bold">Register Saved</DialogTitle>
            <DialogDescription className="text-center mt-2">
              Daily attendance register has been saved successfully for {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 sm:justify-center">
            <Button onClick={() => setIsSavedOpen(false)} className="w-full sm:w-auto">OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  className="bg-transparent border-none outline-none text-sm w-[130px] text-foreground"
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
                  <SelectItem value="aalim">Aalim Course</SelectItem>
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
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const status = currentAttendance[student.id] || "Present"
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.id}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{student.class}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant={status === "Present" ? "default" : "outline"} 
                              size="sm" 
                              onClick={() => toggleStatus(student.id, "Present")}
                              className={status === "Present" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                            >
                              <CheckCircle2 className="h-4 w-4 md:mr-1" />
                              <span className="hidden md:inline">Present</span>
                            </Button>
                            <Button 
                              variant={status === "Absent" ? "destructive" : "outline"} 
                              size="sm"
                              onClick={() => toggleStatus(student.id, "Absent")}
                              className={status === "Absent" ? "bg-destructive text-destructive-foreground hover:bg-destructive" : ""}
                            >
                              <XCircle className="h-4 w-4 md:mr-1" />
                              <span className="hidden md:inline">Absent</span>
                            </Button>
                            <Button 
                              variant={status === "Leave" ? "secondary" : "outline"} 
                              size="sm"
                              onClick={() => toggleStatus(student.id, "Leave")}
                              className={status === "Leave" ? "bg-secondary text-secondary-foreground" : ""}
                            >
                              <Clock className="h-4 w-4 md:mr-1" />
                              <span className="hidden md:inline">Leave</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No active students in selected class.
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
