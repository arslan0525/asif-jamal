"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, UserSquare2, Phone, MoreHorizontal, Pencil, Trash } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocalStorage, initialTeachers, Teacher } from "@/lib/store"

export default function TeachersPage() {
  const [teachersList, setTeachersList] = useLocalStorage<Teacher[]>("madarsa_teachers", initialTeachers)
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [newTeacher, setNewTeacher] = useState({
    name: "",
    class: "Hifz Class 1",
    phone: "",
    salary: "",
    status: "Active" as const,
  })

  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null)

  const filteredTeachers = (teachersList || []).filter(teacher => 
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.class.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeacher.name || !newTeacher.phone || !newTeacher.salary) return

    const maxNum = (teachersList || []).reduce((max, t) => {
      const num = parseInt(t.id.replace("TCH-0", ""), 10)
      return isNaN(num) ? max : Math.max(max, num)
    }, 3)

    const nextId = `TCH-${String(maxNum + 1).padStart(3, '0')}`

    const newObj: Teacher = {
      id: nextId,
      name: newTeacher.name,
      class: newTeacher.class,
      phone: newTeacher.phone,
      salary: parseFloat(newTeacher.salary),
      status: newTeacher.status,
    }

    setTeachersList([...teachersList, newObj])

    // Add to activity list if on dashboard
    try {
      const acts = JSON.parse(window.localStorage.getItem("madarsa_activities") || "[]")
      const newAct = {
        id: Date.now(),
        title: "Staff Added",
        description: `${newTeacher.name} appointed as teacher for ${newTeacher.class}`,
        time: "Just now"
      }
      window.localStorage.setItem("madarsa_activities", JSON.stringify([newAct, ...acts].slice(0, 10)))
    } catch(e) {}

    setNewTeacher({
      name: "",
      class: "Hifz Class 1",
      phone: "",
      salary: "",
      status: "Active",
    })
    setIsOpen(false)
  }

  const handleEditClick = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setIsEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTeacher || !editingTeacher.name || !editingTeacher.phone || !editingTeacher.salary) return

    setTeachersList(teachersList.map(t => t.id === editingTeacher.id ? editingTeacher : t))
    setIsEditOpen(false)
    setEditingTeacher(null)
  }

  const handleDeleteClick = (teacher: Teacher) => {
    setDeletingTeacher(teacher)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!deletingTeacher) return
    setTeachersList(teachersList.filter(t => t.id !== deletingTeacher.id))
    setIsDeleteOpen(false)
    setDeletingTeacher(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teachers</h2>
          <p className="text-muted-foreground">Manage teaching staff and their classes.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Teacher
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>
                  Enter the details to add a new teacher.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Teacher Name</Label>
                  <Input 
                    id="name" 
                    placeholder="E.g. Qari Tariq" 
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="class">Assigned Class</Label>
                  <select 
                    id="class"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTeacher.class}
                    onChange={(e) => setNewTeacher({...newTeacher, class: e.target.value})}
                  >
                    <option value="Hifz Class 1">Hifz Class 1</option>
                    <option value="Hifz Class 2">Hifz Class 2</option>
                    <option value="Nazra">Nazra</option>
                    <option value="Aalim Course">Aalim Course</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input 
                    id="phone" 
                    placeholder="0300-1112223" 
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="salary">Salary (Rs)</Label>
                  <Input 
                    id="salary" 
                    type="number"
                    placeholder="E.g. 25000" 
                    value={newTeacher.salary}
                    onChange={(e) => setNewTeacher({...newTeacher, salary: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTeacher.status}
                    onChange={(e) => setNewTeacher({...newTeacher, status: e.target.value as any})}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Teacher</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>Edit Teacher Details</DialogTitle>
                <DialogDescription>
                  Modify the profile and status of the teacher.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Teacher Name</Label>
                  <Input 
                    id="edit-name" 
                    value={editingTeacher.name}
                    onChange={(e) => setEditingTeacher({...editingTeacher, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-class">Assigned Class</Label>
                  <select 
                    id="edit-class"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingTeacher.class}
                    onChange={(e) => setEditingTeacher({...editingTeacher, class: e.target.value})}
                  >
                    <option value="Hifz Class 1">Hifz Class 1</option>
                    <option value="Hifz Class 2">Hifz Class 2</option>
                    <option value="Nazra">Nazra</option>
                    <option value="Aalim Course">Aalim Course</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Contact Phone</Label>
                  <Input 
                    id="edit-phone" 
                    value={editingTeacher.phone}
                    onChange={(e) => setEditingTeacher({...editingTeacher, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-salary">Salary (Rs)</Label>
                  <Input 
                    id="edit-salary" 
                    type="number"
                    value={editingTeacher.salary}
                    onChange={(e) => setEditingTeacher({...editingTeacher, salary: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <select 
                    id="edit-status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingTeacher.status}
                    onChange={(e) => setEditingTeacher({...editingTeacher, status: e.target.value as any})}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Update Teacher</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTeacher && (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-destructive">Delete Teacher Record</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete Qari/Maulana <strong>{deletingTeacher.name}</strong>? This action cannot be undone.
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
            <CardTitle>Teaching Staff</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search teachers..." 
                className="pl-8" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
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
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          } />
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditClick(teacher)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(teacher)} className="text-destructive">
                              <Trash className="mr-2 h-4 w-4 text-destructive" /> Remove Teacher
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No teachers found.
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
