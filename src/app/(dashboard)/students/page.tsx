"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Filter, MoreHorizontal, FileText, Phone, UserPlus, Pencil, Trash, Printer, Download } from "lucide-react"
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
import { useLocalStorage, initialStudents, Student, availableClasses, initialFees, FeeRecord } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"

export default function StudentsPage() {
  const { t, isUrdu } = useLanguage()
  const [studentsList, setStudentsList] = useLocalStorage<Student[]>("madarsa_students", initialStudents)
  const [feesList] = useLocalStorage<FeeRecord[]>("madarsa_fees", initialFees)
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  
  const [newStudent, setNewStudent] = useState({
    name: "",
    class: availableClasses[0] || "Hifz 1",
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
      class: availableClasses[0] || "Hifz 1",
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

  const handleDownloadStudentsCSV = () => {
    let csv = "Student Roster & Attendance Summary\n"
    csv += `Date Generated: ${new Date().toLocaleDateString()}\n\n`
    csv += "Student ID,Name,Class,Parent Name,Contact Phone,Status\n"
    
    studentsList.forEach(s => {
      csv += `${s.id},"${s.name}","${s.class}","${s.parentName}","${s.phone}",${s.status}\n`
    })

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", isUrdu ? "طلباء_رپورٹ.csv" : "students_report.csv")
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrintIDCard = (student: Student) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student ID Card - ${student.name}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f0f2f5;
            }
            .card-container {
              width: 350px;
              height: 520px;
              background: white;
              border-radius: 16px;
              box-shadow: 0 8px 24px rgba(0,0,0,0.1);
              overflow: hidden;
              border: 1px solid #e1e4e8;
              position: relative;
              box-sizing: border-box;
            }
            .card-header {
              background: linear-gradient(135deg, #1e3a8a, #3b82f6);
              color: white;
              padding: 24px 16px;
              text-align: center;
              position: relative;
            }
            .card-header h2 {
              margin: 0;
              font-size: 20px;
              letter-spacing: 0.5px;
            }
            .card-header p {
              margin: 4px 0 0 0;
              font-size: 11px;
              opacity: 0.8;
            }
            .avatar-container {
              display: flex;
              justify-content: center;
              margin-top: -50px;
              position: relative;
              z-index: 10;
            }
            .avatar {
              width: 100px;
              height: 100px;
              border-radius: 50%;
              background: linear-gradient(135deg, #e0f2fe, #bae6fd);
              color: #0369a1;
              font-size: 32px;
              font-weight: bold;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 4px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .card-body {
              padding: 24px;
              text-align: center;
            }
            .student-name {
              font-size: 22px;
              font-weight: bold;
              color: #1f2937;
              margin: 0 0 4px 0;
            }
            .student-id {
              font-size: 12px;
              color: #6b7280;
              font-weight: 600;
              background: #f3f4f6;
              padding: 4px 12px;
              border-radius: 9999px;
              display: inline-block;
              margin-bottom: 20px;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              text-align: left;
              margin-top: 10px;
            }
            .info-row {
              border-bottom: 1px solid #f3f4f6;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              padding: 10px 0;
              font-size: 13px;
              color: #6b7280;
              font-weight: 500;
              width: 40%;
            }
            .info-value {
              padding: 10px 0;
              font-size: 14px;
              color: #1f2937;
              font-weight: 600;
              text-align: right;
            }
            .card-footer {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              background: #f8fafc;
              padding: 12px;
              text-align: center;
              border-top: 1px solid #f1f5f9;
              font-size: 11px;
              color: #94a3b8;
            }
            .print-btn-container {
              position: fixed;
              top: 20px;
              right: 20px;
            }
            .print-btn {
              background: #1e3a8a;
              color: white;
              border: none;
              padding: 10px 20px;
              font-size: 14px;
              font-weight: bold;
              border-radius: 6px;
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            @media print {
              body {
                background: white;
              }
              .print-btn-container {
                display: none !important;
              }
              .card-container {
                box-shadow: none;
                border: 1px solid #ccc;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-btn-container">
            <button class="print-btn" onclick="window.print()">${isUrdu ? "پرنٹ کریں" : "Print ID Card"}</button>
          </div>
          
          <div class="card-container" dir="${isUrdu ? 'rtl' : 'ltr'}">
            <div class="card-header">
              <h2>${isUrdu ? "مدرسہ انوارِ مدینہ" : "Madarsa Anwar-ul-Madina"}</h2>
              <p>${isUrdu ? "طالب علم شناختی کارڈ" : "Student Identity Card"}</p>
            </div>
            <div class="avatar-container">
              <div class="avatar">
                ${student.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
              </div>
            </div>
            <div class="card-body">
              <h3 class="student-name">${student.name}</h3>
              <span class="student-id">${student.id}</span>
              
              <table class="info-table" dir="${isUrdu ? 'rtl' : 'ltr'}">
                <tr class="info-row">
                  <td class="info-label" style="text-align: ${isUrdu ? 'right' : 'left'}">${isUrdu ? "درجہ / کلاس:" : "Class:"}</td>
                  <td class="info-value" style="text-align: ${isUrdu ? 'left' : 'right'}">${student.class}</td>
                </tr>
                <tr class="info-row">
                  <td class="info-label" style="text-align: ${isUrdu ? 'right' : 'left'}">${isUrdu ? "والد کا نام:" : "Father's Name:"}</td>
                  <td class="info-value" style="text-align: ${isUrdu ? 'left' : 'right'}">${student.parentName}</td>
                </tr>
                <tr class="info-row">
                  <td class="info-label" style="text-align: ${isUrdu ? 'right' : 'left'}">${isUrdu ? "رابطہ نمبر:" : "Contact No:"}</td>
                  <td class="info-value" style="text-align: ${isUrdu ? 'left' : 'right'}">${student.phone}</td>
                </tr>
                <tr class="info-row">
                  <td class="info-label" style="text-align: ${isUrdu ? 'right' : 'left'}">${isUrdu ? "حالت:" : "Status:"}</td>
                  <td class="info-value" style="text-align: ${isUrdu ? 'left' : 'right'}; color: ${student.status === 'Active' ? '#16a34a' : '#ef4444'}">
                    ${student.status === 'Active' ? (isUrdu ? "سرگرم" : "Active") : (isUrdu ? "غیر سرگرم" : "Inactive")}
                  </td>
                </tr>
              </table>
            </div>
            <div class="card-footer">
              ${isUrdu ? "مدرسہ مینجمنٹ سسٹم © 2026" : "Madarsa Management System © 2026"}
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("stuTitle")}</h2>
          <p className="text-muted-foreground">{t("stuSubtitle")}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> {t("addStudentBtn")}
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{t("addStudentTitle")}</DialogTitle>
                <DialogDescription>
                  {t("addStudentDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("fullName")}</Label>
                  <Input 
                    id="name" 
                    placeholder="E.g. Ahmed Raza" 
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="class">{t("class")}</Label>
                  <select 
                    id="class"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                    value={newStudent.class}
                    onChange={(e) => setNewStudent({...newStudent, class: e.target.value})}
                  >
                    {availableClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="parent">{t("parentName")}</Label>
                  <Input 
                    id="parent" 
                    placeholder="Father's name" 
                    value={newStudent.parentName}
                    onChange={(e) => setNewStudent({...newStudent, parentName: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">{t("phone")}</Label>
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
                <Button type="submit">{t("saveStudent")}</Button>
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
                <DialogTitle>{t("editStudentTitle")}</DialogTitle>
                <DialogDescription>
                  {t("editStudentDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">{t("fullName")}</Label>
                  <Input 
                    id="edit-name" 
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-class">{t("class")}</Label>
                  <select 
                    id="edit-class"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                    value={editingStudent.class}
                    onChange={(e) => setEditingStudent({...editingStudent, class: e.target.value})}
                  >
                    {availableClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-parent">{t("parentName")}</Label>
                  <Input 
                    id="edit-parent" 
                    value={editingStudent.parentName}
                    onChange={(e) => setEditingStudent({...editingStudent, parentName: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">{t("phone")}</Label>
                  <Input 
                    id="edit-phone" 
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({...editingStudent, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">{t("status")}</Label>
                  <select 
                    id="edit-status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({...editingStudent, status: e.target.value as any})}
                  >
                    <option value="Active">{t("statusActive")}</option>
                    <option value="Inactive">{t("statusInactive")}</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{t("updateStudent")}</Button>
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
              <DialogTitle className="text-destructive">{t("deleteStudentTitle")}</DialogTitle>
              <DialogDescription className="text-left pt-2">
                {t("deleteStudentDesc", { name: deletingStudent.name })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t("cancel")}</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>{t("delete")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Student Profile & ID Card Modal */}
      {viewingStudent && (
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isUrdu ? "طالب علم کا پروفائل اور شناختی کارڈ" : "Student Profile & ID Card"}</DialogTitle>
              <DialogDescription>
                {isUrdu ? "طالب علم کی معلومات، شناختی کارڈ کا جائزہ اور فیس کی تفصیلات۔" : "Overview of student details, ID card representation, and fee logs."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6 py-4">
              {/* Printable ID Card Graphic */}
              <div className="flex justify-center">
                <div 
                  className="w-full max-w-[320px] bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-xl overflow-hidden border border-slate-700/50 flex flex-col relative"
                  dir={isUrdu ? "rtl" : "ltr"}
                >
                  <div className="bg-gradient-to-r from-primary to-primary-hover p-4 text-center border-b border-white/10">
                    <h3 className="font-bold text-lg leading-tight tracking-wide">{isUrdu ? "مدرسہ انوارِ مدینہ" : "Madarsa Anwar-ul-Madina"}</h3>
                    <p className="text-[10px] text-white/80 uppercase font-semibold mt-0.5">{isUrdu ? "طالب علم شناختی کارڈ" : "Student Identity Card"}</p>
                  </div>
                  
                  <div className="p-5 flex flex-col items-center gap-4">
                    <Avatar className="h-20 w-20 ring-4 ring-white/15 shadow-md">
                      <AvatarFallback className="bg-white/10 text-white text-2xl font-bold">
                        {viewingStudent.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="text-center w-full">
                      <h4 className="font-bold text-xl leading-tight text-white">{viewingStudent.name}</h4>
                      <span className="inline-block bg-white/10 px-3 py-0.5 rounded-full text-xs font-semibold text-primary-foreground/90 mt-1">{viewingStudent.id}</span>
                    </div>

                    <div className="w-full border-t border-white/5 my-1" />

                    <div className="w-full space-y-2.5 text-sm">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-white/60 font-medium">{isUrdu ? "درجہ / کلاس:" : "Class:"}</span>
                        <span className="font-bold text-white/95">{viewingStudent.class}</span>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-white/60 font-medium">{isUrdu ? "والد کا نام:" : "Father's Name:"}</span>
                        <span className="font-bold text-white/95">{viewingStudent.parentName}</span>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-white/60 font-medium">{isUrdu ? "رابطہ نمبر:" : "Contact No:"}</span>
                        <span className="font-bold text-white/95">{viewingStudent.phone}</span>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-white/60 font-medium">{isUrdu ? "حالت:" : "Status:"}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          viewingStudent.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                        }`}>
                          {viewingStudent.status === "Active" ? (isUrdu ? "سرگرم" : "Active") : (isUrdu ? "غیر سرگرم" : "Inactive")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-3 text-center border-t border-white/5 text-[9px] text-white/40 uppercase tracking-widest">
                    {isUrdu ? "مدرسہ مینجمنٹ سسٹم © 2026" : "Madarsa Management System © 2026"}
                  </div>
                </div>
              </div>

              {/* Dynamic Fee Summary / Logs */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground/80 flex items-center gap-1.5 px-1">
                  <FileText className="h-4 w-4 text-primary" />
                  {isUrdu ? "فیس کا ریکارڈ" : "Fees Payment Log"}
                </h4>
                <div className="rounded-lg border bg-muted/20 p-3 text-sm space-y-2.5">
                  {(() => {
                    const studentFees = feesList.filter(f => f.student.toLowerCase() === viewingStudent.name.toLowerCase())
                    if (studentFees.length === 0) {
                      return (
                        <p className="text-muted-foreground text-center text-xs py-2">
                          {isUrdu ? "اس طالب علم کی فیس کا کوئی ریکارڈ نہیں ملا۔" : "No fee records found for this student."}
                        </p>
                      )
                    }
                    return (
                      <div className="space-y-2">
                        {studentFees.map(f => (
                          <div key={f.id} className="flex items-center justify-between border-b border-muted-foreground/10 pb-1.5 last:border-b-0 last:pb-0">
                            <div>
                              <span className="font-semibold text-foreground/95">{f.month}</span>
                              <span className="text-[10px] text-muted-foreground block">{isUrdu ? `وصولی تاریخ: ${f.date}` : `Date: ${f.date}`}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">Rs {f.amount.toLocaleString()}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                f.status === "Paid" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                              }`}>
                                {f.status === "Paid" ? (isUrdu ? "ادا شدہ" : "Paid") : (isUrdu ? "بقایا" : "Pending")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsProfileOpen(false)}>{t("cancel")}</Button>
              <Button className="bg-primary hover:bg-primary-hover text-white flex items-center gap-2" onClick={() => handlePrintIDCard(viewingStudent)}>
                <Printer className="h-4 w-4" />
                {isUrdu ? "کارڈ پرنٹ کریں" : "Print ID Card"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>{t("allStudents")}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t("searchStudents")}
                  className="pl-8" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleDownloadStudentsCSV} 
                className="flex items-center gap-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              >
                <Download className="h-4 w-4" />
                <span>{isUrdu ? "ایکسل ڈاؤن لوڈ" : "Download Excel"}</span>
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">{t("filter")}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">{t("stuId")}</TableHead>
                  <TableHead>{t("student")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("class")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("parent")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
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
                          {student.status === "Active" ? t("statusActive") : t("statusInactive")}
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
                            <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditClick(student)}>
                              <Pencil className="mr-2 h-4 w-4" /> {t("editStudentTitle")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(student)} className="text-destructive">
                              <Trash className="mr-2 h-4 w-4 text-destructive" /> {t("deleteStudentTitle")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setViewingStudent(student); setIsProfileOpen(true); }}>
                              <FileText className="mr-2 h-4 w-4" /> {t("profile")}
                            </DropdownMenuItem>
                            <DropdownMenuItem><Phone className="mr-2 h-4 w-4" /> {t("phone")}</DropdownMenuItem>
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
