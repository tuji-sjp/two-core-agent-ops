"use client"

import { useState, type ReactNode } from "react"
import {
  Play,
  Flag,
  Layers,
  BookOpenCheck,
  ShieldAlert,
  FileOutput,
  CircleCheck,
  CircleAlert,
  CircleDashed,
  Database,
  UserRoundCog,
  RefreshCcw,
  ChevronDown,
  Wand2,
  Scissors,
} from "lucide-react"
import { getMbDeduct, getMbStandardize, type DecisionChain, type FeeItem, type NodeStatus } from "@/lib/deduction-data"
import { cn } from "@/lib/utils"

/* ---------- 状态样式 ---------- */

function statusMeta(status: NodeStatus, danger = false) {
  if (status === "skip") {
    return {
      label: "未执行",
      ring: "border-dashed border-border bg-muted/40",
      text: "text-muted-foreground",
      dot: "bg-muted-foreground/40",
      icon: CircleDashed,
      iconColor: "text-muted-foreground/60",
    }
  }
  if (status === "pass") {
    return {
      label: "已通过",
      ring: "border-emerald-200 bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      icon: CircleCheck,
      iconColor: "text-emerald-600",
    }
  }
  // hit
  if (danger) {
    return {
      label: "已触发",
      ring: "border-red-200 bg-red-50",
      text: "text-red-700",
      dot: "bg-red-500",
      icon: CircleAlert,
      iconColor: "text-red-600",
    }
  }
  return {
    label: "已触发",
    ring: "border-amber-200 bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    icon: CircleAlert,
    iconColor: "text-amber-600",
  }
}

/* ---------- 悬停信息卡 ---------- */

function HoverPanel({
  title,
  status,
  children,
  danger,
  trigger,
}: {
  title: string
  status: NodeStatus
  danger?: boolean
  children: ReactNode
  trigger: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const meta = statusMeta(status, danger)
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {trigger}
      {open && (
        <div className="absolute left-1/2 top-full z-30 w-72 -translate-x-1/2 pt-2">
          <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
            <div className="mb-1.5 flex items-center gap-2">
              <span className={cn("inline-block h-2 w-2 rounded-full", meta.dot)} />
              <span className="text-sm font-medium text-popover-foreground">{title}</span>
              <span className={cn("ml-auto rounded px-1.5 py-0.5 text-[11px] font-medium", meta.ring, meta.text)}>
                {meta.label}
              </span>
            </div>
            <div className="text-xs leading-relaxed text-muted-foreground">{children}</div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- 连接线 ---------- */

function Connector({ label, active = true }: { label?: string; active?: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className={cn("h-7 w-px", active ? "bg-primary/40" : "bg-border")} />
      {label && (
        <span className="absolute left-full top-1/2 ml-1 -translate-y-1/2 whitespace-nowrap text-[11px] text-muted-foreground">
          {label}
        </span>
      )}
      <ChevronDown
        className={cn("-mt-2 h-3.5 w-3.5", active ? "text-primary/50" : "text-border")}
        strokeWidth={2.5}
      />
    </div>
  )
}

/* ---------- 端点（开始/结束） ---------- */

function EndPoint({ label, icon: Icon }: { label: string; icon: typeof Play }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium text-primary">{label}</span>
    </div>
  )
}

/* ---------- 主节点卡片 ---------- */

function NodeCard({
  icon: Icon,
  title,
  subtitle,
  status,
  danger,
  badges,
  children,
}: {
  icon: typeof Layers
  title: string
  subtitle?: string
  status: NodeStatus
  danger?: boolean
  badges?: ReactNode
  children?: ReactNode
}) {
  const meta = statusMeta(status, danger)
  const StatusIcon = meta.icon
  return (
    <div className={cn("w-[340px] rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md", meta.ring)}>
      <div className="flex items-start gap-3 p-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card shadow-sm ring-1 ring-border">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-card-foreground">{title}</h4>
            <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", meta.text)}>
              <StatusIcon className={cn("h-3 w-3", meta.iconColor)} />
              {meta.label}
            </span>
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          {badges && <div className="mt-2 flex flex-wrap gap-1.5">{badges}</div>}
        </div>
      </div>
      {children}
    </div>
  )
}

function Badge({ tone = "default", children }: { tone?: "default" | "danger" | "info"; children: ReactNode }) {
  const tones = {
    default: "bg-muted text-muted-foreground",
    danger: "bg-red-100 text-red-700",
    info: "bg-accent text-accent-foreground",
  }
  return <span className={cn("rounded px-2 py-0.5 text-[11px] font-medium", tones[tone])}>{children}</span>
}

/* ---------- 规则模块的子节点 ---------- */

function SubNodeRow({ name, status, conclusion }: { name: string; status: NodeStatus; conclusion: string }) {
  const meta = statusMeta(status)
  return (
    <HoverPanel
      title={name}
      status={status}
      trigger={
        <div className="flex cursor-default items-center gap-2 rounded-md border border-border/70 bg-background px-2.5 py-1.5">
          <span className={cn("inline-block h-1.5 w-1.5 rounded-full", meta.dot)} />
          <span className="text-xs text-card-foreground">{name}</span>
          <span className={cn("ml-auto text-[11px]", meta.text)}>{meta.label}</span>
        </div>
      }
    >
      {conclusion}
    </HoverPanel>
  )
}

/* ---------- 决策链主体 ---------- */

export function DecisionChainView({ item }: { item: FeeItem }) {
  const c: DecisionChain = item.chain
  const ruleHasResult = c.rule.hasResult
  const mbStandardize = getMbStandardize(item)
  const mbDeduct = getMbDeduct(item)

  return (
    <div className="relative">
      {/* 共享状态侧节点 */}
      <div className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 lg:block">
        <div className="flex w-40 flex-col items-center gap-2 rounded-xl border border-dashed border-red-200 bg-red-50/60 p-3 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
            <Database className="h-4.5 w-4.5 text-red-500" />
          </div>
          <div className="text-sm font-semibold text-red-700">共享状态</div>
          <div className="text-[11px] leading-relaxed text-red-600/80">
            Shared State（记忆）
            <br />
            各节点读写中间结论
          </div>
        </div>
      </div>

      {/* 主流程 */}
      <div className="flex flex-col items-center">
        <EndPoint label="开始" icon={Play} />
        <Connector />

        {/* 1. 医保剔费-项目标化模块 */}
        <HoverPanel
          title="医保剔费-项目标化模块"
          status={mbStandardize.status}
          trigger={
            <NodeCard
              icon={Wand2}
              title="医保剔费-项目标化模块"
              subtitle="调用 HIDS 接口取 TopN 推荐项，作业标化选最优标化项目"
              status={mbStandardize.status}
            />
          }
        >
          {mbStandardize.conclusion}
        </HoverPanel>

        <Connector active />

        {/* 2. 医保剔费-项目剔费模块 */}
        <HoverPanel
          title="医保剔费-项目剔费模块"
          status={mbDeduct.status}
          trigger={
            <NodeCard
              icon={Scissors}
              title="医保剔费-项目剔费模块"
              subtitle="基于标化项调用 MBE 剔费接口，识别特殊剔费场景"
              status={mbDeduct.status}
            />
          }
        >
          {mbDeduct.conclusion}
        </HoverPanel>

        <Connector active />

        {/* 3. 商保控费-规则知识判定模块 */}
        <NodeCard
          icon={Layers}
          title="商保控费-规则判定模块"
          subtitle="基于规则知识库逐级判定"
          status={c.rule.status}
        >
          <div className="space-y-1.5 border-t border-border/60 bg-muted/30 p-3">
            {c.rule.sub.map((s) => (
              <SubNodeRow key={s.key} name={s.name} status={s.status} conclusion={s.conclusion} />
            ))}
            <p className="px-0.5 pt-1 text-[11px] leading-relaxed text-muted-foreground">{c.rule.conclusion}</p>
          </div>
        </NodeCard>

        <Connector label={ruleHasResult ? "有判定结果" : "无判定结果"} active />

        {/* 4. 商保控费-条款知识判定模块 */}
        <HoverPanel
          title="商保控费-条款判定模块"
          status={c.clause.status}
          danger={false}
          trigger={
            <NodeCard
              icon={BookOpenCheck}
              title="商保控费-条款判定模块"
              subtitle={ruleHasResult ? "规则已出结果，本节点跳过" : "基于条款知识库进行判定"}
              status={c.clause.status}
              badges={c.clause.reflected ? <Badge tone="info">触发反省 · 二次校验</Badge> : undefined}
            />
          }
        >
          {c.clause.conclusion}
        </HoverPanel>

        {c.clause.reflected && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-primary">
            <RefreshCcw className="h-3 w-3" />
            反省循环：结论回写共享状态后二次判定
          </div>
        )}

        <Connector active />

        {/* 3. 风控模块 */}
        <HoverPanel
          title="风控模块"
          status={c.risk.status}
          danger={c.risk.toHuman}
          trigger={
            <NodeCard
              icon={ShieldAlert}
              title="风控模块"
              subtitle="评估风险并判断是否转人工"
              status={c.risk.status}
              danger={c.risk.toHuman}
              badges={
                <>
                  {c.risk.risks.length > 0 ? (
                    c.risk.risks.map((r) => (
                      <Badge key={r} tone="danger">
                        {r}
                      </Badge>
                    ))
                  ) : (
                    <Badge>无风险</Badge>
                  )}
                  {c.risk.toHuman && (
                    <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[11px] font-medium text-white">
                      <UserRoundCog className="h-3 w-3" />
                      转人工
                    </span>
                  )}
                </>
              }
            />
          }
        >
          {c.risk.conclusion}
        </HoverPanel>

        <Connector active />

        {/* 4. 输出标化模块 */}
        <HoverPanel
          title="输出标化模块"
          status={c.output.status}
          trigger={
            <NodeCard
              icon={FileOutput}
              title="输出标化模块"
              subtitle="生成标准化扣费结论"
              status={c.output.status}
            />
          }
        >
          {c.output.conclusion}
        </HoverPanel>

        <Connector active />
        <EndPoint label="结束" icon={Flag} />
      </div>
    </div>
  )
}
