"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, ReceiptText, Phone, Pencil, Trash, Check } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { useLocalStorage, initialFees, FeeRecord } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"

export default function FeesPage() {
  const { t } = useLanguage()
  const [feesList, setFeesList] = useLocalStorage<FeeRecord[]>("madarsa_fees", initialFees)
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [newFee, setNewFee] = useState({
    student: "",
    amount: "",
    month: "September 2023",
    status: "Paid" as const,
  })

  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null)
  const [deletingFee, setDeletingFee] = useState<FeeRecord | null>(null)

  const filteredFees = (feesList || []).filter(record => 
    record.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.month.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const collectedThisMonth = (feesList || [])
    .filter(f => f.status === "Paid")
    .reduce((sum, f) => sum + f.amount, 0)

  const pendingDues = (feesList || [])
    .filter(f => f.status === "Pending")
    .reduce((sum, f) => sum + f.amount, 0)

  const totalStudentsWithFees = (feesList || []).length

  const handleSubmit = (e: React.FormEvent) => {
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

    // Add to activity list if on dashboard
    try {
      const acts = JSON.parse(window.localStorage.getItem("madarsa_activities") || "[]")
      const newAct = {
        id: Date.now(),
        title: "Fee Collected",
        description: `${newFee.student} paid Rs ${parseFloat(newFee.amount).toLocaleString()}`,
        time: "Just now"
      }
      window.localStorage.setItem("madarsa_activities", JSON.stringify([newAct, ...acts].slice(0, 10)))
    } catch(e) {}

    setNewFee({
      student: "",
      amount: "",
      month: "September 2023",
      status: "Paid",
    })
    setIsOpen(false)
  }

  const handleEditClick = (record: FeeRecord) => {
    setEditingFee(record)
    setIsEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFee || !editingFee.student || !editingFee.amount) return

    const updatedFee: FeeRecord = {
      ...editingFee,
      date: editingFee.status === "Paid" && editingFee.date === "-" ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (editingFee.status === "Pending" ? "-" : editingFee.date),
    }

    setFeesList(feesList.map(f => f.id === editingFee.id ? updatedFee : f))
    setIsEditOpen(false)
    setEditingFee(null)
  }

  const handleDeleteClick = (record: FeeRecord) => {
    setDeletingFee(record)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!deletingFee) return
    setFeesList(feesList.filter(f => f.id !== deletingFee.id))
    setIsDeleteOpen(false)
    setDeletingFee(null)
  }

  const toggleStatus = (record: FeeRecord) => {
    const updatedStatus = record.status === "Paid" ? "Pending" as const : "Paid" as const
    const updatedDate = updatedStatus === "Paid" ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"
    setFeesList(feesList.map(f => f.id === record.id ? { ...f, status: updatedStatus, date: updatedDate } : f))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("feesTitle")}</h2>
          <p className="text-muted-foreground">{t("feesSubtitle")}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t("collectFee")}
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{t("collectStudentFee")}</DialogTitle>
                <DialogDescription>
                  {t("collectStudentFeeDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="student">{t("fullName")}</Label>
                  <Input 
                    id="student" 
                    placeholder="E.g. Ahmed Raza" 
                    value={newFee.student}
                    onChange={(e) => setNewFee({...newFee, student: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">{t("amountLabel")}</Label>
                  <Input 
                    id="amount" 
                    type="number"
                    placeholder="E.g. 2000" 
                    value={newFee.amount}
                    onChange={(e) => setNewFee({...newFee, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="month">{t("billingMonth")}</Label>
                  <Input 
                    id="month" 
                    placeholder="E.g. Sep 2023" 
                    value={newFee.month}
                    onChange={(e) => setNewFee({...newFee, month: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">{t("status")}</Label>
                  <select 
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newFee.status}
                    onChange={(e) => setNewFee({...newFee, status: e.target.value as any})}
                  >
                    <option value="Paid">{t("paid")}</option>
                    <option value="Pending">{t("pending")}</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{t("saveRecord")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Fee Modal */}
      {editingFee && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>{t("editFeeTitle")}</DialogTitle>
                <DialogDescription>
                  {t("editFeeDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-student">{t("fullName")}</Label>
                  <Input 
                    id="edit-student" 
                    value={editingFee.student}
                    onChange={(e) => setEditingFee({...editingFee, student: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-amount">{t("amountLabel")}</Label>
                  <Input 
                    id="edit-amount" 
                    type="number"
                    value={editingFee.amount}
                    onChange={(e) => setEditingFee({...editingFee, amount: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-month">{t("billingMonth")}</Label>
                  <Input 
                    id="edit-month" 
                    value={editingFee.month}
                    onChange={(e) => setEditingFee({...editingFee, month: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">{t("status")}</Label>
                  <select 
                    id="edit-status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingFee.status}
                    onChange={(e) => setEditingFee({...editingFee, status: e.target.value as any})}
                  >
                    <option value="Paid">{t("paid")}</option>
                    <option value="Pending">{t("pending")}</option>
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

      {/* Delete Confirmation Modal */}
      {deletingFee && (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-destructive">{t("deleteFeeTitle")}</DialogTitle>
              <DialogDescription>
                {t("deleteFeeDesc", { amount: deletingFee.amount.toLocaleString(), name: deletingFee.student })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t("cancel")}</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>{t("delete")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("collectedThisMonth")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Rs {collectedThisMonth.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("pendingDues")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">Rs {pendingDues.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("totalPaidRecords")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudentsWithFees}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>{t("recentFeeRecords")}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t("searchRecords")} 
                  className="pl-8" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("receipt")}</TableHead>
                  <TableHead>{t("student")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("billingMonth")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.length > 0 ? (
                  filteredFees.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium text-xs">{record.id}</TableCell>
                      <TableCell>{record.student}</TableCell>
                      <TableCell className="font-semibold">Rs {record.amount.toLocaleString()}</TableCell>
                      <TableCell className="hidden md:table-cell">{record.month}</TableCell>
                      <TableCell>
                        <button 
                          onClick={() => toggleStatus(record)}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${
                            record.status === "Paid" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                          }`}
                        >
                          {record.status === "Paid" && <Check className="h-3 w-3 mr-1" />}
                          {record.status === "Paid" ? t("paid") : t("pending")}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                          {record.status === "Paid" ? (
                            <Button variant="outline" size="sm" className="h-8">
                              <ReceiptText className="h-4 w-4 md:mr-1" />
                              <span className="hidden md:inline text-xs">{t("receipt")}</span>
                            </Button>
                          ) : (
                            <Button size="sm" variant="secondary" className="h-8">
                              <Phone className="h-4 w-4 md:mr-1" />
                              <span className="hidden md:inline text-xs">{t("remind")}</span>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(record)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(record)} className="text-destructive hover:text-destructive">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No records found.
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
