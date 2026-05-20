"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, HeartHandshake, Download, Pencil, Trash } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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
import { useLocalStorage, initialDonations, Donation } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"

export default function DonationsPage() {
  const { t, isUrdu } = useLanguage()
  const [donationsList, setDonationsList] = useLocalStorage<Donation[]>("madarsa_donations", initialDonations)
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [newDonation, setNewDonation] = useState({
    donor: "",
    amount: "",
    type: "General",
  })

  const [editingDonation, setEditingDonation] = useState<Donation | null>(null)
  const [deletingDonation, setDeletingDonation] = useState<Donation | null>(null)

  const filteredDonations = (donationsList || []).filter(donation => 
    donation.donor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donation.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donation.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const zakatTotal = (donationsList || []).filter(d => d.type === "Zakat").reduce((sum, d) => sum + d.amount, 0)
  const sadaqahTotal = (donationsList || []).filter(d => d.type === "Sadaqah").reduce((sum, d) => sum + d.amount, 0)
  const kitchenTotal = (donationsList || []).filter(d => d.type === "Kitchen Only").reduce((sum, d) => sum + d.amount, 0)
  const generalTotal = (donationsList || []).filter(d => d.type === "General").reduce((sum, d) => sum + d.amount, 0)

  const handleSubmit = (e: React.FormEvent) => {
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

    // Add to activity list if on dashboard
    try {
      const acts = JSON.parse(window.localStorage.getItem("madarsa_activities") || "[]")
      const newAct = {
        id: Date.now(),
        title: "Donation Received",
        description: `${newDonation.donor} donated Rs ${parseFloat(newDonation.amount).toLocaleString()}`,
        time: "Just now"
      }
      window.localStorage.setItem("madarsa_activities", JSON.stringify([newAct, ...acts].slice(0, 10)))
    } catch(e) {}

    setNewDonation({
      donor: "",
      amount: "",
      type: "General",
    })
    setIsOpen(false)
  }

  const handleEditClick = (donation: Donation) => {
    setEditingDonation(donation)
    setIsEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDonation || !editingDonation.donor || !editingDonation.amount) return

    setDonationsList(donationsList.map(d => d.id === editingDonation.id ? editingDonation : d))
    setIsEditOpen(false)
    setEditingDonation(null)
  }

  const handleDeleteClick = (donation: Donation) => {
    setDeletingDonation(donation)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!deletingDonation) return
    setDonationsList(donationsList.filter(d => d.id !== deletingDonation.id))
    setIsDeleteOpen(false)
    setDeletingDonation(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("donTitle")}</h2>
          <p className="text-muted-foreground">{t("donSubtitle")}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t("addDonation")}
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{t("addDonationTitle")}</DialogTitle>
                <DialogDescription>
                  {t("addDonationDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="donor">{t("donorNameLabel")}</Label>
                  <Input 
                    id="donor" 
                    placeholder="E.g. Haji Abdul Rehman (or Anonymous)" 
                    value={newDonation.donor}
                    onChange={(e) => setNewDonation({...newDonation, donor: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">{t("amountLabel")}</Label>
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
                  <Label htmlFor="type">{t("donationType")}</Label>
                  <select 
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newDonation.type}
                    onChange={(e) => setNewDonation({...newDonation, type: e.target.value})}
                  >
                    <option value="General">{isUrdu ? "جنرل" : "General"}</option>
                    <option value="Zakat">{isUrdu ? "زکوٰۃ" : "Zakat"}</option>
                    <option value="Sadaqah">{isUrdu ? "صدقات" : "Sadaqah"}</option>
                    <option value="Kitchen Only">{isUrdu ? "باورچی خانے کے لیے" : "Kitchen Only"}</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{t("saveDonation")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Donation Modal */}
      {editingDonation && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>{t("editDonationTitle")}</DialogTitle>
                <DialogDescription>
                  {t("editDonationDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-donor">{t("donorNameLabel")}</Label>
                  <Input 
                    id="edit-donor" 
                    value={editingDonation.donor}
                    onChange={(e) => setEditingDonation({...editingDonation, donor: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-amount">{t("amountLabel")}</Label>
                  <Input 
                    id="edit-amount" 
                    type="number"
                    value={editingDonation.amount}
                    onChange={(e) => setEditingDonation({...editingDonation, amount: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">{t("donationType")}</Label>
                  <select 
                    id="edit-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingDonation.type}
                    onChange={(e) => setEditingDonation({...editingDonation, type: e.target.value})}
                  >
                    <option value="General">{isUrdu ? "جنرل" : "General"}</option>
                    <option value="Zakat">{isUrdu ? "زکوٰۃ" : "Zakat"}</option>
                    <option value="Sadaqah">{isUrdu ? "صدقات" : "Sadaqah"}</option>
                    <option value="Kitchen Only">{isUrdu ? "باورچی خانے کے لیے" : "Kitchen Only"}</option>
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
      {deletingDonation && (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-destructive">{t("deleteDonationTitle")}</DialogTitle>
              <DialogDescription>
                {t("deleteDonationDesc", { amount: deletingDonation.amount.toLocaleString(), name: deletingDonation.donor })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t("cancel")}</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>{t("delete")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("totalZakat")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Rs {zakatTotal.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("totalSadaqah")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">Rs {sadaqahTotal.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("kitchenRestricted")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">Rs {kitchenTotal.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("generalFund")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {generalTotal.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>{t("donationRecords")}</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t("searchDonors")} 
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
                  <TableHead>{t("receiptId")}</TableHead>
                  <TableHead>{t("donorNameLabel")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("donationType")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("date")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.length > 0 ? (
                  filteredDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell className="font-medium text-xs">{donation.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <HeartHandshake className="h-4 w-4 text-muted-foreground hidden sm:block" />
                          {donation.donor}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">Rs {donation.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          donation.type === "Zakat" ? "border-primary text-primary" :
                          donation.type === "Sadaqah" ? "border-secondary text-secondary" :
                          donation.type === "Kitchen Only" ? "border-orange-500 text-orange-500" : ""
                        }>
                          {donation.type === "Zakat" ? (isUrdu ? "زکوٰۃ" : "Zakat") :
                           donation.type === "Sadaqah" ? (isUrdu ? "صدقات" : "Sadaqah") :
                           donation.type === "Kitchen Only" ? (isUrdu ? "باورچی خانے کے لیے" : "Kitchen Only") :
                           (isUrdu ? "جنرل" : "General")}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{donation.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(donation)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(donation)} className="text-destructive hover:text-destructive">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No donations found.
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
