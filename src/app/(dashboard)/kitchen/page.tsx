"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Utensils, AlertTriangle, Pencil, Trash, Flame } from "lucide-react"
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
import { useLocalStorage, initialInventory, InventoryItem } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"

export default function KitchenPage() {
  const { t, isUrdu } = useLanguage()
  const [inventoryList, setInventoryList] = useLocalStorage<InventoryItem[]>("madarsa_kitchen", initialInventory)

  const formatUnitValue = (valStr: string) => {
    if (!valStr) return "";
    if (!isUrdu) return valStr;
    return valStr
      .replace("kg", "کلو گرام")
      .replace("Liters", "لیٹر")
      .replace("pcs", "عدد");
  }
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isUsageOpen, setIsUsageOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Modals forms states
  const [newItem, setNewItem] = useState({
    item: "",
    remaining: "",
    unit: "kg",
  })
  
  const [selectedUsageItem, setSelectedUsageItem] = useState<InventoryItem | null>(null)
  const [usageAmount, setUsageAmount] = useState("")

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null)

  const filteredInventory = (inventoryList || []).filter(item => 
    item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalItemsMonitored = (inventoryList || []).length
  const lowStockAlerts = (inventoryList || []).filter(item => item.status === "Low Stock").length
  
  // Calculate a mock grocery expense
  const groceryExpense = 28000 + ((inventoryList || []).length - 5) * 4000

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.item || !newItem.remaining) return

    const quantity = parseFloat(newItem.remaining)
    if (isNaN(quantity)) return

    // Check if item already exists
    const existingIndex = (inventoryList || []).findIndex(
      i => i.item.toLowerCase() === newItem.item.toLowerCase()
    )

    if (existingIndex > -1) {
      // Top up existing item
      const updatedList = [...inventoryList]
      const current = updatedList[existingIndex]
      const newRemaining = current.numericRemaining + quantity
      current.numericRemaining = newRemaining
      current.remaining = `${newRemaining} ${current.unit}`
      current.status = newRemaining < 10 ? "Low Stock" : "Good"
      setInventoryList(updatedList)
    } else {
      // Add new item
      const maxNum = (inventoryList || []).reduce((max, i) => {
        const num = parseInt(i.id.replace("INV-", ""), 10)
        return isNaN(num) ? max : Math.max(max, num)
      }, 5)

      const nextId = `INV-${String(maxNum + 1).padStart(3, '0')}`
      const newItemObj: InventoryItem = {
        id: nextId,
        item: newItem.item,
        remaining: `${quantity} ${newItem.unit}`,
        numericRemaining: quantity,
        unit: newItem.unit,
        usageToday: `0 ${newItem.unit}`,
        numericUsageToday: 0,
        status: quantity < 10 ? "Low Stock" : "Good"
      }
      setInventoryList([...inventoryList, newItemObj])
    }

    setNewItem({
      item: "",
      remaining: "",
      unit: "kg",
    })
    setIsOpen(false)
  }

  const handleRecordUsageClick = (item: InventoryItem) => {
    setSelectedUsageItem(item)
    setUsageAmount("")
    setIsUsageOpen(true)
  }

  const handleRecordUsageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUsageItem || !usageAmount) return

    const quantityUsed = parseFloat(usageAmount)
    if (isNaN(quantityUsed) || quantityUsed <= 0) return

    const updatedList = inventoryList.map(item => {
      if (item.id === selectedUsageItem.id) {
        const newRemaining = Math.max(0, item.numericRemaining - quantityUsed)
        const newUsage = item.numericUsageToday + quantityUsed
        return {
          ...item,
          numericRemaining: newRemaining,
          remaining: `${newRemaining} ${item.unit}`,
          numericUsageToday: newUsage,
          usageToday: `${newUsage} ${item.unit}`,
          status: newRemaining < 10 ? "Low Stock" as const : "Good" as const
        }
      }
      return item
    })

    setInventoryList(updatedList)
    setIsUsageOpen(false)
    setSelectedUsageItem(null)
  }

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item)
    setIsEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editingItem.item || isNaN(editingItem.numericRemaining)) return

    const updatedItem: InventoryItem = {
      ...editingItem,
      remaining: `${editingItem.numericRemaining} ${editingItem.unit}`,
      status: editingItem.numericRemaining < 10 ? "Low Stock" as const : "Good" as const
    }

    setInventoryList(inventoryList.map(i => i.id === editingItem.id ? updatedItem : i))
    setIsEditOpen(false)
    setEditingItem(null)
  }

  const handleDeleteClick = (item: InventoryItem) => {
    setDeletingItem(item)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!deletingItem) return
    setInventoryList(inventoryList.filter(i => i.id !== deletingItem.id))
    setIsDeleteOpen(false)
    setDeletingItem(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("kitTitle")}</h2>
          <p className="text-muted-foreground">{t("kitSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">{t("usageHistory")}</Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={
              <Button>
                <Plus className="mr-2 h-4 w-4" /> {t("addStock")}
              </Button>
            } />
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAddStockSubmit}>
                <DialogHeader>
                  <DialogTitle>{t("addStock")}</DialogTitle>
                  <DialogDescription>
                    {isUrdu ? "انوینٹری میں نیا راشن شامل کریں یا موجودہ اسٹاک میں اضافہ کریں۔" : "Add a new item or replenish existing items in the inventory."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="item">{t("itemName")}</Label>
                    <Input 
                      id="item" 
                      placeholder="E.g. Rice, Sugar, Cooking Oil" 
                      value={newItem.item}
                      onChange={(e) => setNewItem({...newItem, item: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="remaining">{t("quantityToAdd")}</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="remaining" 
                        type="number"
                        placeholder="E.g. 10" 
                        value={newItem.remaining}
                        onChange={(e) => setNewItem({...newItem, remaining: e.target.value})}
                        required
                        className="flex-1"
                      />
                      <select 
                        id="unit"
                        className="w-[100px] flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newItem.unit}
                        onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                      >
                        <option value="kg">{isUrdu ? "کلو" : "kg"}</option>
                        <option value="Liters">{isUrdu ? "لیٹر" : "Liters"}</option>
                        <option value="pcs">{isUrdu ? "عدد" : "pcs"}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{t("saveStock")}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Record Usage Modal */}
      {selectedUsageItem && (
        <Dialog open={isUsageOpen} onOpenChange={setIsUsageOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleRecordUsageSubmit}>
              <DialogHeader>
                <DialogTitle>{t("recordUsage")} - {selectedUsageItem.item}</DialogTitle>
                <DialogDescription>
                  {t("recordUsageDesc", { stock: formatUnitValue(selectedUsageItem.remaining) })}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="usage-amount">{t("quantityUsed")} ({formatUnitValue(selectedUsageItem.unit)})</Label>
                  <Input 
                    id="usage-amount" 
                    type="number"
                    step="any"
                    placeholder={`E.g. 5`} 
                    value={usageAmount}
                    onChange={(e) => setUsageAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Flame className="mr-2 h-4 w-4" /> {t("consumeStock")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Inventory Modal */}
      {editingItem && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>{t("editInventoryTitle")}</DialogTitle>
                <DialogDescription>
                  {t("editInventoryDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-item">{t("itemName")}</Label>
                  <Input 
                    id="edit-item" 
                    value={editingItem.item}
                    onChange={(e) => setEditingItem({...editingItem, item: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-quantity">{t("currentQuantity")}</Label>
                  <Input 
                    id="edit-quantity" 
                    type="number"
                    value={editingItem.numericRemaining}
                    onChange={(e) => setEditingItem({...editingItem, numericRemaining: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-unit">{t("unit")}</Label>
                  <select 
                    id="edit-unit"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({...editingItem, unit: e.target.value})}
                  >
                    <option value="kg">{isUrdu ? "کلو" : "kg"}</option>
                    <option value="Liters">{isUrdu ? "لیٹر" : "Liters"}</option>
                    <option value="pcs">{isUrdu ? "عدد" : "pcs"}</option>
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
      {deletingItem && (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-destructive">{t("deleteInventoryTitle")}</DialogTitle>
              <DialogDescription>
                {t("deleteInventoryDesc", { item: deletingItem.item })}
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
            <CardTitle className="text-sm font-medium">{t("totItemsMonitored")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItemsMonitored}</div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> {t("lowStockAlerts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockAlerts} {isUrdu ? "اشیاء" : "Items"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("estMonthlyGrocery")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {groceryExpense.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>{t("currentInventory")}</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t("searchItems")} 
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
                  <TableHead>{t("itemName")}</TableHead>
                  <TableHead>{t("remaining")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("usageToday")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium">
                          <Utensils className="h-4 w-4 text-muted-foreground hidden sm:block" />
                          {item.item}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatUnitValue(item.remaining)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatUnitValue(item.usageToday)}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "Low Stock" ? "destructive" : "secondary"}>
                          {item.status === "Low Stock" ? (isUrdu ? "کم اسٹاک" : "Low Stock") : (isUrdu ? "بہتر" : "Good")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleRecordUsageClick(item)} className="h-8 text-xs">
                            {t("recordUsage")}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(item)} className="text-destructive hover:text-destructive">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No stock items found.
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
