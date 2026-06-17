"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight, ListFilter, LayoutList, FileText, MousePointerClick } from "lucide-react"
import { feeItems, getUnreasonableGroups, type FeeItem, type FeeResult } from "@/lib/deduction-data"
import { DecisionChainView } from "@/components/decision-chain"
import { cn } from "@/lib/utils"

type SidebarMode = "unreasonable" | "all"

function resultBadge(result: FeeResult) {
  const map = {
    扣费: "bg-amber-100 text-amber-700 border-amber-200",
    通过: "bg-emerald-100 text-emerald-700 border-emerald-200",
    转人工: "bg-red-100 text-red-700 border-red-200",
  } as const
  return map[result]
}

function ItemRow({
  item,
  active,
  onClick,
  indent = false,
}: {
  item: FeeItem
  active: boolean
  onClick: () => void
  indent?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md py-2 pr-2 text-left text-sm transition-colors",
        indent ? "pl-7" : "pl-3",
        active ? "bg-primary/10 font-medium text-primary" : "text-card-foreground hover:bg-muted",
      )}
    >
      <span className="min-w-0 flex-1 truncate">{item.name}</span>
      <span
        className={cn(
          "shrink-0 rounded border px-1.5 py-0.5 text-[11px] font-medium",
          resultBadge(item.result),
        )}
      >
        {item.result}
      </span>
    </button>
  )
}

export function DeductionItemsTab() {
  const [mode, setMode] = useState<SidebarMode>("unreasonable")
  const [selectedId, setSelectedId] = useState<string>(feeItems[0].id)
  const groups = useMemo(() => getUnreasonableGroups(), [])
  const [openCats, setOpenCats] = useState<Record<string, boolean>>(() => ({ [groups[0]?.category]: true }))

  const selected = feeItems.find((i) => i.id === selectedId) ?? feeItems[0]

  function toggleCat(cat: string) {
    setOpenCats((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  return (
    <div className="flex min-h-[640px] gap-4">
      {/* 侧边栏 */}
      <aside className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-card">
        <div className="grid grid-cols-2 gap-1 p-2">
          <button
            type="button"
            onClick={() => setMode("unreasonable")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors",
              mode === "unreasonable"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70",
            )}
          >
            <ListFilter className="h-4 w-4" />
            不合理类型
          </button>
          <button
            type="button"
            onClick={() => setMode("all")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors",
              mode === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70",
            )}
          >
            <LayoutList className="h-4 w-4" />
            全部项目
          </button>
        </div>

        <div className="flex items-center justify-between border-y border-border px-3 py-2 text-xs text-muted-foreground">
          <span>{mode === "unreasonable" ? "不合理项目分类" : "全部费用项目"}</span>
          <span>
            共 {mode === "unreasonable" ? groups.reduce((n, g) => n + g.items.length, 0) : feeItems.length} 项
          </span>
        </div>

        <div className="max-h-[560px] flex-1 overflow-y-auto p-2">
          {mode === "unreasonable" ? (
            <div className="space-y-1">
              {groups.map((g) => {
                const open = openCats[g.category]
                return (
                  <div key={g.category}>
                    <button
                      type="button"
                      onClick={() => toggleCat(g.category)}
                      className="flex w-full items-center gap-1.5 rounded-md px-2 py-2 text-left text-sm font-medium text-card-foreground hover:bg-muted"
                    >
                      {open ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="flex-1">{g.category}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        {g.items.length}
                      </span>
                    </button>
                    {open && (
                      <div className="mt-0.5 space-y-0.5">
                        {g.items.map((item) => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            indent
                            active={selectedId === item.id}
                            onClick={() => setSelectedId(item.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-0.5">
              {feeItems.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  active={selectedId === item.id}
                  onClick={() => setSelectedId(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* 右侧：决策链 */}
      <section className="min-w-0 flex-1 rounded-xl border border-border bg-card">
        {/* 项目概要 */}
        <div className="border-b border-border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-card-foreground">{selected.name}</h2>
                <span
                  className={cn(
                    "rounded border px-2 py-0.5 text-xs font-medium",
                    resultBadge(selected.result),
                  )}
                >
                  {selected.result}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">所属分类：{selected.category}</p>
            </div>
            <dl className="ml-auto grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
              <Stat label="单价" value={`¥${selected.unitPrice}`} />
              <Stat label="数量" value={`${selected.quantity}${selected.spec}`} />
              <Stat label="金额" value={`¥${selected.amount.toFixed(2)}`} />
              <Stat
                label="扣费金额"
                value={`¥${selected.deductAmount.toFixed(2)}`}
                highlight={selected.deductAmount > 0}
              />
            </dl>
          </div>
        </div>

        {/* 决策链标题 */}
        <div className="flex items-center gap-2 px-4 pt-4 text-sm text-muted-foreground">
          <MousePointerClick className="h-4 w-4" />
          扣费智能体判定决策链 · 鼠标悬停节点查看结论
        </div>

        {/* 决策链图 */}
        <div className="overflow-x-auto px-4 pb-8 pt-6">
          <DecisionChainView key={selected.id} item={selected} />
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className={cn("font-medium", highlight ? "text-amber-600" : "text-card-foreground")}>{value}</dd>
    </div>
  )
}
