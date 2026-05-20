"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Filter, MoreHorizontal, FileText, Phone, UserPlus, Pencil, Trash } from "lucide-react"
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
import { useLocalStorage, initialStudents, Student } from "@/lib/store"

export default function StudentsPage() {
  const [studentsList, setStudentsList] = useLocalStorage<Student[]>("madarsa_students", initialStudents)
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  
  const [newStudent, setNewStudent] = useState({
    name: "",
    class: "Hifz Class 1",
    parentName: "",
    phone: "",
  })

  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null)

  const filteredStudents = (studentsList || []).filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudent.name || !newStudent.parentName || !newStudent.phone) return

    // Find next ID
    const maxNum = (studentsList || []).reduce((max, s) => {
      const num = parseInt(s.id.replace("STU-", ""), 10)
      return isNaN(num) ? max : Math.max(max, num)
    }, 5)

    const nextIdStr = String(maxNum + 1).padStart(3, '0')
    const newId = `STU-${nextIdStr}`

    const newStudentObj: Student = {
      id: newId,
      name: newStudent.name,
      class: newStudent.class,
      parentName: newStudent.parentName,
      phone: newStudent.phone,
      status: "Active" as const,
    }

    setStudentsList([newStudentObj, ...studentsList])
    
    // Add to activity list if on dashboard
    try {
      const acts = JSON.parse(window.localStorage.getItem("madarsa_activities") || "[]")
      const newAct = {
        id: Date.now(),
        title: "New Student Enrolled",
        description: `${newStudent.name} enrolled in ${newStudent.class}`,
        time: "Just now"
      }
      window.localStorage.setItem("madarsa_activities", JSON.stringify([newAct, ...acts].slice(0, 10)))
    } catch(e) {}

    setNewStudent({
      name: "",
      class: "Hifz Class 1",
      parentName: "",
      phone: "",
    })
    setIsOpen(false)
  }

  const handleEditClick = (student: Student) => {
    setEditingStudent(student)
    setIsEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent || !editingStudent.name || !editingStudent.parentName || !editingStudent.phone) return

    setStudentsList(studentsList.map(s => s.id === editingStudent.id ? editingStudent : s))
    setIsEditOpen(false)
    setEditingStudent(null)
  }

  const handleDeleteClick = (student: Student) => {
    setDeletingStudent(student)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!deletingStudent) return
    setStudentsList(studentsList.filter(s => s.id !== deletingStudent.id))
    setIsDeleteOpen(false)
    setDeletingStudent(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">Manage all registered students across classes.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter the details of the new student to enroll them in the madarsa.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="E.g. Ahmed Raza" 
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="class">Class</Label>
                  <select 
                    id="class"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newStudent.class}
                    onChange={(e) => setNewStudent({...newStudent, class: e.target.value})}
                  >
                    <option value="Hifz Class 1">Hifz Class 1</option>
                    <option value="Hifz Class 2">Hifz Class 2</option>
                    <option value="Nazra">Nazra</option>
                    <option value="Aalim Course">Aalim Course</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="parent">Parent/Guardian Name</Label>
                  <Input 
                    id="parent" 
                    placeholder="Father's name" 
                    value={newStudent.parentName}
                    onChange={(e) => setNewStudent({...newStudent, parentName: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input 
                    id="phone" 
                    placeholder="0300-1234567" 
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Student</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>Edit Student Details</DialogTitle>
                <DialogDescription>
                  Modify the profile details of the student.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input 
                    id="edit-name" 
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-class">Class</Label>
                  <select 
                    id="edit-class"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingStudent.class}
                    onChange={(e) => setEditingStudent({...editingStudent, class: e.target.value})}
                  >
                    <option value="Hifz Class 1">Hifz Class 1</option>
                    <option value="Hifz Class 2">Hifz Class 2</option>
                    <option value="Nazra">Nazra</option>
                    <option value="Aalim Course">Aalim Course</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-parent">Parent/Guardian Name</Label>
                  <Input 
                    id="edit-parent" 
                    value={editingStudent.parentName}
                    onChange={(e) => setEditingStudent({...editingStudent, parentName: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Contact Phone</Label>
                  <Input 
                    id="edit-phone" 
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({...editingStudent, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <select 
                    id="edit-status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({...editingStudent, status: e.target.value as any})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Update Student</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-destructive">Delete Student</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete student <strong>{deletingStudent.name}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
                          <DropdownMenuTrigger render={
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          } />
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditClick(student)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit Student
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(student)} className="text-destructive">
                              <Trash className="mr-2 h-4 w-4 text-destructive" /> Delete Student
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem><FileText className="mr-2 h-4 w-4" /> View Profile</DropdownMenuItem>
                            <DropdownMenuItem><Phone className="mr-2 h-4 w-4" /> Contact Parent</DropdownMenuItem>
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
