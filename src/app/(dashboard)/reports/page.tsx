"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, TrendingUp, Users, Wallet, Printer } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import {
  useLocalStorage,
  initialStudents,
  initialDonations,
  initialFees,
  initialExpenses,
  initialTeachers,
  Student,
  Donation,
  FeeRecord,
  Expense,
  Teacher
} from "@/lib/store"

export default function ReportsPage() {
  const { language } = useLanguage()
  const isUrdu = language === "ur"
  const [mounted, setMounted] = useState(false)

  // Local Storage Data
  const [studentsList] = useLocalStorage<Student[]>("madarsa_students", initialStudents)
  const [donationsList] = useLocalStorage<Donation[]>("madarsa_donations", initialDonations)
  const [feesList] = useLocalStorage<FeeRecord[]>("madarsa_fees", initialFees)
  const [expensesList] = useLocalStorage<Expense[]>("madarsa_expenses", initialExpenses)
  const [teachersList] = useLocalStorage<Teacher[]>("madarsa_teachers", initialTeachers)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // --- Dynamic Calculations ---
  // Fees
  const feesPaidSum = (feesList || []).filter(f => f.status === "Paid").reduce((sum, f) => sum + f.amount, 0)
  const feesPendingSum = (feesList || []).filter(f => f.status === "Pending").reduce((sum, f) => sum + f.amount, 0)
  
  // Donations
  const totalDonations = (donationsList || []).reduce((sum, d) => sum + d.amount, 0)
  const zakatSum = (donationsList || []).filter(d => d.type === "Zakat").reduce((sum, d) => sum + d.amount, 0)
  const sadaqahSum = (donationsList || []).filter(d => d.type === "Sadaqah").reduce((sum, d) => sum + d.amount, 0)
  const kitchenSum = (donationsList || []).filter(d => d.type === "Kitchen Only").reduce((sum, d) => sum + d.amount, 0)
  const generalSum = (donationsList || []).filter(d => d.type === "General").reduce((sum, d) => sum + d.amount, 0)

  // Expenses
  const expensesSum = (expensesList || []).reduce((sum, e) => sum + e.amount, 0)
  const teacherSalariesSum = (teachersList || []).filter(t => t.status === "Active").reduce((sum, t) => sum + t.salary, 0)

  // Net Cash flow
  const totalIncome = feesPaidSum + totalDonations
  const totalExpenditure = expensesSum + teacherSalariesSum
  const netBalance = totalIncome - totalExpenditure

  // --- CSV Exporters ---
  const handleDownloadFinancialCSV = () => {
    let csv = "Financial Report - Madarsa Management System\n"
    csv += `Date Generated: ${new Date().toLocaleDateString()}\n\n`
    csv += "--- SUMMARY ---\n"
    csv += `Total Income,Rs ${totalIncome}\n`
    csv += `Fees Collected,Rs ${feesPaidSum}\n`
    csv += `Donations Received,Rs ${totalDonations}\n`
    csv += `Total Expenditures,Rs ${totalExpenditure}\n`
    csv += `General Expenses,Rs ${expensesSum}\n`
    csv += `Teacher Salaries,Rs ${teacherSalariesSum}\n`
    csv += `Net Balance,Rs ${netBalance}\n`
    csv += `Outstanding/Pending Fees,Rs ${feesPendingSum}\n\n`

    csv += "--- EXPENSE BREAKDOWN ---\n"
    csv += "ID,Category/Item,Amount (Rs),Date,Recorded By\n"
    expensesList.forEach(e => {
      csv += `${e.id},"${e.category}",${e.amount},${e.date},"${e.recordedBy}"\n`
    });
    csv += "\n"

    csv += "--- FEES COLLECTION ROSTER ---\n"
    csv += "ID,Student Name,Amount (Rs),Billing Month,Status,Payment Date\n"
    feesList.forEach(f => {
      csv += `${f.id},"${f.student}",${f.amount},"${f.month}",${f.status},"${f.date}"\n`
    });

    downloadCSV(isUrdu ? "مالیاتی_رپورٹ.csv" : "financial_report.csv", csv)
  }

  const handleDownloadAttendanceCSV = () => {
    let csv = "Student Roster & Attendance Summary\n"
    csv += `Date Generated: ${new Date().toLocaleDateString()}\n\n`
    csv += "Student ID,Name,Class,Parent Name,Contact Phone,Status\n"
    
    studentsList.forEach(s => {
      csv += `${s.id},"${s.name}","${s.class}","${s.parentName}","${s.phone}",${s.status}\n`
    })

    downloadCSV(isUrdu ? "حاضری_رپورٹ.csv" : "attendance_report.csv", csv)
  }

  const handleDownloadDonationsCSV = () => {
    let csv = "Donations Detailed Breakdown\n"
    csv += `Date Generated: ${new Date().toLocaleDateString()}\n\n`
    csv += "--- SUMMARY BY TYPE ---\n"
    csv += `Total Donations,Rs ${totalDonations}\n`
    csv += `Zakat,Rs ${zakatSum}\n`
    csv += `Sadaqah,Rs ${sadaqahSum}\n`
    csv += `Kitchen Restricted,Rs ${kitchenSum}\n`
    csv += `General Fund,Rs ${generalSum}\n\n`

    csv += "--- DONATION RECORDS ---\n"
    csv += "Receipt ID,Donor Name,Amount (Rs),Donation Type,Date Received\n"
    donationsList.forEach(d => {
      csv += `${d.id},"${d.donor}",${d.amount},"${d.type}","${d.date}"\n`
    })

    downloadCSV(isUrdu ? "عطیات_رپورٹ.csv" : "donations_report.csv", csv)
  }

  const downloadCSV = (filename: string, csvContent: string) => {
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // --- Beautiful HTML Print-Preview Windows ---
  const handlePrintFinancialReport = () => {
    const summaryHtml = `
      <div class="summary-grid" dir="${isUrdu ? 'rtl' : 'ltr'}">
        <div class="summary-card">
          <div class="summary-label">${isUrdu ? "کل آمدنی" : "Total Income"}</div>
          <div class="summary-value" style="color: #137333;">Rs ${totalIncome}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">${isUrdu ? "کل اخراجات" : "Total Expenditures"}</div>
          <div class="summary-value" style="color: #c5221f;">Rs ${totalExpenditure}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">${isUrdu ? "بچت / خالص بیلنس" : "Net Balance"}</div>
          <div class="summary-value" style="color: ${netBalance >= 0 ? '#137333' : '#c5221f'};">Rs ${netBalance}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">${isUrdu ? "بقایا فیس" : "Pending Fees"}</div>
          <div class="summary-value" style="color: #b06000;">Rs ${feesPendingSum}</div>
        </div>
      </div>
    `

    const contentHtml = `
      <h2 style="margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 8px;" dir="${isUrdu ? 'rtl' : 'ltr'}">
        ${isUrdu ? "اخراجات کی تفصیل" : "Expenses Log"}
      </h2>
      <table dir="${isUrdu ? 'rtl' : 'ltr'}">
        <thead>
          <tr>
            <th>${isUrdu ? "آئی ڈی" : "ID"}</th>
            <th>${isUrdu ? "شعبہ / آئٹم" : "Category/Item"}</th>
            <th>${isUrdu ? "رقم" : "Amount"}</th>
            <th>${isUrdu ? "تاریخ" : "Date"}</th>
            <th>${isUrdu ? "درج کنندہ" : "Recorded By"}</th>
          </tr>
        </thead>
        <tbody>
          ${expensesList.map(e => `
            <tr>
              <td>${e.id}</td>
              <td>${e.category}</td>
              <td>Rs ${e.amount}</td>
              <td>${e.date}</td>
              <td>${e.recordedBy}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2 style="margin-top: 40px; border-bottom: 1px solid #eee; padding-bottom: 8px;" dir="${isUrdu ? 'rtl' : 'ltr'}">
        ${isUrdu ? "فیس وصولی ریکارڈ" : "Fees Collection Register"}
      </h2>
      <table dir="${isUrdu ? 'rtl' : 'ltr'}">
        <thead>
          <tr>
            <th>${isUrdu ? "رسید" : "Receipt"}</th>
            <th>${isUrdu ? "طالب علم" : "Student"}</th>
            <th>${isUrdu ? "رقم" : "Amount"}</th>
            <th>${isUrdu ? "مہینہ" : "Month"}</th>
            <th>${isUrdu ? "حالت" : "Status"}</th>
          </tr>
        </thead>
        <tbody>
          ${feesList.map(f => `
            <tr>
              <td>${f.id}</td>
              <td>${f.student}</td>
              <td>Rs ${f.amount}</td>
              <td>${f.month}</td>
              <td>
                <span class="badge ${f.status === 'Paid' ? 'badge-paid' : 'badge-pending'}">
                  ${isUrdu ? (f.status === 'Paid' ? 'ادا شدہ' : 'بقایا') : f.status}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `

    triggerPrintPopup(
      isUrdu ? "مالیاتی رپورٹ - مدرسہ مینجمنٹ سسٹم" : "Financial Report - Madarsa Management", 
      isUrdu ? "مدرسہ کا مالیاتی جائزہ" : "Madarsa Financial Overview",
      summaryHtml + contentHtml
    )
  }

  const handlePrintAttendanceReport = () => {
    const summaryHtml = `
      <div class="summary-grid" dir="${isUrdu ? 'rtl' : 'ltr'}">
        <div class="summary-card">
          <div class="summary-label">${isUrdu ? "کل رجسٹرڈ طلباء" : "Total Students"}</div>
          <div class="summary-value">${studentsList.length}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">${isUrdu ? "فعال طلباء" : "Active Students"}</div>
          <div class="summary-value" style="color: #137333;">${studentsList.filter(s => s.status === 'Active').length}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">${isUrdu ? "غیر سرگرم" : "Inactive Students"}</div>
          <div class="summary-value" style="color: #c5221f;">${studentsList.filter(s => s.status === 'Inactive').length}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">${isUrdu ? "تدریسی عملہ" : "Teachers Staff"}</div>
          <div class="summary-value">${teachersList.length}</div>
        </div>
      </div>
    `

    const contentHtml = `
      <h2 style="margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 8px;" dir="${isUrdu ? 'rtl' : 'ltr'}">
        ${isUrdu ? "طلباء کی مکمل فہرست" : "Registered Students Roster"}
      </h2>
      <table dir="${isUrdu ? 'rtl' : 'ltr'}">
        <thead>
          <tr>
            <th>${isUrdu ? "آئی ڈی" : "ID"}</th>
            <th>${isUrdu ? "طالب علم کا نام" : "Student Name"}</th>
            <th>${isUrdu ? "کلاس" : "Class"}</th>
            <th>${isUrdu ? "والد کا نام" : "Parent Name"}</th>
            <th>${isUrdu ? "رابطہ نمبر" : "Contact Phone"}</th>
            <th>${isUrdu ? "حالت" : "Status"}</th>
          </tr>
        </thead>
        <tbody>
          ${studentsList.map(s => `
            <tr>
              <td>${s.id}</td>
              <td style="font-weight: 500;">${s.name}</td>
              <td>${s.class}</td>
              <td>${s.parentName}</td>
              <td>${s.phone}</td>
              <td>
                <span class="badge ${s.status === 'Active' ? 'badge-paid' : 'badge-pending'}">
                  ${isUrdu ? (s.status === 'Active' ? 'سرگرم' : 'غیر سرگرم') : s.status}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `

    triggerPrintPopup(
      isUrdu ? "طلباء اور حاضری رپورٹ" : "Students & Attendance Report", 
      isUrdu ? "مدرسہ کے طلباء کی فہرست" : "Madarsa Student Registry",
      summaryHtml + contentHtml
    )
  }

  const handlePrintDonationsReport = () => {
    const summaryHtml = `
      <div class="summary-grid" dir="${isUrdu ? 'rtl' : 'ltr'}">
        <div class="summary-card">
          <div class="summary-label">${isUrdu ? "کل عطیات" : "Total Donations"}</div>
          <div class="summary-value" style="color: #137333;">Rs ${totalDonations}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">${isUrdu ? "زکوٰۃ فنڈ" : "Zakat"}</div>
          <div class="summary-value">Rs ${zakatSum}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">${isUrdu ? "صدقات فنڈ" : "Sadaqah"}</div>
          <div class="summary-value">Rs ${sadaqahSum}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">${isUrdu ? "جنرل فنڈ / باورچی خانہ" : "General / Kitchen"}</div>
          <div class="summary-value">Rs ${generalSum + kitchenSum}</div>
        </div>
      </div>
    `

    const contentHtml = `
      <h2 style="margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 8px;" dir="${isUrdu ? 'rtl' : 'ltr'}">
        ${isUrdu ? "عطیات کا تفصیلی ریکارڈ" : "Detailed Donations Record"}
      </h2>
      <table dir="${isUrdu ? 'rtl' : 'ltr'}">
        <thead>
          <tr>
            <th>${isUrdu ? "رسید" : "Receipt"}</th>
            <th>${isUrdu ? "عطیہ دہندہ" : "Donor Name"}</th>
            <th>${isUrdu ? "رقم" : "Amount"}</th>
            <th>${isUrdu ? "عطیہ کی قسم" : "Donation Type"}</th>
            <th>${isUrdu ? "تاریخ" : "Date"}</th>
          </tr>
        </thead>
        <tbody>
          ${donationsList.map(d => `
            <tr>
              <td>${d.id}</td>
              <td style="font-weight: 500;">${d.donor}</td>
              <td>Rs ${d.amount}</td>
              <td>
                <span class="badge" style="background: #e8f0fe; color: #1a73e8;">
                  ${isUrdu ? (d.type === 'Zakat' ? 'زکوٰۃ' : d.type === 'Sadaqah' ? 'صدقہ' : d.type === 'Kitchen Only' ? 'باورچی خانہ' : 'عمومی') : d.type}
                </span>
              </td>
              <td>${d.date}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `

    triggerPrintPopup(
      isUrdu ? "عطیات کی تفصیلی رپورٹ" : "Donations Detailed Report", 
      isUrdu ? "مدرسہ عطیات اور زکوٰۃ جائزہ" : "Madarsa Donations & Zakat Overview",
      summaryHtml + contentHtml
    )
  }

  const triggerPrintPopup = (title: string, subtitle: string, htmlContent: string) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 40px; 
              color: #333; 
              background: #fff;
              line-height: 1.6;
            }
            .header-container { 
              border-bottom: 3px solid #1a73e8; 
              padding-bottom: 15px; 
              margin-bottom: 25px; 
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .main-title { 
              font-size: 26px; 
              font-weight: bold; 
              color: #1a73e8; 
              margin: 0;
            }
            .main-subtitle { 
              font-size: 14px; 
              color: #666; 
              margin: 5px 0 0 0;
            }
            .summary-grid { 
              display: grid; 
              grid-template-columns: repeat(4, 1fr); 
              gap: 15px; 
              margin-bottom: 30px; 
            }
            .summary-card { 
              background: #f8f9fa; 
              border: 1px solid #e9ecef; 
              padding: 15px; 
              border-radius: 6px; 
              text-align: center; 
            }
            .summary-label { 
              font-size: 11px; 
              color: #7f8c8d; 
              text-transform: uppercase; 
              margin-bottom: 5px; 
              font-weight: 600;
            }
            .summary-value { 
              font-size: 19px; 
              font-weight: bold; 
              color: #2c3e50; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 15px; 
              font-size: 14px;
            }
            th, td { 
              border: 1px solid #e9ecef; 
              padding: 10px 12px; 
              text-align: left; 
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: 600;
              color: #495057;
            }
            tr:nth-child(even) {
              background-color: #fafbfc;
            }
            .badge { 
              padding: 3px 8px; 
              border-radius: 4px; 
              font-size: 11px; 
              font-weight: bold; 
              display: inline-block;
            }
            .badge-paid { 
              background: #e6f4ea; 
              color: #137333; 
            }
            .badge-pending { 
              background: #fce8e6; 
              color: #c5221f; 
            }
            
            /* Print Specific Styles */
            @media print {
              body { padding: 10px; }
              .no-print { display: none !important; }
            }
            
            /* RTL adjustments */
            [dir="rtl"] th, [dir="rtl"] td {
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="display: flex; justify-content: space-between; margin-bottom: 25px; background: #e8f0fe; padding: 12px 20px; border-radius: 6px;">
            <span style="font-size: 14px; color: #1a73e8; font-weight: 500; display: flex; align-items: center;">
              ℹ️ ${isUrdu ? "رپورٹ تیار ہے۔ پرنٹ کرنے یا پی ڈی ایف کے طور پر محفوظ کرنے کے لیے پرنٹ بٹن دبائیں۔" : "Report is ready. Click print to output or save as PDF."}
            </span>
            <button onclick="window.print();" style="background: #1a73e8; color: white; border: none; padding: 8px 18px; font-size: 14px; font-weight: bold; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
              🖨️ ${isUrdu ? "رپورٹ پرنٹ کریں" : "Print Report"}
            </button>
          </div>
          
          <div class="header-container" dir="${isUrdu ? 'rtl' : 'ltr'}">
            <div>
              <h1 class="main-title">${title}</h1>
              <p class="main-subtitle">${subtitle}</p>
            </div>
            <div style="text-align: ${isUrdu ? 'left' : 'right'}; font-size: 12px; color: #7f8c8d;">
              <strong>${isUrdu ? "تاریخ:" : "Date:"}</strong> ${new Date().toLocaleDateString()}<br>
              <strong>${isUrdu ? "مدرسہ انتظام کار" : "Madarsa Admin Panel"}</strong>
            </div>
          </div>
          
          ${htmlContent}
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // --- End of Importers & Printers ---

  return (
    <div className="flex flex-col gap-6" dir={isUrdu ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isUrdu ? "رپورٹس اور تجارتی جائزہ" : "Reports & Analytics"}
          </h2>
          <p className="text-muted-foreground">
            {isUrdu ? "مدرسے کی مالیاتی، حاضری اور عطیات کی تفصیلی رپورٹس ڈاؤن لوڈ کریں۔" : "Generate and download comprehensive madarsa reports."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Financial Report */}
        <Card className="shadow-sm border-muted/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Wallet className="h-5 w-5 text-primary" /> 
              {isUrdu ? "مالیاتی رپورٹ" : "Financial Report"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isUrdu ? "ماہانہ آمدنی، اخراجات اور بقایا فیس کا تفصیلی خلاصہ۔" : "Monthly income, expenses, and pending fees."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button className="w-full flex items-center justify-center gap-2" onClick={handleDownloadFinancialCSV}>
              <Download className="h-4 w-4" /> 
              {isUrdu ? "ایکسل / CSV ڈاؤن لوڈ کریں" : "Download Excel / CSV"}
            </Button>
            <Button className="w-full flex items-center justify-center gap-2" variant="outline" onClick={handlePrintFinancialReport}>
              <Printer className="h-4 w-4 text-emerald-600" /> 
              {isUrdu ? "پی ڈی ایف پرنٹ کریں" : "Print / PDF Report"}
            </Button>
          </CardContent>
        </Card>
        
        {/* Attendance Report */}
        <Card className="shadow-sm border-muted/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Users className="h-5 w-5 text-primary" /> 
              {isUrdu ? "طلباء و حاضری رپورٹ" : "Attendance Report"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isUrdu ? "طلباء کے کوائف، کلاسز اور حاضر سرگرم طلباء کی فہرست۔" : "Student and teacher attendance summaries."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button className="w-full flex items-center justify-center gap-2" variant="secondary" onClick={handleDownloadAttendanceCSV}>
              <Download className="h-4 w-4" /> 
              {isUrdu ? "ایکسل / CSV ڈاؤن لوڈ کریں" : "Download Excel / CSV"}
            </Button>
            <Button className="w-full flex items-center justify-center gap-2" variant="outline" onClick={handlePrintAttendanceReport}>
              <Printer className="h-4 w-4 text-emerald-600" /> 
              {isUrdu ? "پی ڈی ایف پرنٹ کریں" : "Print / PDF Report"}
            </Button>
          </CardContent>
        </Card>
        
        {/* Donations Report */}
        <Card className="shadow-sm border-muted/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <TrendingUp className="h-5 w-5 text-primary" /> 
              {isUrdu ? "عطیات اور زکوٰۃ رپورٹ" : "Donations Report"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isUrdu ? "زکوٰۃ، صدقات اور جنرل فنڈز کے عطیات کا تفصیلی ریکارڈ۔" : "Detailed breakdown of zakat and sadaqah."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button className="w-full flex items-center justify-center gap-2" variant="outline" onClick={handleDownloadDonationsCSV}>
              <Download className="h-4 w-4" /> 
              {isUrdu ? "ایکسل / CSV ڈاؤن لوڈ کریں" : "Download Excel / CSV"}
            </Button>
            <Button className="w-full flex items-center justify-center gap-2" variant="outline" onClick={handlePrintDonationsReport}>
              <Printer className="h-4 w-4 text-emerald-600" /> 
              {isUrdu ? "پی ڈی ایف پرنٹ کریں" : "Print / PDF Report"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
