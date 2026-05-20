"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Receipt, Pencil, Trash } from "lucide-react"
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
import { useLocalStorage, initialExpenses, Expense } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"

export default function ExpensesPage() {
  const { t, isUrdu } = useLanguage()
  const [expensesList, setExpensesList] = useLocalStorage<Expense[]>("madarsa_expenses", initialExpenses)
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [newExpense, setNewExpense] = useState({
    category: "",
    amount: "",
    recordedBy: "Admin",
  })

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null)

  const filteredExpenses = (expensesList || []).filter(expense => 
    expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.recordedBy.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalExpenses = (expensesList || []).reduce((sum, e) => sum + e.amount, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExpense.category || !newExpense.amount) return

    const maxNum = (expensesList || []).reduce((max, exp) => {
      const num = parseInt(exp.id.replace("EXP-3", ""), 10)
      return isNaN(num) ? max : Math.max(max, num)
    }, 4)

    const nextId = `EXP-3${String(maxNum + 1).padStart(2, '0')}`

    const newObj: Expense = {
      id: nextId,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      recordedBy: newExpense.recordedBy,
    }

    setExpensesList([newObj, ...expensesList])

    // Add to activity list if on dashboard
    try {
      const acts = JSON.parse(window.localStorage.getItem("madarsa_activities") || "[]")
      const newAct = {
        id: Date.now(),
        title: "Expense Logged",
        description: `Spent Rs ${parseFloat(newExpense.amount).toLocaleString()} on ${newExpense.category}`,
        time: "Just now"
      }
      window.localStorage.setItem("madarsa_activities", JSON.stringify([newAct, ...acts].slice(0, 10)))
    } catch(e) {}

    setNewExpense({
      category: "",
      amount: "",
      recordedBy: "Admin",
    })
    setIsOpen(false)
  }

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense)
    setIsEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExpense || !editingExpense.category || !editingExpense.amount) return

    setExpensesList(expensesList.map(e => e.id === editingExpense.id ? editingExpense : e))
    setIsEditOpen(false)
    setEditingExpense(null)
  }

  const handleDeleteClick = (expense: Expense) => {
    setDeletingExpense(expense)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!deletingExpense) return
    setExpensesList(expensesList.filter(e => e.id !== deletingExpense.id))
    setIsDeleteOpen(false)
    setDeletingExpense(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("expTitle")}</h2>
          <p className="text-muted-foreground">{t("expSubtitle")}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t("addExpenseBtn")}
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{t("addExpenseTitle")}</DialogTitle>
                <DialogDescription>
                  {t("addExpenseDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">{t("categoryItem")}</Label>
                  <Input 
                    id="category" 
                    placeholder="E.g. Electricity, Kitchen groceries, Internet" 
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">{t("amountLabel")}</Label>
                  <Input 
                    id="amount" 
                    type="number"
                    placeholder="E.g. 15000" 
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recordedBy">{t("recordedByLabel")}</Label>
                  <select 
                    id="recordedBy"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newExpense.recordedBy}
                    onChange={(e) => setNewExpense({...newExpense, recordedBy: e.target.value})}
                  >
                    <option value="Admin">{isUrdu ? "ایڈمن" : "Admin"}</option>
                    <option value="Qari Sahab">{isUrdu ? "قاری صاحب" : "Qari Sahab"}</option>
                    <option value="Accountant">{isUrdu ? "اکاؤنٹنٹ" : "Accountant"}</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{t("saveExpense")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>{t("editExpenseTitle")}</DialogTitle>
                <DialogDescription>
                  {t("editExpenseDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">{t("categoryItem")}</Label>
                  <Input 
                    id="edit-category" 
                    value={editingExpense.category}
                    onChange={(e) => setEditingExpense({...editingExpense, category: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-amount">{t("amountLabel")}</Label>
                  <Input 
                    id="edit-amount" 
                    type="number"
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({...editingExpense, amount: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-recordedBy">{t("recordedByLabel")}</Label>
                  <select 
                    id="edit-recordedBy"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingExpense.recordedBy}
                    onChange={(e) => setEditingExpense({...editingExpense, recordedBy: e.target.value})}
                  >
                    <option value="Admin">{isUrdu ? "ایڈمن" : "Admin"}</option>
                    <option value="Qari Sahab">{isUrdu ? "قاری صاحب" : "Qari Sahab"}</option>
                    <option value="Accountant">{isUrdu ? "اکاؤنٹنٹ" : "Accountant"}</option>
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
      {deletingExpense && (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[400px]">
             <DialogHeader>
               <DialogTitle className="text-destructive">{t("deleteExpenseTitle")}</DialogTitle>
               <DialogDescription>
                 {t("deleteExpenseDesc", { amount: deletingExpense.amount.toLocaleString(), category: deletingExpense.category })}
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
             <CardTitle className="text-sm font-medium">{t("totalMonthlyExpenses")}</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-destructive">Rs {totalExpenses.toLocaleString()}</div>
           </CardContent>
         </Card>
       </div>

      <Card>
         <CardHeader className="pb-3">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <CardTitle>{t("expenseRecords")}</CardTitle>
             <div className="relative w-full md:w-64">
               <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input 
                 placeholder={t("searchExpenses")} 
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
                  <TableHead>{t("stuId")}</TableHead>
                  <TableHead>{t("categoryItem")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("date")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("recordedBy")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium text-xs">{expense.id}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell className="font-semibold">Rs {expense.amount.toLocaleString()}</TableCell>
                      <TableCell className="hidden md:table-cell">{expense.date}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                      {expense.recordedBy === "Admin" ? (isUrdu ? "ایڈمن" : "Admin") :
                       expense.recordedBy === "Qari Sahab" ? (isUrdu ? "قاری صاحب" : "Qari Sahab") :
                       expense.recordedBy === "Accountant" ? (isUrdu ? "اکاؤنٹنٹ" : "Accountant") :
                       expense.recordedBy}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm" className="h-8">
                          <Receipt className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline text-xs">{isUrdu ? "بل" : "Bill"}</span>
                        </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(expense)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(expense)} className="text-destructive hover:text-destructive">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No expenses found.
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
