"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
import { useLanguage } from "@/components/language-provider"
import { 
  useLocalStorage, 
  initialTeachers, 
  Teacher, 
  availableClasses, 
  initialSalaries, 
  SalaryRecord, 
  Expense, 
  Activity 
} from "@/lib/store"
import { 
  Search, 
  Plus, 
  Phone, 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  CreditCard, 
  Printer, 
  CheckCircle2, 
  Landmark, 
  User, 
  DollarSign, 
  Calendar 
} from "lucide-react"

export default function TeachersPage() {
  const { t, language } = useLanguage()
  const isUrdu = language === "ur"

  // Local storage lists
  const [teachersList, setTeachersList] = useLocalStorage<Teacher[]>("madarsa_teachers", initialTeachers)
  const [salariesList, setSalariesList] = useLocalStorage<SalaryRecord[]>("madarsa_salaries", initialSalaries)
  const [expensesList, setExpensesList] = useLocalStorage<Expense[]>("madarsa_expenses", [])
  const [activitiesList, setActivitiesList] = useLocalStorage<Activity[]>("madarsa_activities", [])

  const [activeTab, setActiveTab] = useState<"directory" | "salaries">("directory")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("Sep 2023")

  // Modals open/close
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isPayOpen, setIsPayOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isSlipOpen, setIsSlipOpen] = useState(false)

  // Selected items for modals
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null)
  const [payingTeacher, setPayingTeacher] = useState<Teacher | null>(null)
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null)
  const [viewingSlip, setViewingSlip] = useState<SalaryRecord | null>(null)

  // Form states
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    class: "Hifz 1",
    phone: "",
    salary: "",
    status: "Active" as const,
  })

  const [payForm, setPayForm] = useState({
    amount: "",
    month: "Sep 2023",
    date: new Date().toISOString().split('T')[0],
  })

  const monthsList = [
    "Sep 2023",
    "Oct 2023",
    "Nov 2023",
    "Dec 2023",
    "Jan 2024",
    "Feb 2024",
    "Mar 2024",
    "Apr 2024",
    "May 2026"
  ]

  // Filter staff list
  const filteredTeachers = (teachersList || []).filter(teacher => 
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.class.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get salary record helper
  const getTeacherSalaryRecord = (teacherName: string, month: string) => {
    return (salariesList || []).find(s => s.teacher === teacherName && s.month === month)
  }

  // Calculations for overview stats
  const totalTeachers = (teachersList || []).length
  const activeTeachers = (teachersList || []).filter(t => t.status === "Active").length
  const totalSalaryBudget = (teachersList || []).filter(t => t.status === "Active").reduce((sum, t) => sum + t.salary, 0)

  // Monthly breakdown
  const paidSalariesThisMonth = (salariesList || []).filter(s => s.month === selectedMonth && s.status === "Paid")
  const paidAmountThisMonth = paidSalariesThisMonth.reduce((sum, s) => sum + s.amount, 0)
  
  const pendingTeachersThisMonth = (teachersList || []).filter(t => t.status === "Active" && !paidSalariesThisMonth.some(s => s.teacher === t.name))
  const pendingAmountThisMonth = pendingTeachersThisMonth.reduce((sum, t) => sum + t.salary, 0)

  // Save new teacher
  const handleAddSubmit = (e: React.FormEvent) => {
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

    // Log activity
    try {
      const newAct: Activity = {
        id: Date.now(),
        title: isUrdu ? "استاد کا تقرر" : "Staff Added",
        description: isUrdu 
          ? `${newTeacher.name} کا بطور استاد برائے ${newTeacher.class} تقرر کیا گیا`
          : `${newTeacher.name} appointed as teacher for ${newTeacher.class}`,
        time: "Just now"
      }
      setActivitiesList([newAct, ...activitiesList])
    } catch(e) {}

    setNewTeacher({
      name: "",
      class: "Hifz 1",
      phone: "",
      salary: "",
      status: "Active",
    })
    setIsAddOpen(false)
  }

  // Edit teacher click
  const handleEditClick = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setIsEditOpen(true)
  }

  // Edit teacher submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTeacher || !editingTeacher.name || !editingTeacher.phone || !editingTeacher.salary) return

    setTeachersList(teachersList.map(t => t.id === editingTeacher.id ? editingTeacher : t))
    setIsEditOpen(false)
    setEditingTeacher(null)
  }

  // Delete teacher click
  const handleDeleteClick = (teacher: Teacher) => {
    setDeletingTeacher(teacher)
    setIsDeleteOpen(true)
  }

  // Delete teacher confirm
  const handleDeleteConfirm = () => {
    if (!deletingTeacher) return
    setTeachersList(teachersList.filter(t => t.id !== deletingTeacher.id))
    setIsDeleteOpen(false)
    setDeletingTeacher(null)
  }

  // Trigger Pay Salary dialog
  const triggerPaySalary = (teacher: Teacher, month: string = selectedMonth) => {
    setPayingTeacher(teacher)
    setPayForm({
      amount: String(teacher.salary),
      month: month,
      date: new Date().toISOString().split('T')[0]
    })
    setIsPayOpen(true)
  }

  // Pay Salary submit
  const handlePaySalarySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!payingTeacher || !payForm.amount) return

    // 1. Create a SalaryRecord
    const maxNum = (salariesList || []).reduce((max, s) => {
      const num = parseInt(s.id.replace("SAL-", ""), 10)
      return isNaN(num) ? max : Math.max(max, num)
    }, 103)
    const nextId = `SAL-${String(maxNum + 1).padStart(3, '0')}`

    const newSalaryRecord: SalaryRecord = {
      id: nextId,
      teacher: payingTeacher.name,
      amount: parseFloat(payForm.amount),
      month: payForm.month,
      status: "Paid",
      date: new Date(payForm.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    setSalariesList([newSalaryRecord, ...salariesList])

    // 2. Log in expenses
    const maxExpNum = (expensesList || []).reduce((max, exp) => {
      const num = parseInt(exp.id.replace("EXP-3", ""), 10)
      return isNaN(num) ? max : Math.max(max, num)
    }, 4)
    const nextExpId = `EXP-3${String(maxExpNum + 1).padStart(2, '0')}`

    const newExpense: Expense = {
      id: nextExpId,
      category: `Teacher Salary: ${payingTeacher.name}`,
      amount: parseFloat(payForm.amount),
      date: new Date(payForm.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      recordedBy: "Admin"
    }

    setExpensesList([newExpense, ...expensesList])

    // 3. Log activity
    const newAct: Activity = {
      id: Date.now(),
      title: isUrdu ? "تنخواہ ادا کی گئی" : "Salary Paid",
      description: isUrdu 
        ? `${payingTeacher.name} کو ${payForm.month} کی تنخواہ Rs ${parseFloat(payForm.amount).toLocaleString()} ادا کی گئی` 
        : `Paid Rs ${parseFloat(payForm.amount).toLocaleString()} to ${payingTeacher.name} for ${payForm.month}`,
      time: "Just now"
    }
    setActivitiesList([newAct, ...activitiesList])

    setIsPayOpen(false)
    setPayingTeacher(null)
  }

  // Open single teacher details panel
  const handleTeacherClick = (teacher: Teacher) => {
    setViewingTeacher(teacher)
    setIsDetailOpen(true)
  }

  // Open Salary slip print modal
  const handleOpenSlip = (record: SalaryRecord) => {
    setViewingSlip(record)
    setIsSlipOpen(true)
  }

  // High fidelity printable pop-up
  const handlePrintSlip = () => {
    if (!viewingSlip) return
    const printContent = document.getElementById("salary-slip-print")?.innerHTML
    const originalContent = document.body.innerHTML
    
    if (printContent) {
      const newWindow = window.open("", "_blank")
      newWindow?.document.write(`
        <html>
          <head>
            <title>Salary Slip - ${viewingSlip.teacher}</title>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
            <style>
              body { 
                font-family: 'Inter', sans-serif; 
                padding: 40px; 
                background: #fafafa;
                direction: ${isUrdu ? 'rtl' : 'ltr'}; 
              }
              .slip-container { 
                border: 2px dashed #a1a1aa; 
                padding: 30px; 
                max-width: 480px; 
                margin: 0 auto; 
                background: #ffffff; 
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                border-radius: 8px;
                position: relative;
              }
              .header { 
                border-bottom: 2px double #3f3f46; 
                padding-bottom: 15px; 
                margin-bottom: 20px; 
                text-align: center;
              }
              .title { 
                font-size: 22px; 
                font-weight: 800; 
                margin: 5px 0; 
                color: #18181b;
              }
              .subtitle {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: #71717a;
                margin-top: 2px;
              }
              .details-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 12px; 
                margin-bottom: 20px;
                font-size: 13px;
                border-bottom: 1px solid #e4e4e7;
                padding-bottom: 15px;
              }
              .details-row { 
                display: flex; 
                justify-content: space-between; 
                padding: 4px 0;
              }
              .label { 
                color: #71717a; 
                font-weight: 500;
              }
              .value { 
                font-weight: 700; 
                color: #18181b;
              }
              .amount-box { 
                background: #f0fdf4; 
                padding: 16px; 
                border-radius: 8px; 
                text-align: center; 
                margin: 20px 0; 
                border: 1px solid #bbf7d0; 
              }
              .amount-title {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #166534;
                font-weight: 600;
                margin-bottom: 4px;
              }
              .amount-val {
                font-size: 24px;
                font-weight: 800;
                color: #15803d;
              }
              .stamp-wrapper {
                display: flex;
                justify-content: center;
                margin: 15px 0;
              }
              .stamp { 
                border: 3px double #10b981; 
                color: #10b981; 
                display: inline-block; 
                padding: 6px 18px; 
                font-size: 15px; 
                font-weight: 900; 
                text-transform: uppercase; 
                transform: rotate(-6deg); 
                border-radius: 6px; 
                letter-spacing: 0.05em;
              }
              .signatures { 
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-top: 40px; 
                font-size: 11px; 
                color: #71717a;
              }
              .signature-line {
                border-top: 1px dashed #d4d4d8;
                padding-top: 6px;
                text-align: center;
              }
              @media print {
                body { padding: 0; background: #fff; }
                .slip-container { box-shadow: none; border: 1px dashed #000; }
              }
            </style>
          </head>
          <body>
            <div class="slip-container">
              ${printContent}
            </div>
            <script>
              window.onload = function() { 
                window.print(); 
                window.close(); 
              }
            </script>
          </body>
        </html>
      `)
      newWindow?.document.close()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Heading */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("tchTitle")}</h2>
          <p className="text-muted-foreground">{t("tchSubtitle")}</p>
        </div>
        
        {/* Quick Add Button */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="shadow-sm hover:scale-[1.01] transition-transform">
              <Plus className="mr-2 h-4 w-4" /> {t("addTeacherBtn")}
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddSubmit}>
              <DialogHeader>
                <DialogTitle>{t("addTeacherTitle")}</DialogTitle>
                <DialogDescription>
                  {t("addTeacherDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("teacher")}</Label>
                  <Input 
                    id="name" 
                    placeholder="Qari Tariq" 
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="class">{t("assignedClass")}</Label>
                  <select 
                    id="class"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTeacher.class}
                    onChange={(e) => setNewTeacher({...newTeacher, class: e.target.value})}
                  >
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input 
                    id="phone" 
                    placeholder="0300-1112223" 
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="salary">{t("salaryLabel")}</Label>
                  <Input 
                    id="salary" 
                    type="number"
                    placeholder="25000" 
                    value={newTeacher.salary}
                    onChange={(e) => setNewTeacher({...newTeacher, salary: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">{t("status")}</Label>
                  <select 
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTeacher.status}
                    onChange={(e) => setNewTeacher({...newTeacher, status: e.target.value as any})}
                  >
                    <option value="Active">{t("statusActive")}</option>
                    <option value="On Leave">{isUrdu ? "رخصت پر" : "On Leave"}</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{t("saveTeacher")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Teachers Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-50/50 to-white dark:from-zinc-900/30 border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isUrdu ? "کل اساتذہ" : "Total Teachers"}
            </CardTitle>
            <User className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeachers}</div>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="font-semibold text-emerald-500">{activeTeachers}</span>
              {isUrdu ? "سرگرم تدریسی عملہ" : "active teaching staff"}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Budget Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-sky-50/50 to-white dark:from-zinc-900/30 border-l-4 border-l-sky-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isUrdu ? "ماہانہ تنخواہ بجٹ" : "Monthly Salaries Budget"}
            </CardTitle>
            <Landmark className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {totalSalaryBudget.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {isUrdu ? "کل فعال اساتذہ کی بنیادی تنخواہ" : "Base salary of all active teachers"}
            </p>
          </CardContent>
        </Card>

        {/* Salaries Paid Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50/50 to-white dark:from-zinc-900/30 border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isUrdu ? "ادا شدہ تنخواہیں" : "Salaries Paid"} ({selectedMonth})
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Rs {paidAmountThisMonth.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {isUrdu ? `${paidSalariesThisMonth.length} اساتذہ کو ادائیگی ہو چکی ہے` : `Paid to ${paidSalariesThisMonth.length} teachers`}
            </p>
          </CardContent>
        </Card>

        {/* Salaries Pending Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-rose-50/50 to-white dark:from-zinc-900/30 border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isUrdu ? "بقایا تنخواہیں" : "Salaries Pending"} ({selectedMonth})
            </CardTitle>
            <CreditCard className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">Rs {pendingAmountThisMonth.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {isUrdu ? `${pendingTeachersThisMonth.length} اساتذہ کی تنخواہ باقی ہے` : `Pending for ${pendingTeachersThisMonth.length} active teachers`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Container */}
      <div className="space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("directory")}
            className={`py-3 px-6 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "directory"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <User className="h-4 w-4" />
            {isUrdu ? "اساتذہ کی فہرست" : "Staff Directory"}
          </button>
          <button
            onClick={() => setActiveTab("salaries")}
            className={`py-3 px-6 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "salaries"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Landmark className="h-4 w-4" />
            {isUrdu ? "تنخواہوں کی ادائیگی" : "Salary Payments"}
          </button>
        </div>

        {/* Tab 1: Staff Directory View */}
        {activeTab === "directory" && (
          <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>{t("teachingStaff")}</CardTitle>
                  <CardDescription>
                    {isUrdu ? "مدرسے کے تمام قاری، مولانا اور اساتذہ کے کوائف کا انتظام کریں" : "Manage records, classes, and base salaries of all teachers."}
                  </CardDescription>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={t("searchTeachers")} 
                    className="pl-8" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                    <TableRow>
                      <TableHead className="font-semibold">{t("teacher")}</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold">{t("assignedClass")}</TableHead>
                      <TableHead className="hidden lg:table-cell font-semibold">{t("contact")}</TableHead>
                      <TableHead className="font-semibold">{isUrdu ? "بنیادی تنخواہ" : "Monthly Salary"}</TableHead>
                      <TableHead className="font-semibold">{t("status")}</TableHead>
                      <TableHead className="text-right font-semibold">{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.length > 0 ? (
                      filteredTeachers.map((teacher) => (
                        <TableRow key={teacher.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                          
                          {/* Teacher Name */}
                          <TableCell className="font-medium cursor-pointer" onClick={() => handleTeacherClick(teacher)}>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 bg-primary/5 text-primary border border-primary/10">
                                <AvatarFallback className="font-bold text-xs uppercase">
                                  {teacher.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-semibold hover:underline decoration-primary decoration-2 underline-offset-2">{teacher.name}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">{teacher.id}</span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Assigned Class */}
                          <TableCell className="hidden md:table-cell">{teacher.class}</TableCell>

                          {/* Phone Contact */}
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {teacher.phone}
                            </div>
                          </TableCell>

                          {/* Monthly Salary */}
                          <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">
                            Rs {teacher.salary.toLocaleString()}
                          </TableCell>

                          {/* Status Badge */}
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                              teacher.status === "Active" 
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50" 
                                : "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 border border-orange-200/50"
                            }`}>
                              {teacher.status === "Active" ? t("statusActive") : (isUrdu ? "رخصت پر" : "On Leave")}
                            </span>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger render={
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              } />
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleTeacherClick(teacher)}>
                                  <User className="mr-2 h-4 w-4" /> {isUrdu ? "تفصیلات دیکھیں" : "View Profile"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => triggerPaySalary(teacher)}>
                                  <CreditCard className="mr-2 h-4 w-4 text-emerald-500" /> {isUrdu ? "تنخواہ ادا کریں" : "Pay Salary"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEditClick(teacher)}>
                                  <Pencil className="mr-2 h-4 w-4" /> {isUrdu ? "ترمیم کریں" : "Edit Details"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteClick(teacher)} className="text-destructive">
                                  <Trash className="mr-2 h-4 w-4 text-destructive" /> {isUrdu ? "استاد کو خارج کریں" : "Remove Teacher"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          {isUrdu ? "کوئی اساتذہ نہیں ملے۔" : "No teachers found."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Salary Payments View */}
        {activeTab === "salaries" && (
          <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Header Title */}
                <div>
                  <CardTitle>{isUrdu ? "تنخواہ ریکارڈ اور ادائیگی" : "Salaries & Payments"}</CardTitle>
                  <CardDescription>
                    {isUrdu ? "ماہانہ تنخواہ جاری کریں اور ادائیگی کی کمپیوٹرائزڈ رسید پرنٹ کریں" : "Track salary payment status by month and print vouchers."}
                  </CardDescription>
                </div>

                {/* Month Picker dropdown */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground hidden sm:block" />
                  <Label htmlFor="salary-month-select" className="text-xs font-semibold whitespace-nowrap text-muted-foreground hidden sm:block">
                    {isUrdu ? "بلنگ مہینہ:" : "Select Month:"}
                  </Label>
                  <select 
                    id="salary-month-select"
                    className="flex h-9 w-44 rounded-md border border-input bg-background px-3 py-1 text-sm font-semibold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {monthsList.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              
              {/* Table of active teachers and payments */}
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                    <TableRow>
                      <TableHead className="font-semibold">{t("teacher")}</TableHead>
                      <TableHead className="font-semibold">{isUrdu ? "تنخواہ رقم" : "Amount"}</TableHead>
                      <TableHead className="font-semibold">{isUrdu ? "مہینہ" : "Billing Month"}</TableHead>
                      <TableHead className="font-semibold">{isUrdu ? "حالت ادائیگی" : "Payment Status"}</TableHead>
                      <TableHead className="font-semibold">{isUrdu ? "تاریخ ادائیگی" : "Date Paid"}</TableHead>
                      <TableHead className="text-right font-semibold">{isUrdu ? "اقدامات" : "Actions"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(teachersList || []).length > 0 ? (
                      (teachersList || []).map((teacher) => {
                        const record = getTeacherSalaryRecord(teacher.name, selectedMonth)
                        const isPaid = !!record

                        return (
                          <TableRow key={teacher.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                            
                            {/* Teacher details */}
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{teacher.name}</span>
                                <span className="text-[10px] text-muted-foreground">{teacher.class} • {teacher.status === "Active" ? t("statusActive") : (isUrdu ? "رخصت پر" : "On Leave")}</span>
                              </div>
                            </TableCell>

                            {/* Base amount */}
                            <TableCell className="font-bold">
                              Rs {teacher.salary.toLocaleString()}
                            </TableCell>

                            {/* Selected month */}
                            <TableCell className="font-medium text-zinc-600 dark:text-zinc-400">
                              {selectedMonth}
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                isPaid 
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50" 
                                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200/50"
                              }`}>
                                {isPaid ? t("salaryPaid") : t("salaryPending")}
                              </span>
                            </TableCell>

                            {/* Date Paid */}
                            <TableCell className="text-xs text-muted-foreground font-medium">
                              {isPaid ? record.date : "-"}
                            </TableCell>

                            {/* Pay/Receipt Buttons */}
                            <TableCell className="text-right">
                              {isPaid ? (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 text-xs"
                                  onClick={() => handleOpenSlip(record)}
                                >
                                  <Printer className="mr-1.5 h-3.5 w-3.5" />
                                  {isUrdu ? "رسید پرنٹ" : "Print Voucher"}
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="default"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs hover:scale-[1.02] transition-transform"
                                  onClick={() => triggerPaySalary(teacher)}
                                >
                                  <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                                  {t("paySalary")}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          {isUrdu ? "کوئی اساتذہ دستیاب نہیں ہیں۔" : "No teachers available."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* MODAL: Teacher Profile Details & History */}
      {viewingTeacher && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[620px] max-h-[85vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary/5 text-primary border">
                  <AvatarFallback className="font-extrabold uppercase">
                    {viewingTeacher.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span>{viewingTeacher.name}</span>
                  <span className="text-xs text-muted-foreground font-normal">{viewingTeacher.id}</span>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-6 py-4 md:grid-cols-2">
              
              {/* Left Column: Personal details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {isUrdu ? "عملے کی معلومات" : "Personal Profile Details"}
                </h4>
                
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">{t("assignedClass")}:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{viewingTeacher.class}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">{t("phone")}:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{viewingTeacher.phone}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">{isUrdu ? "بنیادی تنخواہ:" : "Base Salary:"}</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">Rs {viewingTeacher.salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">{t("status")}:</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      viewingTeacher.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                    }`}>
                      {viewingTeacher.status === "Active" ? t("statusActive") : (isUrdu ? "رخصت پر" : "On Leave")}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      setIsDetailOpen(false)
                      triggerPaySalary(viewingTeacher)
                    }}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {isUrdu ? "تنخواہ ادا کریں" : "Pay Salary"}
                  </Button>
                </div>
              </div>

              {/* Right Column: Salary History table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("salaryHistory")}
                </h4>
                
                <div className="border rounded-md overflow-hidden max-h-56 overflow-y-auto">
                  <Table className="text-xs">
                    <TableHeader className="bg-zinc-50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="font-semibold">{isUrdu ? "مہینہ" : "Month"}</TableHead>
                        <TableHead className="font-semibold">{isUrdu ? "رقم" : "Amount"}</TableHead>
                        <TableHead className="text-right font-semibold">{isUrdu ? "پرنٹ" : "Print"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(salariesList || []).filter(s => s.teacher === viewingTeacher.name).length > 0 ? (
                        (salariesList || [])
                          .filter(s => s.teacher === viewingTeacher.name)
                          .map((record) => (
                            <TableRow key={record.id}>
                              <TableCell className="font-semibold">{record.month}</TableCell>
                              <TableCell className="font-bold text-emerald-600">Rs {record.amount.toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-indigo-600 hover:text-indigo-800"
                                  onClick={() => handleOpenSlip(record)}
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                            {isUrdu ? "کوئی تنخواہ ریکارڈ نہیں ملا۔" : "No salary payments found."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL: Record Salary Payment (Pay Salary) */}
      {payingTeacher && (
        <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handlePaySalarySubmit}>
              <DialogHeader>
                <DialogTitle>{t("salaryPaidTitle")}</DialogTitle>
                <DialogDescription>
                  {t("salaryPaidDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                
                {/* Teacher read only */}
                <div className="grid gap-2">
                  <Label htmlFor="pay-teacher">{t("teacher")}</Label>
                  <Input 
                    id="pay-teacher" 
                    value={payingTeacher.name}
                    disabled
                    className="bg-zinc-50 border-zinc-200 text-zinc-500 font-semibold"
                  />
                </div>

                {/* Billing Month select */}
                <div className="grid gap-2">
                  <Label htmlFor="pay-month">{t("billingMonth")}</Label>
                  <select 
                    id="pay-month"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={payForm.month}
                    onChange={(e) => setPayForm({...payForm, month: e.target.value})}
                  >
                    {monthsList.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Salary Amount input (editable for deductions/bonuses) */}
                <div className="grid gap-2">
                  <Label htmlFor="pay-amount">{t("salaryLabel")}</Label>
                  <Input 
                    id="pay-amount" 
                    type="number"
                    value={payForm.amount}
                    onChange={(e) => setPayForm({...payForm, amount: e.target.value})}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {isUrdu ? "* آپ کسی کٹوتی یا بونس کے لیے تنخواہ کی رقم تبدیل کر سکتے ہیں۔" : "* You can adjust the amount for any deductions or bonuses."}
                  </p>
                </div>

                {/* Date select */}
                <div className="grid gap-2">
                  <Label htmlFor="pay-date">{t("date")}</Label>
                  <Input 
                    id="pay-date" 
                    type="date"
                    value={payForm.date}
                    onChange={(e) => setPayForm({...payForm, date: e.target.value})}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isUrdu ? "ادائیگی درج کریں" : "Confirm & Pay"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL: Printable Salary Slip Receipt */}
      {viewingSlip && (
        <Dialog open={isSlipOpen} onOpenChange={setIsSlipOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader className="border-b pb-2">
              <DialogTitle className="text-zinc-800 dark:text-zinc-200">
                {isUrdu ? "سیلری پیمنٹ سلپ" : "Salary Voucher Receipt"}
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              
              {/* Slip Content Container (will be copied to the print popup window) */}
              <div 
                id="salary-slip-print" 
                className="p-6 border rounded-lg bg-white text-black space-y-4 max-w-md mx-auto text-left relative overflow-hidden select-none"
              >
                {/* Subcontinental double border stamp design */}
                <div className="absolute inset-0 border-8 border-double border-zinc-200 pointer-events-none rounded-lg" />
                
                {/* Header */}
                <div className="text-center border-b pb-4 pt-2">
                  <h3 className="font-extrabold text-xl tracking-wide uppercase text-zinc-900">
                    {isUrdu ? "مدرسہ انوار العلوم" : "MADARSA ANWAR-UL-ULOOM"}
                  </h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                    {isUrdu ? "ملتان، پاکستان - سیلری پیمنٹ واؤچر" : "Multan, Pakistan - Salary Payment Voucher"}
                  </p>
                </div>

                {/* Voucher metadata */}
                <div className="grid grid-cols-2 text-xs gap-y-1.5 border-b pb-4 pt-1">
                  <div>
                    <span className="font-semibold text-zinc-400 uppercase">{isUrdu ? "واؤچر نمبر:" : "Voucher ID:"} </span>
                    <span className="font-bold text-zinc-800">{viewingSlip.id}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-zinc-400 uppercase">{isUrdu ? "تاریخ ادائیگی:" : "Paid Date:"} </span>
                    <span className="font-bold text-zinc-800">{viewingSlip.date}</span>
                  </div>
                </div>

                {/* Details layout */}
                <div className="space-y-3 pt-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium">{isUrdu ? "استاد کا نام:" : "Teacher Name:"}</span>
                    <span className="font-bold text-zinc-800">{viewingSlip.teacher}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium">{isUrdu ? "کلاس:" : "Assigned Class:"}</span>
                    <span className="font-semibold text-zinc-800">
                      {teachersList.find(t => t.name === viewingSlip.teacher)?.class || "Hifz 1"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium">{isUrdu ? "تنخواہ برائے مہینہ:" : "Salary Month:"}</span>
                    <span className="font-semibold text-zinc-700">{viewingSlip.month}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium">{isUrdu ? "طریقہ ادائیگی:" : "Payment Mode:"}</span>
                    <span className="font-medium text-zinc-700">{isUrdu ? "نقد رقم (کیش)" : "Cash / In-Hand"}</span>
                  </div>
                </div>

                {/* Amount block */}
                <div className="bg-zinc-50 border p-4 rounded-md text-center my-4">
                  <p className="text-[10px] uppercase text-zinc-400 tracking-wider font-semibold mb-1">
                    {isUrdu ? "کل ادا شدہ رقم" : "Net Paid Amount"}
                  </p>
                  <p className="text-2xl font-black text-emerald-600">
                    Rs {viewingSlip.amount.toLocaleString()}/-
                  </p>
                </div>

                {/* Beautiful Stamp */}
                <div className="flex justify-center items-center py-1">
                  <div className="border-4 border-double border-emerald-500 text-emerald-500 rounded px-4 py-1 text-xs font-black tracking-widest uppercase rotate-[-5deg] select-none">
                    {isUrdu ? "★ ادا شدہ / PAID ★" : "★ PAID / STAMP ★"}
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 pt-6 pb-2 text-[9px] text-zinc-400 border-t gap-x-8">
                  <div className="text-center border-t border-dashed pt-1 font-semibold uppercase">
                    {isUrdu ? "دستخط ایڈمن (مہر)" : "Admin Signature"}
                  </div>
                  <div className="text-center border-t border-dashed pt-1 font-semibold uppercase">
                    {isUrdu ? "دستخط وصول کنندہ" : "Teacher Signature"}
                  </div>
                </div>
              </div>

            </div>

            {/* Print Modal Footer triggers handler */}
            <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
              <Button variant="outline" onClick={() => setIsSlipOpen(false)}>
                {t("cancel")}
              </Button>
              <Button 
                onClick={handlePrintSlip} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Printer className="mr-2 h-4 w-4" />
                {isUrdu ? "رسید پرنٹ کریں" : "Print Voucher"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL: Edit Teacher Details */}
      {editingTeacher && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>{t("editTeacherTitle")}</DialogTitle>
                <DialogDescription>
                  {t("editTeacherDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">{t("teacher")}</Label>
                  <Input 
                    id="edit-name" 
                    value={editingTeacher.name}
                    onChange={(e) => setEditingTeacher({...editingTeacher, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-class">{t("assignedClass")}</Label>
                  <select 
                    id="edit-class"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingTeacher.class}
                    onChange={(e) => setEditingTeacher({...editingTeacher, class: e.target.value})}
                  >
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">{t("phone")}</Label>
                  <Input 
                    id="edit-phone" 
                    value={editingTeacher.phone}
                    onChange={(e) => setEditingTeacher({...editingTeacher, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-salary">{t("salaryLabel")}</Label>
                  <Input 
                    id="edit-salary" 
                    type="number"
                    value={editingTeacher.salary}
                    onChange={(e) => setEditingTeacher({...editingTeacher, salary: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">{t("status")}</Label>
                  <select 
                    id="edit-status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingTeacher.status}
                    onChange={(e) => setEditingTeacher({...editingTeacher, status: e.target.value as any})}
                  >
                    <option value="Active">{t("statusActive")}</option>
                    <option value="On Leave">{isUrdu ? "رخصت پر" : "On Leave"}</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{t("updateRecord")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL: Remove Staff Member (Delete Confirmation) */}
      {deletingTeacher && (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-destructive font-bold">{isUrdu ? "استاد کو خارج کریں" : "Remove Teacher"}</DialogTitle>
              <DialogDescription>
                {t("deleteTeacherDesc", { name: deletingTeacher.name })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t("cancel")}</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>{t("delete")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  )
}
