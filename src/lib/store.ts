"use client"

import { useState, useEffect } from "react"

// Types
export interface Student {
  id: string
  name: string
  class: string
  parentName: string
  phone: string
  status: "Active" | "Inactive"
}

export interface Donation {
  id: string
  donor: string
  amount: number
  type: string
  date: string
}

export interface FeeRecord {
  id: string
  student: string
  amount: number
  month: string
  status: "Paid" | "Pending"
  date: string
}

export interface Expense {
  id: string
  category: string
  amount: number
  date: string
  recordedBy: string
}

export interface Teacher {
  id: string
  name: string
  class: string
  phone: string
  salary: number
  status: "Active" | "On Leave"
}

export interface SalaryRecord {
  id: string
  teacher: string
  amount: number
  month: string
  status: "Paid" | "Pending"
  date: string
}

export interface InventoryItem {
  id: string
  item: string
  remaining: string // e.g. "45 kg" or "3 Liters"
  numericRemaining: number // for calculations, e.g. 45 or 3
  unit: string // "kg" or "Liters" or "pcs"
  usageToday: string
  numericUsageToday: number
  status: "Good" | "Low Stock"
}

export interface Activity {
  id: number
  title: string
  description: string
  time: string
}

export const availableClasses = [
  "Hifz 1",
  "Hifz 2",
  "Hifz 3",
  "Nazra 1",
  "Nazra 2",
  "Nazra 3",
  "Aalim"
]

// Initial Data
export const initialStudents: Student[] = [
  { id: "STU-001", name: "Ahmed Raza", class: "Hifz 1", parentName: "Muhammad Ali", phone: "0300-1234567", status: "Active" },
  { id: "STU-002", name: "Bilal Khan", class: "Nazra 1", parentName: "Tariq Khan", phone: "0311-9876543", status: "Active" },
  { id: "STU-003", name: "Omar Farooq", class: "Aalim", parentName: "Usman Farooq", phone: "0322-4567890", status: "Inactive" },
  { id: "STU-004", name: "Zaid Abdullah", class: "Hifz 2", parentName: "Abdullah", phone: "0333-1122334", status: "Active" },
  { id: "STU-005", name: "Hassan Ali", class: "Nazra 2", parentName: "Ali Reza", phone: "0344-5566778", status: "Active" },
]

export const initialDonations: Donation[] = [
  { id: "DON-201", donor: "Haji Abdul Rehman", amount: 50000, type: "Zakat", date: "15 Sep 2023" },
  { id: "DON-202", donor: "Anonymous", amount: 5000, type: "Sadaqah", date: "12 Sep 2023" },
  { id: "DON-203", donor: "Muhammad Usman", amount: 10000, type: "Kitchen Only", date: "10 Sep 2023" },
  { id: "DON-204", donor: "Tariq Jamil", amount: 25000, type: "General", date: "05 Sep 2023" },
]

export const initialFees: FeeRecord[] = [
  { id: "FEE-101", student: "Ahmed Raza", amount: 2000, month: "Sep 2023", status: "Paid", date: "05 Sep 2023" },
  { id: "FEE-102", student: "Bilal Khan", amount: 2000, month: "Sep 2023", status: "Pending", date: "-" },
  { id: "FEE-103", student: "Omar Farooq", amount: 1500, month: "Sep 2023", status: "Paid", date: "01 Sep 2023" },
  { id: "FEE-104", student: "Zaid Abdullah", amount: 2000, month: "Sep 2023", status: "Pending", date: "-" },
]

export const initialExpenses: Expense[] = [
  { id: "EXP-301", category: "Electricity", amount: 15000, date: "18 Sep 2023", recordedBy: "Admin" },
  { id: "EXP-302", category: "Kitchen", amount: 8500, date: "16 Sep 2023", recordedBy: "Qari Sahab" },
  { id: "EXP-303", category: "Internet", amount: 2000, date: "15 Sep 2023", recordedBy: "Admin" },
  { id: "EXP-304", category: "Repairs", amount: 4500, date: "10 Sep 2023", recordedBy: "Admin" },
]

export const initialTeachers: Teacher[] = [
  { id: "TCH-001", name: "Qari Tariq", class: "Hifz 1", phone: "0300-1112223", salary: 25000, status: "Active" },
  { id: "TCH-002", name: "Maulana Usman", class: "Aalim", phone: "0311-4445556", salary: 35000, status: "Active" },
  { id: "TCH-003", name: "Hafiz Bilal", class: "Nazra 1", phone: "0322-7778889", salary: 20000, status: "On Leave" },
]

export const initialSalaries: SalaryRecord[] = [
  { id: "SAL-101", teacher: "Qari Tariq", amount: 25000, month: "Sep 2023", status: "Paid", date: "02 Sep 2023" },
  { id: "SAL-102", teacher: "Maulana Usman", amount: 35000, month: "Sep 2023", status: "Paid", date: "02 Sep 2023" },
  { id: "SAL-103", teacher: "Hafiz Bilal", amount: 20000, month: "Sep 2023", status: "Pending", date: "-" },
]

export const initialInventory: InventoryItem[] = [
  { id: "INV-001", item: "Rice", remaining: "45 kg", numericRemaining: 45, unit: "kg", usageToday: "5 kg", numericUsageToday: 5, status: "Good" },
  { id: "INV-002", item: "Flour (Aata)", remaining: "8 kg", numericRemaining: 8, unit: "kg", usageToday: "10 kg", numericUsageToday: 10, status: "Low Stock" },
  { id: "INV-003", item: "Sugar", remaining: "20 kg", numericRemaining: 20, unit: "kg", usageToday: "2 kg", numericUsageToday: 2, status: "Good" },
  { id: "INV-004", item: "Cooking Oil", remaining: "3 Liters", numericRemaining: 3, unit: "Liters", usageToday: "1 Liter", numericUsageToday: 1, status: "Low Stock" },
  { id: "INV-005", item: "Lentils (Daal)", remaining: "15 kg", numericRemaining: 15, unit: "kg", usageToday: "2 kg", numericUsageToday: 2, status: "Good" },
]

export const initialActivities: Activity[] = [
  { id: 1, title: "Fee Collected", description: "Ahmed paid Rs 2,000", time: "10 min ago" },
  { id: 2, title: "Donation Received", description: "Anonymous donated Rs 10,000 for Kitchen", time: "1 hr ago" },
  { id: 3, title: "Low Stock Alert", description: "Rice stock is below 10 kg", time: "3 hrs ago" },
  { id: 4, title: "Teacher Leave", description: "Qari Sahab is on leave today", time: "5 hrs ago" },
]

// React Hook for Local Storage with SSR safety
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error("Local storage error:", error)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error("Local storage set error:", error)
    }
  }

  return [storedValue, setValue, isMounted] as const
}
