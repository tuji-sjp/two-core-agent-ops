"use client"

import { useState } from "react"
import { ArrowLeft, ListChecks, Cpu, Network } from "lucide-react"
import { billHeader, feeItems } from "@/lib/deduction-data"
import { DeductionItemsTab } from "@/components/deduction-items-tab"
import { cn } from "@/lib/utils"

type TabKey = "items" | "engine" | "lic"

const TABS: { key: TabKey; label: string; icon: typeof ListChecks }[] = [
  { key: "items", label: "扣费项目展示", icon: ListChecks },
  { key: "engine", label: "引擎结果", icon: Cpu },
  { key: "lic", label: "LIC系统响应", icon: Network },
]

export function LogDetailPage() {
  const [tab, setTab] = useState<TabKey>("items")

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部信息栏 */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-8 gap-y-2 px-6 py-3.5">
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
          <HeaderField label="任务号" value={billHeader.taskNo} />
          <HeaderField label="案件号" value={billHeader.caseNo} />
          <HeaderField label="账单号" value={billHeader.billNo} />
          <div className="ml-auto flex items-center gap-5 text-sm">
            <span className="text-muted-foreground">
              账单金额 <span className="font-semibold text-card-foreground">¥{billHeader.totalAmount.toFixed(2)}</span>
            </span>
            <span className="text-muted-foreground">
              扣费合计 <span className="font-semibold text-amber-600">¥{billHeader.totalDeduct.toFixed(2)}</span>
            </span>
          </div>
        </div>
      </header>

      {/* 标签页 */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1400px] gap-1 px-6">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 内容 */}
      <main className="mx-auto max-w-[1400px] px-6 py-5">
        {tab === "items" && <DeductionItemsTab />}
        {tab === "engine" && <EnginePanel />}
        {tab === "lic" && <LicPanel />}
      </main>
    </div>
  )
}

function HeaderField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-muted-foreground">{label}：</span>
      <span className="font-medium text-card-foreground">{value}</span>
    </div>
  )
}

/* ---------- 引擎结果（简版面板） ---------- */

function EnginePanel() {
  const deductItems = feeItems.filter((i) => i.result !== "通过")
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-base font-semibold text-card-foreground">引擎判定结果汇总</h3>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">费用项目</th>
              <th className="px-4 py-2.5 text-left font-medium">不合理类型</th>
              <th className="px-4 py-2.5 text-right font-medium">金额</th>
              <th className="px-4 py-2.5 text-right font-medium">扣费金额</th>
              <th className="px-4 py-2.5 text-left font-medium">判定结果</th>
              <th className="px-4 py-2.5 text-left font-medium">扣费依据</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deductItems.map((i) => (
              <tr key={i.id} className="hover:bg-muted/40">
                <td className="px-4 py-2.5 font-medium text-card-foreground">{i.name}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{i.category}</td>
                <td className="px-4 py-2.5 text-right text-card-foreground">¥{i.amount.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-right font-medium text-amber-600">
                  ¥{i.deductAmount.toFixed(2)}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[11px] font-medium",
                      i.result === "扣费"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-red-200 bg-red-50 text-red-700",
                    )}
                  >
                    {i.result}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{i.chain.output.conclusion.replace("标化输出：", "")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------- LIC 系统响应（简版面板） ---------- */

function LicPanel() {
  const payload = {
    code: "0000",
    message: "success",
    taskNo: billHeader.taskNo,
    caseNo: billHeader.caseNo,
    billNo: billHeader.billNo,
    totalAmount: billHeader.totalAmount,
    totalDeduct: billHeader.totalDeduct,
    items: feeItems
      .filter((i) => i.result !== "通过")
      .map((i) => ({
        name: i.name,
        result: i.result,
        deductAmount: i.deductAmount,
        reason: i.chain.output.conclusion.replace("标化输出：", ""),
      })),
  }
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          回写成功 · 200 OK
        </span>
        <span className="text-xs text-muted-foreground">响应时间 142ms</span>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed text-card-foreground">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  )
}
