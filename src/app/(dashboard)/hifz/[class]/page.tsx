"use client"

import { useParams } from "next/navigation"
import { useLocalStorage, Student, initialStudents } from "@/lib/store"
import { useTranslation } from "@/lib/translations"
import { useLanguage } from "@/components/language-provider"

export default function HifzClassPage() {
  const { class: className } = useParams() as { class: string }
  const [students] = useLocalStorage<Student[]>("madarsa_students", initialStudents)
  const { language } = useLanguage()
  const { t } = useTranslation(language)

  const filtered = students.filter((s) => s.class === className)

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t("stuTitle")} - {className}</h1>
      {filtered.length === 0 ? (
        <p>{t("noActiveStudents")}</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((s) => (
            <li key={s.id} className="border p-2 rounded">
              <p>{s.name}</p>
              <p>{s.parentName}</p>
              <p>{s.phone}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
