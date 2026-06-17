import React, { useState } from 'react'
import { Row, Col, Table, Tag, Pagination, Input, Button, Select, Popover, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import MetricCard from '../../dashboard/components/smart-services/metric-card'
import CaseProcessingChart from '../../dashboard/components/smart-services/case-processing-chart'

const METRICS_CLAIMS: { label: string; value: string; change: { direction: 'up' | 'down'; value: string } }[] = [
  { label: 'Tokens使用量', value: '12.8万', change: { direction: 'up', value: '15.2%' } },
  { label: '处理案件总数', value: '3,245', change: { direction: 'up', value: '8.7%' } },
  { label: '服务调用总数', value: '8,712', change: { direction: 'up', value: '12.3%' } },
  { label: '平均调用成功率', value: '96.3%', change: { direction: 'up', value: '1.2%' } },
  { label: '平均处理时长', value: '4.2s', change: { direction: 'down', value: '0.8s' } },
  { label: '采集环节自动化率', value: '94.5%', change: { direction: 'up', value: '3.2%' } },
  { label: '立案环节自动化率', value: '87.2%', change: { direction: 'up', value: '2.5%' } },
  { label: '扣费环节自动化率', value: '91.8%', change: { direction: 'up', value: '1.8%' } },
  { label: '理算环节自动化率', value: '85.6%', change: { direction: 'down', value: '1.1%' } },
  { label: '审核环节自动化率', value: '92.1%', change: { direction: 'up', value: '4.3%' } },
]

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  processing: { color: 'processing', text: '处理中' },
  completed: { color: 'success', text: '已完成' },
}

// ========== 流程轨迹类型 ==========
type NodeStatus = 'processing' | 'completed'

interface FlowTrajectory {
  nodes: { label: string; status: NodeStatus }[]
}

const NODE_LABELS = ['开始', '采集', '立案', '理算', '扣费', '审核', '结束']
function generateFlowTrajectory(caseNo: string, status: string): FlowTrajectory {
  const lastChar = parseInt(caseNo.slice(-2), 10)
  const nodes: { label: string; status: NodeStatus }[] = NODE_LABELS.map(label => ({ label, status: 'processing' as NodeStatus }))

  if (status === 'completed') {
    for (let i = 0; i < nodes.length; i++) nodes[i].status = 'completed'
  } else {
    const completedCount = 1 + (lastChar % 5)
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].status = i <= completedCount ? 'completed' : 'processing'
    }
  }

  return { nodes }
}

// ========== 节点调用记录 mock 数据 ==========
interface CallRecord {
  time: string
  success: boolean
}

// 每个案件的中间节点（采集~审核）mock 1~4 次调用记录
const NODE_CALL_RECORDS: Record<string, Record<string, CallRecord[]>> = {
  'A1000000000': {
    '采集': [{ time: '2026-06-02 10:23', success: true }, { time: '2026-06-02 10:25', success: true }],
    '立案': [{ time: '2026-06-02 10:28', success: true }],
    '理算': [{ time: '2026-06-02 10:32', success: true }, { time: '2026-06-02 10:33', success: false }, { time: '2026-06-02 10:35', success: true }],
    '扣费': [{ time: '2026-06-02 10:38', success: true }],
    '审核': [{ time: '2026-06-02 10:42', success: true }, { time: '2026-06-02 10:43', success: true }],
  },
  'B1000000001': {
    '采集': [{ time: '2026-06-01 09:15', success: false }, { time: '2026-06-01 09:16', success: true }, { time: '2026-06-01 09:17', success: true }, { time: '2026-06-01 09:18', success: false }],
    '立案': [{ time: '2026-06-01 09:20', success: true }],
    '理算': [{ time: '2026-06-01 09:23', success: true }, { time: '2026-06-01 09:24', success: true }],
    '扣费': [{ time: '2026-06-01 09:26', success: true }],
    '审核': [{ time: '2026-06-01 09:28', success: true }],
  },
  'C1000000002': {
    '采集': [{ time: '2026-05-30 14:10', success: true }],
    '立案': [{ time: '2026-05-30 14:12', success: true }, { time: '2026-05-30 14:13', success: true }],
    '理算': [{ time: '2026-05-30 14:15', success: false }, { time: '2026-05-30 14:17', success: true }],
    '扣费': [{ time: '2026-05-30 14:20', success: true }, { time: '2026-05-30 14:21', success: true }, { time: '2026-05-30 14:22', success: true }],
    '审核': [{ time: '2026-05-30 14:25', success: true }],
  },
  'D1000000003': {
    '采集': [{ time: '2026-05-27 11:00', success: true }, { time: '2026-05-27 11:01', success: false }],
    '立案': [{ time: '2026-05-27 11:05', success: true }],
    '理算': [{ time: '2026-05-27 11:08', success: true }],
    '扣费': [{ time: '2026-05-27 11:10', success: false }, { time: '2026-05-27 11:12', success: true }],
    '审核': [{ time: '2026-05-27 11:15', success: true }],
  },
  'E1000000004': {
    '采集': [{ time: '2026-05-24 08:30', success: true }, { time: '2026-05-24 08:31', success: true }, { time: '2026-05-24 08:32', success: false }],
    '立案': [{ time: '2026-05-24 08:35', success: true }, { time: '2026-05-24 08:36', success: true }],
    '理算': [{ time: '2026-05-24 08:38', success: true }],
    '扣费': [{ time: '2026-05-24 08:40', success: true }],
    '审核': [{ time: '2026-05-24 08:42', success: true }],
  },
  'F1000000005': {
    '采集': [{ time: '2026-05-22 16:00', success: true }],
    '立案': [{ time: '2026-05-22 16:05', success: true }, { time: '2026-05-22 16:06', success: true }],
    '理算': [{ time: '2026-05-22 16:08', success: true }],
    '扣费': [{ time: '2026-05-22 16:10', success: true }, { time: '2026-05-22 16:11', success: true }],
    '审核': [{ time: '2026-05-22 16:13', success: true }],
  },
  'G1000000006': {
    '采集': [{ time: '2026-05-20 13:00', success: true }, { time: '2026-05-20 13:01', success: false }],
    '立案': [{ time: '2026-05-20 13:03', success: true }, { time: '2026-05-20 13:04', success: true }, { time: '2026-05-20 13:05', success: true }, { time: '2026-05-20 13:06', success: true }],
    '理算': [{ time: '2026-05-20 13:08', success: true }],
    '扣费': [{ time: '2026-05-20 13:10', success: true }],
    '审核': [{ time: '2026-05-20 13:12', success: true }],
  },
  'H1000000007': {
    '采集': [{ time: '2026-05-17 10:00', success: true }],
    '立案': [{ time: '2026-05-17 10:03', success: true }],
    '理算': [{ time: '2026-05-17 10:05', success: true }, { time: '2026-05-17 10:06', success: true }],
    '扣费': [{ time: '2026-05-17 10:08', success: false }],
    '审核': [{ time: '2026-05-17 10:10', success: true }, { time: '2026-05-17 10:11', success: true }],
  },
  'I1000000008': {
    '采集': [{ time: '2026-05-16 09:00', success: true }, { time: '2026-05-16 09:01', success: false }],
    '立案': [{ time: '2026-05-16 09:03', success: true }],
    '理算': [{ time: '2026-05-16 09:05', success: true }, { time: '2026-05-16 09:06', success: true }],
    '扣费': [{ time: '2026-05-16 09:08', success: true }],
    '审核': [{ time: '2026-05-16 09:10', success: true }],
  },
  'J1000000009': {
    '采集': [{ time: '2026-05-14 14:30', success: true }, { time: '2026-05-14 14:31', success: true }, { time: '2026-05-14 14:32', success: false }],
    '立案': [{ time: '2026-05-14 14:35', success: true }],
    '理算': [{ time: '2026-05-14 14:37', success: true }],
    '扣费': [{ time: '2026-05-14 14:39', success: true }, { time: '2026-05-14 14:40', success: true }],
    '审核': [{ time: '2026-05-14 14:42', success: true }, { time: '2026-05-14 14:43', success: true }, { time: '2026-05-14 14:44', success: true }],
  },
  'K1000000010': {
    '采集': [{ time: '2026-05-13 10:00', success: true }, { time: '2026-05-13 10:02', success: true }],
    '立案': [{ time: '2026-05-13 10:05', success: true }],
    '理算': [{ time: '2026-05-13 10:08', success: true }],
    '扣费': [{ time: '2026-05-13 10:10', success: true }],
    '审核': [{ time: '2026-05-13 10:13', success: true }],
  },
  'L1000000011': {
    '采集': [{ time: '2026-05-12 11:00', success: false }],
    '立案': [{ time: '2026-05-12 11:03', success: true }, { time: '2026-05-12 11:04', success: true }],
    '理算': [{ time: '2026-05-12 11:06', success: true }],
    '扣费': [{ time: '2026-05-12 11:08', success: true }],
    '审核': [{ time: '2026-05-12 11:10', success: true }],
  },
  'M1000000012': {
    '采集': [{ time: '2026-05-10 15:00', success: true }, { time: '2026-05-10 15:01', success: true }],
    '立案': [{ time: '2026-05-10 15:03', success: true }, { time: '2026-05-10 15:04', success: true }, { time: '2026-05-10 15:05', success: true }],
    '理算': [{ time: '2026-05-10 15:07', success: true }],
    '扣费': [{ time: '2026-05-10 15:09', success: true }],
    '审核': [{ time: '2026-05-10 15:11', success: true }],
  },
  'N1000000013': {
    '采集': [{ time: '2026-05-08 09:30', success: false }],
    '立案': [{ time: '2026-05-08 09:33', success: true }],
    '理算': [{ time: '2026-05-08 09:35', success: true }, { time: '2026-05-08 09:36', success: true }],
    '扣费': [{ time: '2026-05-08 09:38', success: true }],
    '审核': [{ time: '2026-05-08 09:40', success: true }, { time: '2026-05-08 09:41', success: true }],
  },
  'O1000000014': {
    '采集': [{ time: '2026-05-06 10:00', success: true }, { time: '2026-05-06 10:01', success: true }],
    '立案': [{ time: '2026-05-06 10:03', success: true }],
    '理算': [{ time: '2026-05-06 10:05', success: true }],
    '扣费': [{ time: '2026-05-06 10:07', success: true }, { time: '2026-05-06 10:08', success: true }],
    '审核': [{ time: '2026-05-06 10:10', success: true }],
  },
  'P1000000015': {
    '采集': [{ time: '2026-05-04 08:00', success: false }],
    '立案': [{ time: '2026-05-04 08:03', success: true }, { time: '2026-05-04 08:04', success: true }],
    '理算': [{ time: '2026-05-04 08:06', success: true }],
    '扣费': [{ time: '2026-05-04 08:08', success: true }, { time: '2026-05-04 08:09', success: true }],
    '审核': [{ time: '2026-05-04 08:11', success: true }, { time: '2026-05-04 08:12', success: true }, { time: '2026-05-04 08:13', success: true }, { time: '2026-05-04 08:14', success: true }],
  },
  'Q1000000016': {
    '采集': [{ time: '2026-05-02 12:00', success: true }, { time: '2026-05-02 12:01', success: true }, { time: '2026-05-02 12:02', success: false }],
    '立案': [{ time: '2026-05-02 12:04', success: true }],
    '理算': [{ time: '2026-05-02 12:06', success: true }],
    '扣费': [{ time: '2026-05-02 12:08', success: true }],
    '审核': [{ time: '2026-05-02 12:10', success: true }],
  },
  'R1000000017': {
    '采集': [{ time: '2026-04-30 16:30', success: true }],
    '立案': [{ time: '2026-04-30 16:32', success: true }],
    '理算': [{ time: '2026-04-30 16:34', success: true }, { time: '2026-04-30 16:35', success: true }],
    '扣费': [{ time: '2026-04-30 16:37', success: true }],
    '审核': [{ time: '2026-04-30 16:39', success: true }],
  },
  'S1000000018': {
    '采集': [{ time: '2026-04-28 14:00', success: true }, { time: '2026-04-28 14:01', success: false }],
    '立案': [{ time: '2026-04-28 14:03', success: true }],
    '理算': [{ time: '2026-04-28 14:05', success: true }],
    '扣费': [{ time: '2026-04-28 14:07', success: true }, { time: '2026-04-28 14:08', success: true }],
    '审核': [{ time: '2026-04-28 14:10', success: true }],
  },
  'T1000000019': {
    '采集': [{ time: '2026-04-26 09:00', success: true }],
    '立案': [{ time: '2026-04-26 09:03', success: true }, { time: '2026-04-26 09:04', success: true }, { time: '2026-04-26 09:05', success: true }],
    '理算': [{ time: '2026-04-26 09:07', success: true }],
    '扣费': [{ time: '2026-04-26 09:09', success: true }],
    '审核': [{ time: '2026-04-26 09:11', success: true }],
  },
  'U1000000020': {
    '采集': [{ time: '2026-04-24 11:30', success: true }, { time: '2026-04-24 11:31', success: false }],
    '立案': [{ time: '2026-04-24 11:33', success: true }],
    '理算': [{ time: '2026-04-24 11:35', success: true }],
    '扣费': [{ time: '2026-04-24 11:37', success: true }, { time: '2026-04-24 11:38', success: true }],
    '审核': [{ time: '2026-04-24 11:40', success: true }],
  },
}

// mock 处理时长（秒级）
const NODE_PROCESSING_TIMES: Record<string, Record<string, number>> = {
  'A1000000000': { '开始': 0.5, '采集': 2.3, '立案': 1.8, '理算': 3.1, '扣费': 1.5, '审核': 4.2, '结束': 0.8 },
  'B1000000001': { '开始': 0.3, '采集': 1.5, '立案': 2.0, '理算': 2.8, '扣费': 1.2, '审核': 3.5, '结束': 0.6 },
  'C1000000002': { '开始': 0.7, '采集': 2.1, '立案': 1.5, '理算': 3.3, '扣费': 2.0, '审核': 4.8, '结束': 0.9 },
  'D1000000003': { '开始': 0.4, '采集': 1.8, '立案': 2.5, '理算': 2.5, '扣费': 1.8, '审核': 3.2, '结束': 0.7 },
  'E1000000004': { '开始': 0.6, '采集': 2.0, '立案': 1.2, '理算': 3.5, '扣费': 2.2, '审核': 3.8, '结束': 0.5 },
  'F1000000005': { '开始': 0.8, '采集': 2.5, '立案': 1.9, '理算': 2.7, '扣费': 1.6, '审核': 4.0, '结束': 0.9 },
  'G1000000006': { '开始': 0.2, '采集': 1.6, '立案': 2.2, '理算': 3.0, '扣费': 1.4, '审核': 3.6, '结束': 0.7 },
  'H1000000007': { '开始': 0.5, '采集': 2.4, '立案': 1.7, '理算': 2.9, '扣费': 2.1, '审核': 4.5, '结束': 0.8 },
  'I1000000008': { '开始': 0.9, '采集': 1.9, '立案': 2.3, '理算': 3.2, '扣费': 1.3, '审核': 3.9, '结束': 0.6 },
  'J1000000009': { '开始': 0.3, '采集': 2.2, '立案': 1.6, '理算': 2.6, '扣费': 1.7, '审核': 4.1, '结束': 0.5 },
  'K1000000010': { '开始': 0.5, '采集': 2.0, '立案': 1.8, '理算': 3.0, '扣费': 1.6, '审核': 3.9, '结束': 0.7 },
  'L1000000011': { '开始': 0.7, '采集': 1.7, '立案': 2.4, '理算': 3.4, '扣费': 2.0, '审核': 3.7, '结束': 0.8 },
  'M1000000012': { '开始': 0.4, '采集': 2.6, '立案': 1.3, '理算': 2.8, '扣费': 1.5, '审核': 4.3, '结束': 0.7 },
  'N1000000013': { '开始': 0.6, '采集': 1.4, '立案': 2.1, '理算': 3.1, '扣费': 2.3, '审核': 3.4, '结束': 0.9 },
  'O1000000014': { '开始': 0.8, '采集': 2.3, '立案': 1.8, '理算': 2.5, '扣费': 1.9, '审核': 4.6, '结束': 0.6 },
  'P1000000015': { '开始': 0.2, '采集': 1.5, '立案': 2.6, '理算': 3.6, '扣费': 1.2, '审核': 3.3, '结束': 0.5 },
  'Q1000000016': { '开始': 0.5, '采集': 2.7, '立案': 1.4, '理算': 2.4, '扣费': 2.1, '审核': 4.0, '结束': 0.8 },
  'R1000000017': { '开始': 0.9, '采集': 1.8, '立案': 2.0, '理算': 3.3, '扣费': 1.6, '审核': 3.8, '结束': 0.7 },
  'S1000000018': { '开始': 0.3, '采集': 2.1, '立案': 1.7, '理算': 2.7, '扣费': 1.8, '审核': 4.4, '结束': 0.9 },
  'T1000000019': { '开始': 0.6, '采集': 1.6, '立案': 2.5, '理算': 3.5, '扣费': 2.0, '审核': 3.5, '结束': 0.6 },
  'U1000000020': { '开始': 0.4, '采集': 2.4, '立案': 1.3, '理算': 2.9, '扣费': 1.4, '审核': 4.7, '结束': 0.5 },
}

// 中间节点（可悬停弹出 Popover）
const MIDDLE_NODES = ['采集', '立案', '理算', '扣费', '审核']

const FlowTrajectoryGraph: React.FC<{ trajectory: FlowTrajectory; caseNo?: string }> = ({ trajectory, caseNo }) => {
  const navigate = useNavigate()
  const nodeTimes = caseNo ? NODE_PROCESSING_TIMES[caseNo] : undefined
  const nodeCalls = caseNo ? NODE_CALL_RECORDS[caseNo] : undefined

  // 节点名称 → 任务详情页路由映射（仅采集节点已开发）
  const NODE_ROUTE_MAP: Record<string, string> = {
    '采集': '/agent/claims/task-detail',
  }

  // 采集日志 lookup（用于通过 caseNo + 调用时间匹配 taskId，每条采集调用对应一条日志）
  const CLAIMS_LOGS = [
    { caseNo: 'A1000000000', taskId: '2044719745388838912', createdAt: '2026-06-02 10:23' },
    { caseNo: 'A1000000000', taskId: '2044719745288838912', createdAt: '2026-06-02 10:25' },
    { caseNo: 'B1000000001', taskId: '2044719745188838912', createdAt: '2026-06-01 09:15' },
    { caseNo: 'B1000000001', taskId: '2044719745088838912', createdAt: '2026-06-01 09:16' },
    { caseNo: 'B1000000001', taskId: '2044719744988838912', createdAt: '2026-06-01 09:17' },
    { caseNo: 'B1000000001', taskId: '2044719744888838912', createdAt: '2026-06-01 09:18' },
    { caseNo: 'C1000000002', taskId: '2044719744788838912', createdAt: '2026-05-30 14:10' },
    { caseNo: 'D1000000003', taskId: '2044719744688838912', createdAt: '2026-05-27 11:00' },
    { caseNo: 'D1000000003', taskId: '2044719744588838912', createdAt: '2026-05-27 11:01' },
    { caseNo: 'E1000000004', taskId: '2044719744488838912', createdAt: '2026-05-24 08:30' },
    { caseNo: 'E1000000004', taskId: '2044719744388838912', createdAt: '2026-05-24 08:31' },
    { caseNo: 'E1000000004', taskId: '2044719744288838912', createdAt: '2026-05-24 08:32' },
    { caseNo: 'F1000000005', taskId: '2044719744188838912', createdAt: '2026-05-22 16:00' },
    { caseNo: 'G1000000006', taskId: '2044719744088838912', createdAt: '2026-05-20 13:00' },
    { caseNo: 'G1000000006', taskId: '2044719743988838912', createdAt: '2026-05-20 13:01' },
    { caseNo: 'H1000000007', taskId: '2044719743888838912', createdAt: '2026-05-17 10:00' },
    { caseNo: 'I1000000008', taskId: '2044719743788838912', createdAt: '2026-05-16 09:00' },
    { caseNo: 'I1000000008', taskId: '2044719743688838912', createdAt: '2026-05-16 09:01' },
    { caseNo: 'J1000000009', taskId: '2044719743588838912', createdAt: '2026-05-14 14:30' },
    { caseNo: 'J1000000009', taskId: '2044719743488838912', createdAt: '2026-05-14 14:31' },
    { caseNo: 'J1000000009', taskId: '2044719743388838912', createdAt: '2026-05-14 14:32' },
    { caseNo: 'K1000000010', taskId: '2044719743288838912', createdAt: '2026-05-13 10:00' },
    { caseNo: 'K1000000010', taskId: '2044719743188838912', createdAt: '2026-05-13 10:02' },
    { caseNo: 'L1000000011', taskId: '2044719743088838912', createdAt: '2026-05-12 11:00' },
    { caseNo: 'M1000000012', taskId: '2044719742988838912', createdAt: '2026-05-10 15:00' },
    { caseNo: 'M1000000012', taskId: '2044719742888838912', createdAt: '2026-05-10 15:01' },
    { caseNo: 'N1000000013', taskId: '2044719742788838912', createdAt: '2026-05-08 09:30' },
    { caseNo: 'O1000000014', taskId: '2044719742688838912', createdAt: '2026-05-06 10:00' },
    { caseNo: 'O1000000014', taskId: '2044719742588838912', createdAt: '2026-05-06 10:01' },
    { caseNo: 'P1000000015', taskId: '2044719742488838912', createdAt: '2026-05-04 08:00' },
    { caseNo: 'Q1000000016', taskId: '2044719742388838912', createdAt: '2026-05-02 12:00' },
    { caseNo: 'Q1000000016', taskId: '2044719742288838912', createdAt: '2026-05-02 12:01' },
    { caseNo: 'Q1000000016', taskId: '2044719742188838912', createdAt: '2026-05-02 12:02' },
    { caseNo: 'R1000000017', taskId: '2044719742088838912', createdAt: '2026-04-30 16:30' },
    { caseNo: 'S1000000018', taskId: '2044719741988838912', createdAt: '2026-04-28 14:00' },
    { caseNo: 'S1000000018', taskId: '2044719741888838912', createdAt: '2026-04-28 14:01' },
    { caseNo: 'T1000000019', taskId: '2044719741788838912', createdAt: '2026-04-26 09:00' },
    { caseNo: 'U1000000020', taskId: '2044719741688838912', createdAt: '2026-04-24 11:30' },
    { caseNo: 'U1000000020', taskId: '2044719741588838912', createdAt: '2026-04-24 11:31' },
  ]

  const handleViewDetail = (nodeName: string, callTime: string) => {
    const route = NODE_ROUTE_MAP[nodeName]
    if (route && caseNo) {
      const matchedLog = CLAIMS_LOGS.find(
        log => log.caseNo === caseNo && callTime.startsWith(log.createdAt)
      )
      const taskId = matchedLog ? matchedLog.taskId : ''
      if (taskId) {
        navigate(`${route}?caseNo=${caseNo}&taskId=${taskId}`)
      }
    }
  }

  const renderPopoverContent = (label: string): React.ReactNode => {
    const calls = nodeCalls?.[label]
    if (!calls || calls.length === 0) return <div style={{ padding: '8px 12px', color: '#9ca3af' }}>暂无调用记录</div>
    return (
      <div style={{ padding: '4px 0' }}>
        {calls.map((c, ci) => (
          <div key={ci} style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', gap: 8, fontSize: 12 }}>
            <span style={{ color: '#6b7280', minWidth: 80 }}>{c.time}</span>
            <span style={{ color: c.success ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
              {c.success ? '成功' : '失败'}
            </span>
            {NODE_ROUTE_MAP[label] ? (
              <span
                style={{ color: '#3b82f6', cursor: 'pointer' }}
                onClick={() => handleViewDetail(label, c.time)}
              >
                查看详情 &gt;
              </span>
            ) : (
              <Tooltip title="详情页开发中">
                <span style={{ color: '#d1d5db', cursor: 'not-allowed' }}>查看详情 &gt;</span>
              </Tooltip>
            )}
          </div>
        ))}
      </div>
    )
  }

  // 卡片式节点渲染 - 交错布局
  const CARD_GAP_X = 36  // 横向间距
  const CARD_GAP_Y = 20  // 纵向交错偏移
  const CARD_MIN_WIDTH = 110
  const CARD_HEIGHT = 60
  const ROW_HEIGHT = CARD_HEIGHT + CARD_GAP_Y  // 每行高度

  const nodes = NODE_LABELS.map((label, i) => {
    const node = trajectory.nodes[i] || { label, status: 'processing' as NodeStatus }
    const isCompleted = node.status === 'completed'
    const nodeTime = isCompleted && nodeTimes ? nodeTimes[label] : undefined
    const labelText = nodeTime !== undefined ? `${label} (${nodeTime}s)` : label
    return { label, isCompleted, labelText, icon: isCompleted ? '✓' : '·' }
  })

  // 交错布局：偶数索引在上，奇数索引在下
  const isTop = (i: number) => i % 2 === 0
  const getCardY = (i: number) => isTop(i) ? 0 : CARD_GAP_Y

  const containerWidth = nodes.length * CARD_MIN_WIDTH + (nodes.length - 1) * CARD_GAP_X
  const containerHeight = ROW_HEIGHT  // 交错布局总高度 = 一行卡片 + 纵向偏移

  // 计算每个卡片的中心坐标
  const cardCenters = nodes.map((_, i) => ({
    x: CARD_MIN_WIDTH / 2 + i * (CARD_MIN_WIDTH + CARD_GAP_X),
    y: getCardY(i) + CARD_HEIGHT / 2,
  }))

  // 生成平滑 S 形曲线连接（纯三次贝塞尔，无直线段）
  const renderCurve = (i: number): React.ReactNode => {
    const p1 = cardCenters[i]
    const p2 = cardCenters[i + 1]
    const x1 = p1.x + CARD_MIN_WIDTH / 2  // 卡片 i 右侧边缘
    const x2 = p2.x - CARD_MIN_WIDTH / 2  // 卡片 i+1 左侧边缘
    const y1 = p1.y
    const y2 = p2.y

    // 真正的 S 形：控制点水平偏移，让曲线从水平方向开始/结束
    const offset = Math.abs(x2 - x1) * 0.4  // 控制点偏移量（40% 的跨度）
    const cp1X = x1 + offset
    const cp1Y = y1  // 第一个控制点与起点同高（水平出发）
    const cp2X = x2 - offset
    const cp2Y = y2  // 第二个控制点与终点同高（水平到达）

    const pathD = `M ${x1} ${y1} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${x2} ${y2}`

    // 连线颜色：已完成→已完成 绿色，其他 灰色
    const n1 = nodes[i]
    const n2 = nodes[i + 1]
    const isGreen = n1.isCompleted && n2.isCompleted
    const lineColorStart = isGreen ? '#b7eb8f' : '#e5e7eb'
    const lineColorEnd = isGreen ? '#52c41a' : '#9ca3af'

    // 渐变 ID：用 caseNo 做前缀，避免多个案件展开时 ID 冲突
    const gradientId = `curve-grad-${caseNo || 'default'}-${i}`

    return (
      <g key={`curve-${i}`}>
        <defs>
          <linearGradient id={gradientId} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={lineColorStart} />
            <stop offset="100%" stopColor={lineColorEnd} />
          </linearGradient>
        </defs>
        <path
          d={pathD}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={2}
          strokeDasharray="5 5"
          strokeLinecap="round"
        />
        {/* 圆点在终点处（连接后一个卡片处） */}
        <circle
          cx={x2}
          cy={y2}
          r={3.5}
          fill={lineColorEnd}
          stroke="#fff"
          strokeWidth={1}
        />
      </g>
    )
  }

  const renderCard = (node: typeof nodes[0], i: number): React.ReactNode => {
    const cardStyle: React.CSSProperties = {
      width: CARD_MIN_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: 12,
      border: node.isCompleted ? '1.5px solid #95de64' : '1px solid #e5e7eb',
      background: node.isCompleted ? '#f6ffed' : '#fff',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: 6,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      boxSizing: 'border-box',
    }

    const rowStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      width: '100%',
    }

    const iconCircleStyle: React.CSSProperties = {
      width: 18,
      height: 18,
      borderRadius: '50%',
      border: node.isCompleted ? '1.5px solid #52c41a' : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }

    const iconTextStyle: React.CSSProperties = {
      fontSize: 11,
      fontWeight: 'bold',
      color: node.isCompleted ? '#52c41a' : '#9ca3af',
      lineHeight: 1,
    }

    const labelStyle: React.CSSProperties = {
      fontSize: 13,
      fontWeight: 600,
      color: '#1f2937',
      lineHeight: 1.2,
    }

    const timeStyle: React.CSSProperties = {
      fontSize: 11,
      color: '#6b7280',
      lineHeight: 1.2,
    }

    // 提取节点名和处理时间
    const nodeTime = node.isCompleted && nodeTimes ? nodeTimes[node.label] : undefined
    const displayName = node.label
    const timeText = nodeTime !== undefined ? `${nodeTime}s` : '--'

    // 未执行节点：旋转加载动画（6 个圆点环形排列）
    const renderLoadingSpinner = (): React.ReactNode => {
      const totalPositions = 8
      const gapPosition = 1  // 缺口在右上（1:30 方向）
      const radius = 6
      const dotR = 1.6
      const dots: React.ReactNode[] = []
      for (let di = 0; di < totalPositions; di++) {
        if (di === gapPosition) continue
        const angle = (di / totalPositions) * Math.PI * 2 - Math.PI / 2
        const cx = 9 + radius * Math.cos(angle)
        const cy = 9 + radius * Math.sin(angle)
        dots.push(<circle key={di} cx={cx} cy={cy} r={dotR} fill="#9ca3af" />)
      }
      return (
        <svg width={18} height={18} viewBox="0 0 18 18">
          {dots}
        </svg>
      )
    }

    const cardContent = (
      <div style={cardStyle}>
        <div style={rowStyle}>
          <div style={iconCircleStyle}>
            {node.isCompleted ? (
              <span style={iconTextStyle}>✓</span>
            ) : (
              renderLoadingSpinner()
            )}
          </div>
          <span style={labelStyle}>{displayName}</span>
        </div>
        <div style={{ ...rowStyle }}>
          <span style={timeStyle}>处理时间：{timeText}</span>
        </div>
      </div>
    )

    // 用外层 div 占位（flex 布局），内部卡片绝对定位到正确位置
    const wrapperStyle: React.CSSProperties = {
      position: 'absolute',
      left: i * (CARD_MIN_WIDTH + CARD_GAP_X),
      top: getCardY(i),
      width: CARD_MIN_WIDTH,
      height: CARD_HEIGHT,
    }

    if (MIDDLE_NODES.includes(node.label) && node.isCompleted) {
      return (
        <div key={i} style={wrapperStyle}>
          <Popover
            content={renderPopoverContent(node.label)}
            trigger="hover"
            placement="top"
            rootClassName="node-call-popover"
            getPopupContainer={() => document.body}
          >
            <div style={{ cursor: 'pointer', width: '100%', height: '100%' }}>
              {cardContent}
            </div>
          </Popover>
        </div>
      )
    }

    return (
      <div key={i} style={wrapperStyle}>
        {cardContent}
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', background: '#f9fafb', borderRadius: 8, overflow: 'auto' }}>
      <div style={{ position: 'relative', minWidth: containerWidth, height: containerHeight }}>
        {/* 卡片层 */}
        <div style={{ position: 'relative', zIndex: 0 }}>
          {nodes.map((node, i) => renderCard(node, i))}
        </div>
        {/* SVG 曲线层（渲染在卡片之上，圆点覆盖卡片） */}
        <svg
          width={containerWidth}
          height={containerHeight}
          style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', zIndex: 1, pointerEvents: 'none' }}
        >
          {nodes.map((_, i) => i < nodes.length - 1 && renderCurve(i))}
        </svg>
      </div>
    </div>
  )
}

const titleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: 16,
  marginTop: 10,
}

const titleBarStyle: React.CSSProperties = {
  width: 4,
  height: 20,
  background: '#3b82f6',
  borderRadius: 10,
  marginRight: 10,
}

const titleTextStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#1f2937',
}

// ========== 主组件 ==========
interface CaseRecord {
  key: string
  caseNo: string
  claimNo: string
  branch: string
  accidentDate: string
  claimDate: string
  currentNode: string
  status: string
}

const MOCK_CASES: CaseRecord[] = [
  { key: '1', caseNo: 'A1000000000', claimNo: '0000000001', branch: '北京分公司', accidentDate: '2026-06-01', claimDate: '2026-06-02', currentNode: '采集智能体', status: 'processing' },
  { key: '2', caseNo: 'B1000000001', claimNo: '0000000002', branch: '上海分公司', accidentDate: '2026-05-30', claimDate: '2026-06-01', currentNode: '立案智能体', status: 'completed' },
  { key: '3', caseNo: 'C1000000002', claimNo: '0000000003', branch: '广州分公司', accidentDate: '2026-05-28', claimDate: '2026-05-30', currentNode: '理算智能体', status: 'processing' },
  { key: '4', caseNo: 'D1000000003', claimNo: '0000000004', branch: '深圳分公司', accidentDate: '2026-05-25', claimDate: '2026-05-27', currentNode: '扣费智能体', status: 'processing' },
  { key: '5', caseNo: 'E1000000004', claimNo: '0000000005', branch: '杭州分公司', accidentDate: '2026-05-22', claimDate: '2026-05-24', currentNode: '审核智能体', status: 'completed' },
  { key: '6', caseNo: 'F1000000005', claimNo: '0000000006', branch: '成都分公司', accidentDate: '2026-05-20', claimDate: '2026-05-22', currentNode: '采集智能体', status: 'processing' },
  { key: '7', caseNo: 'G1000000006', claimNo: '0000000007', branch: '武汉分公司', accidentDate: '2026-05-18', claimDate: '2026-05-20', currentNode: '立案智能体', status: 'completed' },
  { key: '8', caseNo: 'H1000000007', claimNo: '0000000008', branch: '南京分公司', accidentDate: '2026-05-15', claimDate: '2026-05-17', currentNode: '理算智能体', status: 'processing' },
  { key: '9', caseNo: 'I1000000008', claimNo: '0000000009', branch: '重庆分公司', accidentDate: '2026-05-14', claimDate: '2026-05-16', currentNode: '审核智能体', status: 'processing' },
  { key: '10', caseNo: 'J1000000009', claimNo: '0000000010', branch: '天津分公司', accidentDate: '2026-05-12', claimDate: '2026-05-14', currentNode: '扣费智能体', status: 'completed' },
  { key: '10b', caseNo: 'K1000000010', claimNo: '0000000010', branch: '济南分公司', accidentDate: '2026-05-11', claimDate: '2026-05-13', currentNode: '立案智能体', status: 'completed' },
  { key: '11', caseNo: 'L1000000011', claimNo: '0000000011', branch: '苏州分公司', accidentDate: '2026-05-10', claimDate: '2026-05-12', currentNode: '采集智能体', status: 'processing' },
  { key: '12', caseNo: 'M1000000012', claimNo: '0000000012', branch: '长沙分公司', accidentDate: '2026-05-08', claimDate: '2026-05-10', currentNode: '立案智能体', status: 'completed' },
  { key: '13', caseNo: 'N1000000013', claimNo: '0000000013', branch: '西安分公司', accidentDate: '2026-05-06', claimDate: '2026-05-08', currentNode: '理算智能体', status: 'processing' },
  { key: '14', caseNo: 'O1000000014', claimNo: '0000000014', branch: '郑州分公司', accidentDate: '2026-05-04', claimDate: '2026-05-06', currentNode: '扣费智能体', status: 'processing' },
  { key: '15', caseNo: 'P1000000015', claimNo: '0000000015', branch: '合肥分公司', accidentDate: '2026-05-02', claimDate: '2026-05-04', currentNode: '审核智能体', status: 'completed' },
  { key: '16', caseNo: 'Q1000000016', claimNo: '0000000016', branch: '北京分公司', accidentDate: '2026-04-30', claimDate: '2026-05-02', currentNode: '采集智能体', status: 'processing' },
  { key: '17', caseNo: 'R1000000017', claimNo: '0000000017', branch: '上海分公司', accidentDate: '2026-04-28', claimDate: '2026-04-30', currentNode: '立案智能体', status: 'completed' },
  { key: '18', caseNo: 'S1000000018', claimNo: '0000000018', branch: '广州分公司', accidentDate: '2026-04-26', claimDate: '2026-04-28', currentNode: '理算智能体', status: 'processing' },
  { key: '19', caseNo: 'T1000000019', claimNo: '0000000019', branch: '深圳分公司', accidentDate: '2026-04-24', claimDate: '2026-04-26', currentNode: '扣费智能体', status: 'processing' },
  { key: '20', caseNo: 'U1000000020', claimNo: '0000000020', branch: '杭州分公司', accidentDate: '2026-04-22', claimDate: '2026-04-24', currentNode: '审核智能体', status: 'completed' },
]

const MetricsClaims: React.FC = () => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const [caseNoFilter, setCaseNoFilter] = useState('')
  const [claimNoFilter, setClaimNoFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [accidentDateFilter, setAccidentDateFilter] = useState('')
  const [claimDateFilter, setClaimDateFilter] = useState('')
  const [nodeFilter, setNodeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredData = React.useMemo(() => {
    return MOCK_CASES.filter(r =>
      (!caseNoFilter || r.caseNo.includes(caseNoFilter)) &&
      (!claimNoFilter || r.claimNo.includes(claimNoFilter)) &&
      (!branchFilter || r.branch.includes(branchFilter)) &&
      (!accidentDateFilter || r.accidentDate.includes(accidentDateFilter)) &&
      (!claimDateFilter || r.claimDate.includes(claimDateFilter)) &&
      (!nodeFilter || r.currentNode.includes(nodeFilter)) &&
      (!statusFilter || r.status.includes(statusFilter))
    )
  }, [caseNoFilter, claimNoFilter, branchFilter, accidentDateFilter, claimDateFilter, nodeFilter, statusFilter])

  const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const clearFilters = () => {
    setCaseNoFilter('')
    setClaimNoFilter('')
    setBranchFilter('')
    setAccidentDateFilter('')
    setClaimDateFilter('')
    setNodeFilter('')
    setStatusFilter('')
    setCurrentPage(1)
  }

  const columns: ColumnsType<CaseRecord> = [
    {
      title: '案件号',
      dataIndex: 'caseNo',
      key: 'caseNo',
      width: 160,
      render: (text: string, record: CaseRecord) => (
        <span
          style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => {
            setExpandedRowKeys(prev => prev.includes(record.caseNo) ? prev.filter(k => k !== record.caseNo) : [...prev, record.caseNo])
          }}
        >
          {text}
        </span>
      ),
    },
    { title: '索赔号', dataIndex: 'claimNo', key: 'claimNo', width: 160 },
    { title: '分公司', dataIndex: 'branch', key: 'branch', width: 120 },
    { title: '出险日期', dataIndex: 'accidentDate', key: 'accidentDate', width: 120 },
    { title: '索赔日期', dataIndex: 'claimDate', key: 'claimDate', width: 120 },
    { title: '当前所处节点', dataIndex: 'currentNode', key: 'currentNode', width: 130 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const s = STATUS_MAP[status] ?? { color: 'default', text: status }
        return <Tag color={s.color} style={{ borderRadius: 6 }}>{s.text}</Tag>
      },
    },
  ]

  const expandedRowRender = (record: CaseRecord) => {
    const trajectory = generateFlowTrajectory(record.caseNo, record.status)
    return <FlowTrajectoryGraph trajectory={trajectory} caseNo={record.caseNo} />
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6',
      padding: '14px 24px 34px',
    }}>
      <div style={titleStyle}>
        <div style={titleBarStyle} />
        <span style={titleTextStyle}>指标看板</span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {METRICS_CLAIMS.map((m, i) => (
          <div key={i} style={{ flex: 1 }}>
            <MetricCard metric={m} />
          </div>
        ))}
      </div>
      <Row gutter={[16, 16]} style={{ marginTop: 28 }}>
        <Col span={24}>
          <CaseProcessingChart />
        </Col>
      </Row>

      <div style={{ ...titleStyle, marginTop: 30 }}>
        <div style={titleBarStyle} />
        <span style={titleTextStyle}>案件清单</span>
      </div>

      {/* 查询区 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
        alignItems: 'center',
      }}>
        <Input
          placeholder="案件号"
          value={caseNoFilter}
          onChange={e => { setCaseNoFilter(e.target.value); setCurrentPage(1) }}
          allowClear
          style={{ width: 140 }}
        />
        <Input
          placeholder="索赔号"
          value={claimNoFilter}
          onChange={e => { setClaimNoFilter(e.target.value); setCurrentPage(1) }}
          allowClear
          style={{ width: 140 }}
        />
        <Input
          placeholder="分公司"
          value={branchFilter}
          onChange={e => { setBranchFilter(e.target.value); setCurrentPage(1) }}
          allowClear
          style={{ width: 130 }}
        />
        <Input
          placeholder="出险日期"
          value={accidentDateFilter}
          onChange={e => { setAccidentDateFilter(e.target.value); setCurrentPage(1) }}
          allowClear
          style={{ width: 120 }}
        />
        <Input
          placeholder="索赔日期"
          value={claimDateFilter}
          onChange={e => { setClaimDateFilter(e.target.value); setCurrentPage(1) }}
          allowClear
          style={{ width: 120 }}
        />
        <Select
          placeholder="当前所处节点"
          value={nodeFilter || undefined}
          onChange={val => { setNodeFilter(val || ''); setCurrentPage(1) }}
          allowClear
          options={[
            { label: '采集智能体', value: '采集智能体' },
            { label: '立案智能体', value: '立案智能体' },
            { label: '理算智能体', value: '理算智能体' },
            { label: '扣费智能体', value: '扣费智能体' },
            { label: '审核智能体', value: '审核智能体' },
          ]}
          style={{ width: 130 }}
          rootClassName="filter-select"
        />
        <Select
          placeholder="状态"
          value={statusFilter || undefined}
          onChange={val => { setStatusFilter(val || ''); setCurrentPage(1) }}
          allowClear
          options={[
            { label: '处理中', value: 'processing' },
            { label: '已完成', value: 'completed' },
          ]}
          style={{ width: 100 }}
          rootClassName="filter-select"
        />
        <Button onClick={clearFilters}>重置</Button>
      </div>

      <Table
        columns={columns}
        dataSource={pagedData}
        pagination={false}
        size="small"
        rowKey="caseNo"
        expandable={{
          expandedRowKeys,
          onExpand: (expanded, record) => {
            setExpandedRowKeys(prev => expanded ? [...prev, record.caseNo] : prev.filter(k => k !== record.caseNo))
          },
          expandedRowRender,
          expandIconColumnIndex: -1,
        }}
      />

      {/* 底部栏 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#000000e0' }}>共 {filteredData.length} 条数据</span>
          <button
            onClick={() => console.log('导出')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#65a5ff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            结果导出
          </button>
        </div>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={['10', '20', '50']}
          onChange={(page, size) => { setCurrentPage(page); if (size !== pageSize) { setPageSize(size); setCurrentPage(1) } }}
          size="small"
        />
      </div>
    </div>
  )
}

export default MetricsClaims
