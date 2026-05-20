"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Wallet, HandCoins, AlertTriangle, FileText, ArrowUpRight, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
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
import { Input } from "@/components/ui/input"
import { 
  useLocalStorage, 
  initialStudents, 
  initialDonations, 
  initialFees, 
  initialExpenses, 
  initialInventory, 
  initialActivities,
  Student,
  Donation,
  FeeRecord,
  Expense,
  InventoryItem,
  Activity
} from "@/lib/store"

export default function DashboardPage() {
  // Local storage lists
  const [studentsList, setStudentsList] = useLocalStorage<Student[]>("madarsa_students", initialStudents)
  const [donationsList, setDonationsList] = useLocalStorage<Donation[]>("madarsa_donations", initialDonations)
  const [feesList, setFeesList] = useLocalStorage<FeeRecord[]>("madarsa_fees", initialFees)
  const [expensesList, setExpensesList] = useLocalStorage<Expense[]>("madarsa_expenses", initialExpenses)
  const [inventoryList, setInventoryList] = useLocalStorage<InventoryItem[]>("madarsa_kitchen", initialInventory)
  const [activitiesList, setActivitiesList] = useLocalStorage<Activity[]>("madarsa_activities", initialActivities)

  // Dialog open states
  const [isStudentOpen, setIsStudentOpen] = useState(false)
  const [isDonationOpen, setIsDonationOpen] = useState(false)
  const [isFeeOpen, setIsFeeOpen] = useState(false)

  // Form states
  const [newStudent, setNewStudent] = useState({
    name: "",
    class: "Hifz Class 1",
    parentName: "",
    phone: "",
  })

  const [newDonation, setNewDonation] = useState({
    donor: "",
    amount: "",
    type: "General",
  })

  const [newFee, setNewFee] = useState({
    student: "",
    amount: "",
    month: "September 2023",
    status: "Paid" as const,
  })

  // Dynamic calculations
  const totalStudents = (studentsList || []).filter(s => s.status === "Active").length
  const totalDonationsSum = (donationsList || []).reduce((sum, d) => sum + d.amount, 0)
  const monthlyExpensesSum = (expensesList || []).reduce((sum, e) => sum + e.amount, 0)
  const pendingFeesSum = (feesList || []).filter(f => f.status === "Pending").reduce((sum, f) => sum + f.amount, 0)
  const lowStockCount = (inventoryList || []).filter(i => i.status === "Low Stock").length
  
  // Hardcoded attendance or calculated based on attendance logs
  const todayAttendanceCount = totalStudents > 0 ? Math.round(totalStudents * 0.94) : 0

  // Chart data formatting
  const chartIncomeVsExpense = [
    { name: "Jan", income: 150000, expense: 40000 },
    { name: "Feb", income: 180000, expense: 45000 },
    { name: "Mar", income: 120000, expense: 38000 },
    { name: "Apr", income: 200000, expense: 50000 },
    { name: "May", income: totalDonationsSum, expense: monthlyExpensesSum },
  ]

  const chartAttendanceTrends = [
    { name: "Mon", present: Math.round(totalStudents * 0.95), absent: Math.round(totalStudents * 0.05) },
    { name: "Tue", present: Math.round(totalStudents * 0.97), absent: Math.round(totalStudents * 0.03) },
    { name: "Wed", present: Math.round(totalStudents * 0.96), absent: Math.round(totalStudents * 0.04) },
    { name: "Thu", present: Math.round(totalStudents * 0.97), absent: Math.round(totalStudents * 0.03) },
    { name: "Fri", present: Math.round(totalStudents * 0.93), absent: Math.round(totalStudents * 0.07) },
    { name: "Sat", present: Math.round(totalStudents * 0.98), absent: Math.round(totalStudents * 0.02) },
    { name: "Sun", present: totalStudents, absent: 0 },
  ]

  // Add Student Handler
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudent.name || !newStudent.parentName || !newStudent.phone) return

    const maxNum = (studentsList || []).reduce((max, s) => {
      const num = parseInt(s.id.replace("STU-", ""), 10)
      return isNaN(num) ? max : Math.max(max, num)
    }, 5)
    const nextId = `STU-${String(maxNum + 1).padStart(3, '0')}`

    const newObj: Student = {
      id: nextId,
      name: newStudent.name,
      class: newStudent.class,
      parentName: newStudent.parentName,
      phone: newStudent.phone,
      status: "Active",
    }

    setStudentsList([newObj, ...studentsList])

    // Add activity log
    const newAct: Activity = {
      id: Date.now(),
      title: "New Student Enrolled",
      description: `${newStudent.name} joined ${newStudent.class}`,
      time: "Just now"
    }
    setActivitiesList([newAct, ...(activitiesList || [])].slice(0, 10))

    setNewStudent({ name: "", class: "Hifz Class 1", parentName: "", phone: "" })
    setIsStudentOpen(false)
  }

  // Add Donation Handler
  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDonation.donor || !newDonation.amount) return

    const maxNum = (donationsList || []).reduce((max, d) => {
      const num = parseInt(d.id.replace("DON-2", ""), 10)
      return isNaN(num) ? max : Math.max(max, num)
    }, 4)
    const nextId = `DON-2${String(maxNum + 1).padStart(2, '0')}`

    const newObj: Donation = {
      id: nextId,
      donor: newDonation.donor,
      amount: parseFloat(newDonation.amount),
      type: newDonation.type,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    }

    setDonationsList([newObj, ...donationsList])

    // Add activity log
    const newAct: Activity = {
      id: Date.now(),
      title: "Donation Received",
      description: `${newDonation.donor} donated Rs ${parseFloat(newDonation.amount).toLocaleString()}`,
      time: "Just now"
    }
    setActivitiesList([newAct, ...(activitiesList || [])].slice(0, 10))

    setNewDonation({ donor: "", amount: "", type: "General" })
    setIsDonationOpen(false)
  }

  // Collect Fee Handler
  const handleFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFee.student || !newFee.amount) return

    const maxNum = (feesList || []).reduce((max, f) => {
      const num = parseInt(f.id.replace("FEE-1", ""), 10)
      return isNaN(num) ? max : Math.max(max, num)
    }, 4)
    const nextId = `FEE-1${String(maxNum + 1).padStart(2, '0')}`

    const newObj: FeeRecord = {
      id: nextId,
      student: newFee.student,
      amount: parseFloat(newFee.amount),
      month: newFee.month,
      status: newFee.status,
      date: newFee.status === "Paid" ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-",
    }

    setFeesList([newObj, ...feesList])

    // Add activity log
    const newAct: Activity = {
      id: Date.now(),
      title: "Fee Collected",
      description: `Collected Rs ${parseFloat(newFee.amount).toLocaleString()} from ${newFee.student}`,
      time: "Just now"
    }
    setActivitiesList([newAct, ...(activitiesList || [])].slice(0, 10))

    setNewFee({ student: "", amount: "", month: "September 2023", status: "Paid" })
    setIsFeeOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">Welcome back. Here's a summary of the madarsa's operations.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          
          {/* Add Student Modal */}
          <Dialog open={isStudentOpen} onOpenChange={setIsStudentOpen}>
            <DialogTrigger render={
              <Button size="sm" className="whitespace-nowrap"><PlusCircle className="mr-2 h-4 w-4" /> Add Student</Button>
            } />
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleStudentSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new student to enroll them.
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

          {/* Add Donation Modal */}
          <Dialog open={isDonationOpen} onOpenChange={setIsDonationOpen}>
            <DialogTrigger render={
              <Button size="sm" variant="secondary" className="whitespace-nowrap"><HandCoins className="mr-2 h-4 w-4" /> Add Donation</Button>
            } />
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleDonationSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Donation</DialogTitle>
                  <DialogDescription>
                    Record a new incoming donation.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="donor">Donor Name</Label>
                    <Input 
                      id="donor" 
                      placeholder="E.g. Haji Abdul Rehman (or Anonymous)" 
                      value={newDonation.donor}
                      onChange={(e) => setNewDonation({...newDonation, donor: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount (Rs)</Label>
                    <Input 
                      id="amount" 
                      type="number"
                      placeholder="E.g. 5000" 
                      value={newDonation.amount}
                      onChange={(e) => setNewDonation({...newDonation, amount: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Donation Type</Label>
                    <select 
                      id="type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newDonation.type}
                      onChange={(e) => setNewDonation({...newDonation, type: e.target.value})}
                    >
                      <option value="General">General</option>
                      <option value="Zakat">Zakat</option>
                      <option value="Sadaqah">Sadaqah</option>
                      <option value="Kitchen Only">Kitchen Only</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Donation</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Collect Fee Modal */}
          <Dialog open={isFeeOpen} onOpenChange={setIsFeeOpen}>
            <DialogTrigger render={
              <Button size="sm" variant="outline" className="whitespace-nowrap"><Wallet className="mr-2 h-4 w-4" /> Collect Fee</Button>
            } />
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleFeeSubmit}>
                <DialogHeader>
                  <DialogTitle>Collect Student Fee</DialogTitle>
                  <DialogDescription>
                    Record a fee payment.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="student-fee">Student Name</Label>
                    <Input 
                      id="student-fee" 
                      placeholder="E.g. Ahmed Raza" 
                      value={newFee.student}
                      onChange={(e) => setNewFee({...newFee, student: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount-fee">Amount (Rs)</Label>
                    <Input 
                      id="amount-fee" 
                      type="number"
                      placeholder="E.g. 2000" 
                      value={newFee.amount}
                      onChange={(e) => setNewFee({...newFee, amount: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="month-fee">Billing Month</Label>
                    <Input 
                      id="month-fee" 
                      placeholder="E.g. Sep 2023" 
                      value={newFee.month}
                      onChange={(e) => setNewFee({...newFee, month: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status-fee">Status</Label>
                    <select 
                      id="status-fee"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newFee.status}
                      onChange={(e) => setNewFee({...newFee, status: e.target.value as any})}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Record</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAttendanceCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donations</CardTitle>
            <HandCoins className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {totalDonationsSum.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <FileText className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {monthlyExpensesSum.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <Wallet className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {pendingFeesSum.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount} Items</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Monthly comparison of all income sources and expenses.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartIncomeVsExpense} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs ${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Side Chart / Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from the madarsa operations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(activitiesList || []).slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Attendance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartAttendanceTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Area type="monotone" dataKey="present" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPresent)" name="Present" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
