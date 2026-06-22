import React, { useState, useMemo } from 'react'
import { Table, Tag, Pagination, Input, Button, Space, Select, DatePicker } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const AGENT_TABS = ['采集', '立案', '扣费', '理算', '审核'] as const
type AgentTab = typeof AGENT_TABS[number]

// ── 采集智能体日志 ──

interface CollectionLogRecord {
  key: string
  taskId: string
  requestId: string
  caseNo: string
  claimNo: string
  status: string
  createdAt: string
  platformTime: string
  engineTime: string
  queryDataTime: string
  isMedicalRecord: boolean
  engineMsg: string
  imageCount: number
}

const MOCK_COLLECTION_LOGS: CollectionLogRecord[] = [
  { key: '1', taskId: '2044719745388838912', requestId: 'a001', caseNo: 'A1000000000', claimNo: '0000000001', status: 'success', createdAt: '2026-06-02 10:23', platformTime: '25s 137ms', engineTime: '24s 882ms', queryDataTime: '956ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 23 },
  { key: '2', taskId: '2044719745288838912', requestId: 'a002', caseNo: 'A1000000000', claimNo: '0000000001', status: 'success', createdAt: '2026-06-02 10:25', platformTime: '32s 174ms', engineTime: '31s 865ms', queryDataTime: '602ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 34 },
  { key: '3', taskId: '2044719745188838912', requestId: 'b003', caseNo: 'B1000000001', claimNo: '0000000002', status: 'failed', createdAt: '2026-06-01 09:15', platformTime: '39s 211ms', engineTime: '38s 11ms', queryDataTime: '1s 626ms', isMedicalRecord: false, engineMsg: '引擎超时', imageCount: 45 },
  { key: '4', taskId: '2044719745088838912', requestId: 'b004', caseNo: 'B1000000001', claimNo: '0000000002', status: 'success', createdAt: '2026-06-01 09:16', platformTime: '46s 248ms', engineTime: '45s 48ms', queryDataTime: '1s 503ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 56 },
  { key: '5', taskId: '2044719744988838912', requestId: 'b005', caseNo: 'B1000000001', claimNo: '0000000002', status: 'success', createdAt: '2026-06-01 09:17', platformTime: '53s 285ms', engineTime: '52s 85ms', queryDataTime: '1s 414ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 67 },
  { key: '6', taskId: '2044719744888838912', requestId: 'b006', caseNo: 'B1000000001', claimNo: '0000000002', status: 'failed', createdAt: '2026-06-01 09:18', platformTime: '1m 0s 322ms', engineTime: '59s 122ms', queryDataTime: '1s 071ms', isMedicalRecord: false, engineMsg: '引擎超时', imageCount: 78 },
  { key: '7', taskId: '2044719744788838912', requestId: 'c007', caseNo: 'C1000000002', claimNo: '0000000003', status: 'success', createdAt: '2026-05-30 14:10', platformTime: '1m 7s 359ms', engineTime: '1m 6s 159ms', queryDataTime: '919ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 89 },
  { key: '8', taskId: '2044719744688838912', requestId: 'd008', caseNo: 'D1000000003', claimNo: '0000000004', status: 'success', createdAt: '2026-05-27 11:00', platformTime: '1m 14s 396ms', engineTime: '1m 13s 196ms', queryDataTime: '2s 733ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 20 },
  { key: '9', taskId: '2044719744588838912', requestId: 'd009', caseNo: 'D1000000003', claimNo: '0000000004', status: 'failed', createdAt: '2026-05-27 11:01', platformTime: '1m 21s 433ms', engineTime: '1m 20s 233ms', queryDataTime: '856ms', isMedicalRecord: false, engineMsg: '引擎超时', imageCount: 31 },
  { key: '10', taskId: '2044719744488838912', requestId: 'e010', caseNo: 'E1000000004', claimNo: '0000000005', status: 'success', createdAt: '2026-05-24 08:30', platformTime: '1m 28s 470ms', engineTime: '1m 27s 270ms', queryDataTime: '2s 918ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 42 },
  { key: '11', taskId: '2044719744388838912', requestId: 'e011', caseNo: 'E1000000004', claimNo: '0000000005', status: 'success', createdAt: '2026-05-24 08:31', platformTime: '1m 35s 507ms', engineTime: '1m 34s 307ms', queryDataTime: '2s 228ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 53 },
  { key: '12', taskId: '2044719744288838912', requestId: 'e012', caseNo: 'E1000000004', claimNo: '0000000005', status: 'failed', createdAt: '2026-05-24 08:32', platformTime: '22s 544ms', engineTime: '21s 344ms', queryDataTime: '630ms', isMedicalRecord: false, engineMsg: '引擎超时', imageCount: 64 },
  { key: '13', taskId: '2044719744188838912', requestId: 'f013', caseNo: 'F1000000005', claimNo: '0000000006', status: 'success', createdAt: '2026-05-22 16:00', platformTime: '29s 581ms', engineTime: '28s 381ms', queryDataTime: '622ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 75 },
  { key: '14', taskId: '2044719744088838912', requestId: 'g014', caseNo: 'G1000000006', claimNo: '0000000007', status: 'success', createdAt: '2026-05-20 13:00', platformTime: '36s 618ms', engineTime: '35s 418ms', queryDataTime: '883ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 86 },
  { key: '15', taskId: '2044719743988838912', requestId: 'g015', caseNo: 'G1000000006', claimNo: '0000000007', status: 'failed', createdAt: '2026-05-20 13:01', platformTime: '43s 655ms', engineTime: '42s 455ms', queryDataTime: '1s 395ms', isMedicalRecord: false, engineMsg: '引擎超时', imageCount: 17 },
  { key: '16', taskId: '2044719743888838912', requestId: 'h016', caseNo: 'H1000000007', claimNo: '0000000008', status: 'success', createdAt: '2026-05-17 10:00', platformTime: '50s 692ms', engineTime: '49s 492ms', queryDataTime: '1s 452ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 28 },
  { key: '17', taskId: '2044719743788838912', requestId: 'i017', caseNo: 'I1000000008', claimNo: '0000000009', status: 'success', createdAt: '2026-05-16 09:00', platformTime: '57s 729ms', engineTime: '56s 529ms', queryDataTime: '2s 569ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 39 },
  { key: '18', taskId: '2044719743688838912', requestId: 'i018', caseNo: 'I1000000008', claimNo: '0000000009', status: 'failed', createdAt: '2026-05-16 09:01', platformTime: '1m 4s 766ms', engineTime: '1m 3s 566ms', queryDataTime: '2s 965ms', isMedicalRecord: false, engineMsg: '引擎超时', imageCount: 50 },
  { key: '19', taskId: '2044719743588838912', requestId: 'j019', caseNo: 'J1000000009', claimNo: '0000000010', status: 'success', createdAt: '2026-05-14 14:30', platformTime: '1m 11s 803ms', engineTime: '1m 10s 603ms', queryDataTime: '608ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 61 },
  { key: '20', taskId: '2044719743488838912', requestId: 'j020', caseNo: 'J1000000009', claimNo: '0000000010', status: 'success', createdAt: '2026-05-14 14:31', platformTime: '1m 18s 840ms', engineTime: '1m 17s 640ms', queryDataTime: '2s 798ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 72 },
  { key: '21', taskId: '2044719743388838912', requestId: 'j021', caseNo: 'J1000000009', claimNo: '0000000010', status: 'failed', createdAt: '2026-05-14 14:32', platformTime: '1m 25s 877ms', engineTime: '1m 24s 677ms', queryDataTime: '1s 314ms', isMedicalRecord: false, engineMsg: '引擎超时', imageCount: 83 },
  { key: '22', taskId: '2044719743288838912', requestId: 'k022', caseNo: 'K1000000010', claimNo: '0000000010', status: 'success', createdAt: '2026-05-13 10:00', platformTime: '1m 32s 914ms', engineTime: '1m 31s 714ms', queryDataTime: '2s 732ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 14 },
  { key: '23', taskId: '2044719743188838912', requestId: 'k023', caseNo: 'K1000000010', claimNo: '0000000010', status: 'success', createdAt: '2026-05-13 10:02', platformTime: '19s 951ms', engineTime: '18s 751ms', queryDataTime: '2s 218ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 25 },
  { key: '24', taskId: '2044719743088838912', requestId: 'l024', caseNo: 'L1000000011', claimNo: '0000000011', status: 'failed', createdAt: '2026-05-12 11:00', platformTime: '26s 988ms', engineTime: '25s 788ms', queryDataTime: '1s 402ms', isMedicalRecord: false, engineMsg: '引擎超时', imageCount: 36 },
  { key: '25', taskId: '2044719742988838912', requestId: 'm025', caseNo: 'M1000000012', claimNo: '0000000012', status: 'success', createdAt: '2026-05-10 15:00', platformTime: '33s 126ms', engineTime: '32s 474ms', queryDataTime: '2s 339ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 47 },
  { key: '26', taskId: '2044719742888838912', requestId: 'm026', caseNo: 'M1000000012', claimNo: '0000000012', status: 'success', createdAt: '2026-05-10 15:01', platformTime: '40s 163ms', engineTime: '39s 457ms', queryDataTime: '2s 913ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 58 },
  { key: '27', taskId: '2044719742788838912', requestId: 'n027', caseNo: 'N1000000013', claimNo: '0000000013', status: 'failed', createdAt: '2026-05-08 09:30', platformTime: '47s 200ms', engineTime: '46s 440ms', queryDataTime: '1s 639ms', isMedicalRecord: false, engineMsg: '引擎超时', imageCount: 69 },
  { key: '28', taskId: '2044719742688838912', requestId: 'o028', caseNo: 'O1000000014', claimNo: '0000000014', status: 'success', createdAt: '2026-05-06 10:00', platformTime: '54s 237ms', engineTime: '53s 37ms', queryDataTime: '526ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 80 },
  { key: '29', taskId: '2044719742588838912', requestId: 'o029', caseNo: 'O1000000014', claimNo: '0000000014', status: 'success', createdAt: '2026-05-06 10:01', platformTime: '1m 1s 274ms', engineTime: '1m 0s 74ms', queryDataTime: '1s 153ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 91 },
  { key: '30', taskId: '2044719742488838912', requestId: 'p030', caseNo: 'P1000000015', claimNo: '0000000015', status: 'failed', createdAt: '2026-05-04 08:00', platformTime: '1m 8s 311ms', engineTime: '1m 7s 111ms', queryDataTime: '2s 231ms', isMedicalRecord: false, engineMsg: '引擎超时', imageCount: 22 },
  { key: '31', taskId: '2044719742388838912', requestId: 'q031', caseNo: 'Q1000000016', claimNo: '0000000016', status: 'success', createdAt: '2026-05-02 12:00', platformTime: '1m 15s 348ms', engineTime: '1m 14s 148ms', queryDataTime: '1s 893ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 33 },
  { key: '32', taskId: '2044719742288838912', requestId: 'q032', caseNo: 'Q1000000016', claimNo: '0000000016', status: 'success', createdAt: '2026-05-02 12:01', platformTime: '1m 22s 385ms', engineTime: '1m 21s 185ms', queryDataTime: '1s 638ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 44 },
  { key: '33', taskId: '2044719742188838912', requestId: 'q033', caseNo: 'Q1000000016', claimNo: '0000000016', status: 'failed', createdAt: '2026-05-02 12:02', platformTime: '1m 29s 422ms', engineTime: '1m 28s 222ms', queryDataTime: '1s 136ms', isMedicalRecord: false, engineMsg: '引擎超时', imageCount: 55 },
  { key: '34', taskId: '2044719742088838912', requestId: 'r034', caseNo: 'R1000000017', claimNo: '0000000017', status: 'success', createdAt: '2026-04-30 16:30', platformTime: '1m 36s 459ms', engineTime: '1m 35s 259ms', queryDataTime: '1s 381ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 66 },
  { key: '35', taskId: '2044719741988838912', requestId: 's035', caseNo: 'S1000000018', claimNo: '0000000018', status: 'success', createdAt: '2026-04-28 14:00', platformTime: '23s 496ms', engineTime: '22s 296ms', queryDataTime: '1s 878ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 77 },
  { key: '36', taskId: '2044719741888838912', requestId: 's036', caseNo: 'S1000000018', claimNo: '0000000018', status: 'failed', createdAt: '2026-04-28 14:01', platformTime: '30s 533ms', engineTime: '29s 333ms', queryDataTime: '918ms', isMedicalRecord: false, engineMsg: '引擎超时', imageCount: 88 },
  { key: '37', taskId: '2044719741788838912', requestId: 't037', caseNo: 'T1000000019', claimNo: '0000000019', status: 'success', createdAt: '2026-04-26 09:00', platformTime: '37s 570ms', engineTime: '36s 370ms', queryDataTime: '879ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 19 },
  { key: '38', taskId: '2044719741688838912', requestId: 'u038', caseNo: 'U1000000020', claimNo: '0000000020', status: 'success', createdAt: '2026-04-24 11:30', platformTime: '44s 607ms', engineTime: '43s 407ms', queryDataTime: '2s 056ms', isMedicalRecord: true, engineMsg: '处理成功', imageCount: 30 },
  { key: '39', taskId: '2044719741588838912', requestId: 'u039', caseNo: 'U1000000020', claimNo: '0000000020', status: 'failed', createdAt: '2026-04-24 11:31', platformTime: '51s 644ms', engineTime: '50s 444ms', queryDataTime: '896ms', isMedicalRecord: true, engineMsg: '引擎超时', imageCount: 41 },
]

// ── 扣费智能体日志 ──

interface DeductionLogRecord {
  key: string
  taskId: string
  requestId: string
  caseNo: string
  billNo: string
  callTime: string
  completeTime: string
  execStatus: 'success' | 'failed' | 'processing' | 'timeout'
  platformTime: string
  medicalTime: string
  commercialTime: string
  policyCore: string
  insuranceCode: string
  clauseName: string
  liabilityType: string
  totalItems: number
  deductionItems: number
  aiRiskItems: number
}

const MOCK_DEDUCTION_LOGS: DeductionLogRecord[] = [
  { key: '1', taskId: '2044719741488838912', requestId: 'req-d001', caseNo: 'A1000000000', billNo: 'BLL-2026060201', callTime: '2026-06-02 10:23:15', completeTime: '2026-06-02 10:23:40', execStatus: 'success', platformTime: '25s 137ms', medicalTime: '12s 456ms', commercialTime: '12s 681ms', policyCore: '医保', insuranceCode: 'INS-MED-001', clauseName: '基本医疗保险条款', liabilityType: '医保内', totalItems: 48, deductionItems: 3, aiRiskItems: 2 },
  { key: '2', taskId: '2044719741388838912', requestId: 'req-d002', caseNo: 'A1000000000', billNo: 'BLL-2026060202', callTime: '2026-06-02 10:25:30', completeTime: '—', execStatus: 'processing', platformTime: '32s 174ms', medicalTime: '—', commercialTime: '—', policyCore: '商保', insuranceCode: 'INS-COM-002', clauseName: '商业医疗保险附加条款', liabilityType: '商保内', totalItems: 36, deductionItems: 0, aiRiskItems: 0 },
  { key: '3', taskId: '2044719741288838912', requestId: 'req-d003', caseNo: 'B1000000001', billNo: 'BLL-2026060101', callTime: '2026-06-01 09:15:00', completeTime: '—', execStatus: 'timeout', platformTime: '12m 35s 211ms', medicalTime: '—', commercialTime: '—', policyCore: '医保', insuranceCode: 'INS-MED-003', clauseName: '重大疾病保险条款', liabilityType: '医保外', totalItems: 52, deductionItems: 0, aiRiskItems: 0 },
  { key: '4', taskId: '2044719741188838912', requestId: 'req-d004', caseNo: 'B1000000001', billNo: 'BLL-2026060102', callTime: '2026-06-01 09:16:22', completeTime: '2026-06-01 09:17:08', execStatus: 'success', platformTime: '46s 248ms', medicalTime: '22s 110ms', commercialTime: '24s 138ms', policyCore: '商保', insuranceCode: 'INS-COM-004', clauseName: '意外伤害保险条款', liabilityType: '商保内', totalItems: 28, deductionItems: 2, aiRiskItems: 1 },
  { key: '5', taskId: '2044719741088838912', requestId: 'req-d005', caseNo: 'B1000000001', billNo: 'BLL-2026060103', callTime: '2026-06-01 09:17:45', completeTime: '—', execStatus: 'failed', platformTime: '18s 285ms', medicalTime: '—', commercialTime: '—', policyCore: '医保', insuranceCode: 'INS-MED-005', clauseName: '住院医疗保险条款', liabilityType: '医保内', totalItems: 64, deductionItems: 0, aiRiskItems: 0 },
  { key: '6', taskId: '2044719740988838912', requestId: 'req-d006', caseNo: 'B1000000001', billNo: 'BLL-2026060104', callTime: '2026-06-01 09:18:10', completeTime: '—', execStatus: 'failed', platformTime: '18s 322ms', medicalTime: '—', commercialTime: '—', policyCore: '商保', insuranceCode: 'INS-COM-006', clauseName: '门诊医疗保险条款', liabilityType: '责任控费', totalItems: 15, deductionItems: 0, aiRiskItems: 0 },
  { key: '7', taskId: '2044719740888838912', requestId: 'req-d007', caseNo: 'C1000000002', billNo: 'BLL-2026053001', callTime: '2026-05-30 14:10:05', completeTime: '2026-05-30 14:11:12', execStatus: 'success', platformTime: '1m 7s 359ms', medicalTime: '33s 200ms', commercialTime: '34s 159ms', policyCore: '医保', insuranceCode: 'INS-MED-007', clauseName: '城乡居民基本医疗保险条款', liabilityType: '医保内', totalItems: 72, deductionItems: 6, aiRiskItems: 3 },
  { key: '8', taskId: '2044719740788838912', requestId: 'req-d008', caseNo: 'D1000000003', billNo: 'BLL-2026052701', callTime: '2026-05-27 11:00:30', completeTime: '—', execStatus: 'processing', platformTime: '1m 14s 396ms', medicalTime: '—', commercialTime: '—', policyCore: '商保', insuranceCode: 'INS-COM-008', clauseName: '高端医疗保险条款', liabilityType: '商保内', totalItems: 40, deductionItems: 0, aiRiskItems: 0 },
  { key: '9', taskId: '2044719740688838912', requestId: 'req-d009', caseNo: 'D1000000003', billNo: 'BLL-2026052702', callTime: '2026-05-27 11:01:15', completeTime: '—', execStatus: 'timeout', platformTime: '15m 22s 433ms', medicalTime: '—', commercialTime: '—', policyCore: '医保', insuranceCode: 'INS-MED-009', clauseName: '大病保险补充条款', liabilityType: '医保外', totalItems: 88, deductionItems: 0, aiRiskItems: 0 },
  { key: '10', taskId: '2044719740588838912', requestId: 'req-d010', caseNo: 'E1000000004', billNo: 'BLL-2026052401', callTime: '2026-05-24 08:30:00', completeTime: '2026-05-24 08:31:27', execStatus: 'success', platformTime: '1m 28s 470ms', medicalTime: '44s 100ms', commercialTime: '44s 370ms', policyCore: '商保', insuranceCode: 'INS-COM-010', clauseName: '团体医疗保险条款', liabilityType: '商保内', totalItems: 55, deductionItems: 7, aiRiskItems: 5 },
  { key: '11', taskId: '2044719740488838912', requestId: 'req-d011', caseNo: 'E1000000004', billNo: 'BLL-2026052402', callTime: '2026-05-24 08:31:45', completeTime: '2026-05-24 08:33:20', execStatus: 'success', platformTime: '1m 35s 507ms', medicalTime: '47s 200ms', commercialTime: '48s 307ms', policyCore: '医保', insuranceCode: 'INS-MED-011', clauseName: '职工基本医疗保险条款', liabilityType: '医保内', totalItems: 33, deductionItems: 2, aiRiskItems: 1 },
  { key: '12', taskId: '2044719740388838912', requestId: 'req-d012', caseNo: 'E1000000004', billNo: 'BLL-2026052403', callTime: '2026-05-24 08:32:30', completeTime: '—', execStatus: 'failed', platformTime: '22s 544ms', medicalTime: '—', commercialTime: '—', policyCore: '商保', insuranceCode: 'INS-COM-012', clauseName: '特药医疗保险条款', liabilityType: '责任控费', totalItems: 19, deductionItems: 0, aiRiskItems: 0 },
  { key: '13', taskId: '2044719740288838912', requestId: 'req-d013', caseNo: 'F1000000005', billNo: 'BLL-2026052201', callTime: '2026-05-22 16:00:00', completeTime: '2026-05-22 16:00:29', execStatus: 'success', platformTime: '29s 581ms', medicalTime: '14s 600ms', commercialTime: '14s 981ms', policyCore: '医保', insuranceCode: 'INS-MED-013', clauseName: '新农合医疗保险条款', liabilityType: '医保内', totalItems: 27, deductionItems: 1, aiRiskItems: 0 },
  { key: '14', taskId: '2044719740188838912', requestId: 'req-d014', caseNo: 'G1000000006', billNo: 'BLL-2026052001', callTime: '2026-05-20 13:00:00', completeTime: '—', execStatus: 'processing', platformTime: '36s 618ms', medicalTime: '—', commercialTime: '—', policyCore: '商保', insuranceCode: 'INS-COM-014', clauseName: '百万医疗保险条款', liabilityType: '商保内', totalItems: 45, deductionItems: 0, aiRiskItems: 0 },
  { key: '15', taskId: '2044719740088838912', requestId: 'req-d015', caseNo: 'G1000000006', billNo: 'BLL-2026052002', callTime: '2026-05-20 13:01:20', completeTime: '—', execStatus: 'timeout', platformTime: '11m 48s 655ms', medicalTime: '—', commercialTime: '—', policyCore: '医保', insuranceCode: 'INS-MED-015', clauseName: '生育保险条款', liabilityType: '医保外', totalItems: 12, deductionItems: 0, aiRiskItems: 0 },
  { key: '16', taskId: '2044719739988838912', requestId: 'req-d016', caseNo: 'H1000000007', billNo: 'BLL-2026051701', callTime: '2026-05-17 10:00:00', completeTime: '2026-05-17 10:00:50', execStatus: 'success', platformTime: '50s 692ms', medicalTime: '25s 200ms', commercialTime: '25s 492ms', policyCore: '商保', insuranceCode: 'INS-COM-016', clauseName: '重疾险附加医疗条款', liabilityType: '商保内', totalItems: 60, deductionItems: 4, aiRiskItems: 2 },
  { key: '17', taskId: '2044719739888838912', requestId: 'req-d017', caseNo: 'I1000000008', billNo: 'BLL-2026051601', callTime: '2026-05-16 09:00:00', completeTime: '2026-05-16 09:00:57', execStatus: 'success', platformTime: '57s 729ms', medicalTime: '28s 800ms', commercialTime: '28s 929ms', policyCore: '医保', insuranceCode: 'INS-MED-017', clauseName: '工伤保险条款', liabilityType: '医保内', totalItems: 38, deductionItems: 3, aiRiskItems: 1 },
  { key: '18', taskId: '2044719739788838912', requestId: 'req-d018', caseNo: 'I1000000008', billNo: 'BLL-2026051602', callTime: '2026-05-16 09:01:30', completeTime: '—', execStatus: 'failed', platformTime: '15s 766ms', medicalTime: '—', commercialTime: '—', policyCore: '商保', insuranceCode: 'INS-COM-018', clauseName: '留学人员医疗保险条款', liabilityType: '责任控费', totalItems: 22, deductionItems: 0, aiRiskItems: 0 },
  { key: '19', taskId: '2044719739688838912', requestId: 'req-d019', caseNo: 'J1000000009', billNo: 'BLL-2026051401', callTime: '2026-05-14 14:30:00', completeTime: '2026-05-14 14:31:11', execStatus: 'success', platformTime: '1m 11s 803ms', medicalTime: '35s 500ms', commercialTime: '36s 303ms', policyCore: '医保', insuranceCode: 'INS-MED-019', clauseName: '失业保险医疗补助条款', liabilityType: '医保内', totalItems: 50, deductionItems: 5, aiRiskItems: 3 },
  { key: '20', taskId: '2044719739588838912', requestId: 'req-d020', caseNo: 'J1000000009', billNo: 'BLL-2026051402', callTime: '2026-05-14 14:31:40', completeTime: '—', execStatus: 'processing', platformTime: '1m 18s 840ms', medicalTime: '—', commercialTime: '—', policyCore: '商保', insuranceCode: 'INS-COM-020', clauseName: '防癌医疗保险条款', liabilityType: '商保内', totalItems: 44, deductionItems: 0, aiRiskItems: 0 },
]

const titleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: 20,
  marginTop: 0,
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

const deductionStatusMap: Record<string, { color: string; text: string }> = {
  success: { color: 'success', text: '成功' },
  failed: { color: 'error', text: '失败' },
  processing: { color: 'processing', text: '处理中' },
  timeout: { color: 'warning', text: '超时' },
}

const AgentClaimsLogs: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultTab = (searchParams.get('tab') as AgentTab) || '采集'
  const [activeTab, setActiveTab] = useState<AgentTab>(defaultTab)
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // 采集筛选
  const [collectionTaskId, setCollectionTaskId] = useState('')
  const [collectionClaimNo, setCollectionClaimNo] = useState('')
  const [collectionCreatedAt, setCollectionCreatedAt] = useState<dayjs.Dayjs | null>(null)

  // 扣费筛选
  const [deductionTaskId, setDeductionTaskId] = useState('')
  const [deductionCaseNo, setDeductionCaseNo] = useState('')
  const [deductionBillNo, setDeductionBillNo] = useState('')
  const [deductionPolicyCore, setDeductionPolicyCore] = useState('')
  const [deductionInsuranceCode, setDeductionInsuranceCode] = useState('')
  const [deductionItemsCount, setDeductionItemsCount] = useState('')
  const [deductionExecStatus, setDeductionExecStatus] = useState('')

  // 采集数据
  const filteredCollection = useMemo(() => {
    return MOCK_COLLECTION_LOGS.filter(r =>
      (!collectionTaskId || r.taskId.includes(collectionTaskId)) &&
      (!collectionClaimNo || r.claimNo.includes(collectionClaimNo)) &&
      (!collectionCreatedAt || r.createdAt === collectionCreatedAt.format('YYYY-MM-DD HH:mm:ss'))
    )
  }, [collectionTaskId, collectionClaimNo, collectionCreatedAt])

  const pagedCollection = useMemo(
    () => filteredCollection.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredCollection, currentPage, pageSize]
  )

  // 扣费数据
  const filteredDeduction = useMemo(() => {
    return MOCK_DEDUCTION_LOGS.filter(r =>
      (!deductionTaskId || r.taskId.includes(deductionTaskId)) &&
      (!deductionCaseNo || r.caseNo.includes(deductionCaseNo)) &&
      (!deductionBillNo || r.billNo.includes(deductionBillNo)) &&
      (!deductionPolicyCore || r.policyCore.includes(deductionPolicyCore)) &&
      (!deductionInsuranceCode || r.insuranceCode.includes(deductionInsuranceCode)) &&
      (deductionItemsCount === '' || String(r.deductionItems).includes(deductionItemsCount)) &&
      (deductionExecStatus === '' || r.execStatus === deductionExecStatus)
    )
  }, [deductionTaskId, deductionCaseNo, deductionBillNo, deductionPolicyCore, deductionInsuranceCode, deductionItemsCount, deductionExecStatus])

  const pagedDeduction = useMemo(
    () => filteredDeduction.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredDeduction, currentPage, pageSize]
  )

  const clearCollectionFilters = () => {
    setCollectionTaskId('')
    setCollectionClaimNo('')
    setCollectionCreatedAt(null)
    setCurrentPage(1)
  }

  const clearDeductionFilters = () => {
    setDeductionTaskId('')
    setDeductionCaseNo('')
    setDeductionBillNo('')
    setDeductionPolicyCore('')
    setDeductionInsuranceCode('')
    setDeductionItemsCount('')
    setDeductionExecStatus('')
    setCurrentPage(1)
  }

  const handleTabChange = (tab: AgentTab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  // 采集列定义
  const collectionColumns: ColumnsType<CollectionLogRecord> = [
    { title: '任务号', dataIndex: 'taskId', key: 'taskId', width: 170, ellipsis: true },
    { title: '请求ID', dataIndex: 'requestId', key: 'requestId', width: 85, ellipsis: true },
    { title: '索赔号', dataIndex: 'claimNo', key: 'claimNo', width: 115 },
    { title: '调用时间', dataIndex: 'createdAt', key: 'createdAt', width: 145 },
    {
      title: '视同病历',
      dataIndex: 'isMedicalRecord',
      key: 'isMedicalRecord',
      width: 80,
      render: (val: boolean) => (
        <span style={{ color: '#000000e0', fontWeight: 400, fontSize: 14 }}>{val ? '是' : '否'}</span>
      ),
    },
    { title: '平台耗时', dataIndex: 'platformTime', key: 'platformTime', width: 100 },
    { title: '引擎耗时', dataIndex: 'engineTime', key: 'engineTime', width: 100 },
    { title: '查询数据耗时', dataIndex: 'queryDataTime', key: 'queryDataTime', width: 120 },
    {
      title: '执行状态',
      dataIndex: 'status',
      key: 'status',
      width: 75,
      render: (status: string) => (
        <Tag color={status === 'success' ? 'success' : 'error'} style={{ borderRadius: 6, minWidth: 50, textAlign: 'center' }}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    { title: '引擎返回消息', dataIndex: 'engineMsg', key: 'engineMsg', width: 110, ellipsis: true },
    { title: '图片数量', dataIndex: 'imageCount', key: 'imageCount', width: 80 },
    {
      title: '操作',
      key: 'actions',
      width: 75,
      render: (_: unknown, record: CollectionLogRecord) => (
        <Space size={8}>
          <EyeOutlined
            onClick={() => navigate(`/agent/claims/task-detail?caseNo=${record.caseNo}&taskId=${record.taskId}`)}
            style={{ color: '#1677ff', cursor: 'pointer', fontSize: 14 }}
          />
          <DownloadOutlined style={{ color: '#1677ff', cursor: 'pointer', fontSize: 14 }} />
        </Space>
      ),
    },
  ]

  // 扣费列定义
  const deductionColumns: ColumnsType<DeductionLogRecord> = [
    {
      title: '任务号',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 175,
      ellipsis: true,
      render: (text: string, record: DeductionLogRecord) => (
        <span
          style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => navigate(`/agent/claims/deduction-log-detail?caseNo=${record.caseNo}&taskId=${record.taskId}`)}
        >
          {text}
        </span>
      ),
    },
    { title: '请求ID', dataIndex: 'requestId', key: 'requestId', width: 85, ellipsis: true },
    { title: '案件号', dataIndex: 'caseNo', key: 'caseNo', width: 115 },
    { title: '账单号', dataIndex: 'billNo', key: 'billNo', width: 155 },
    { title: '调用时间', dataIndex: 'callTime', key: 'callTime', width: 130 },
    { title: '完成时间', dataIndex: 'completeTime', key: 'completeTime', width: 130 },
    {
      title: '执行状态',
      dataIndex: 'execStatus',
      key: 'execStatus',
      width: 75,
      render: (status: string) => {
        const cfg = deductionStatusMap[status] || { color: 'default', text: status }
        return <Tag color={cfg.color} style={{ borderRadius: 6, minWidth: 50, textAlign: 'center' }}>{cfg.text}</Tag>
      },
    },
    { title: '平台耗时', dataIndex: 'platformTime', key: 'platformTime', width: 100 },
    { title: '医保剔费模块耗时', dataIndex: 'medicalTime', key: 'medicalTime', width: 145 },
    { title: '商保控费模块耗时', dataIndex: 'commercialTime', key: 'commercialTime', width: 145 },
    { title: '保单核心', dataIndex: 'policyCore', key: 'policyCore', width: 80 },
    { title: '险种编码', dataIndex: 'insuranceCode', key: 'insuranceCode', width: 100 },
    { title: '条款名称', dataIndex: 'clauseName', key: 'clauseName', width: 155, ellipsis: true },
    { title: '责任控费类型', dataIndex: 'liabilityType', key: 'liabilityType', width: 110 },
    { title: '项目总数量', dataIndex: 'totalItems', key: 'totalItems', width: 95 },
    { title: '扣费项目数量', dataIndex: 'deductionItems', key: 'deductionItems', width: 110 },
    { title: 'AI风控项目数量', dataIndex: 'aiRiskItems', key: 'aiRiskItems', width: 120 },
    {
      title: '操作',
      key: 'actions',
      width: 75,
      render: (_: unknown, record: DeductionLogRecord) => (
        <Space size={8}>
          <EyeOutlined
            onClick={() => navigate(`/agent/claims/deduction-log-detail?caseNo=${record.caseNo}&taskId=${record.taskId}`)}
            style={{ color: '#1677ff', cursor: 'pointer', fontSize: 14 }}
          />
        </Space>
      ),
    },
  ]

  const isCollection = activeTab === '采集'
  const isDeduction = activeTab === '扣费'

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6',
      padding: '14px 24px 34px',
    }}>
      {/* Tab 标签 */}
      <div style={{
        display: 'flex',
        gap: 0,
        marginBottom: 28,
        borderBottom: '1px solid #e8e8e8',
      }}>
        {AGENT_TABS.map((tab) => {
          const active = tab === activeTab
          return (
            <div
              key={tab}
              onClick={() => handleTabChange(tab)}
              style={{
                padding: '10px 24px',
                fontSize: 16,
                fontWeight: active ? 600 : 400,
                color: active ? '#1f2937' : '#8c8c8c',
                cursor: 'pointer',
                borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
                transition: 'all 0.2s',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = '#595959'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = '#8c8c8c'
              }}
            >
              {tab}
            </div>
          )
        })}
      </div>

      {/* 标题 */}
      <div style={titleStyle}>
        <div style={titleBarStyle} />
        <span style={titleTextStyle}>日志清单</span>
      </div>

      {/* ── 采集查询区 ── */}
      {isCollection && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          alignItems: 'center',
        }}>
          <Input
            placeholder="任务号"
            value={collectionTaskId}
            onChange={e => { setCollectionTaskId(e.target.value); setCurrentPage(1) }}
            allowClear
            style={{ width: 200 }}
          />
          <Input
            placeholder="索赔号"
            value={collectionClaimNo}
            onChange={e => { setCollectionClaimNo(e.target.value); setCurrentPage(1) }}
            allowClear
            style={{ width: 200 }}
          />
          <DatePicker
            placeholder="调用时间"
            value={collectionCreatedAt}
            onChange={(val) => { setCollectionCreatedAt(val); setCurrentPage(1) }}
            allowClear
            showTime={{ format: 'HH:mm:ss' }}
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: 220, fontSize: 13 }}
          />
          <Button onClick={clearCollectionFilters}>重置</Button>
        </div>
      )}

      {/* ── 扣费查询区 ── */}
      {isDeduction && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          alignItems: 'center',
        }}>
          <Input
            placeholder="任务号"
            value={deductionTaskId}
            onChange={e => { setDeductionTaskId(e.target.value); setCurrentPage(1) }}
            allowClear
            style={{ width: 180 }}
          />
          <Input
            placeholder="案件号"
            value={deductionCaseNo}
            onChange={e => { setDeductionCaseNo(e.target.value); setCurrentPage(1) }}
            allowClear
            style={{ width: 160 }}
          />
          <Input
            placeholder="账单号"
            value={deductionBillNo}
            onChange={e => { setDeductionBillNo(e.target.value); setCurrentPage(1) }}
            allowClear
            style={{ width: 180 }}
          />
          <Input
            placeholder="保单核心"
            value={deductionPolicyCore}
            onChange={e => { setDeductionPolicyCore(e.target.value); setCurrentPage(1) }}
            allowClear
            style={{ width: 130 }}
          />
          <Input
            placeholder="险种编码"
            value={deductionInsuranceCode}
            onChange={e => { setDeductionInsuranceCode(e.target.value); setCurrentPage(1) }}
            allowClear
            style={{ width: 150 }}
          />
          <Input
            placeholder="扣费项目数量"
            value={deductionItemsCount}
            onChange={e => { setDeductionItemsCount(e.target.value); setCurrentPage(1) }}
            allowClear
            style={{ width: 150 }}
          />
          <Select
            placeholder="执行状态"
            value={deductionExecStatus || undefined}
            onChange={val => { setDeductionExecStatus(val || ''); setCurrentPage(1) }}
            allowClear
            options={[
              { label: '成功', value: 'success' },
              { label: '失败', value: 'failed' },
              { label: '处理中', value: 'processing' },
              { label: '超时', value: 'timeout' },
            ]}
            style={{ width: 120 }}
            rootClassName="filter-select"
          />
          <Button onClick={clearDeductionFilters}>重置</Button>
        </div>
      )}

      {/* ── 采集表格 ── */}
      {isCollection && (
        <>
          <div className="table-scroll-wrapper">
            <div style={{ minWidth: 1055 }}>
              <Table
                columns={collectionColumns}
                dataSource={pagedCollection}
                pagination={false}
                size="small"
                rowKey="key"
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 12, color: '#000000e0' }}>共 {filteredCollection.length} 条数据</span>
              <button
                onClick={() => console.log('导出采集日志')}
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
              total={filteredCollection.length}
              showSizeChanger
              showQuickJumper
              pageSizeOptions={['10', '20', '50']}
              onChange={(page, size) => {
                if (size !== pageSize) { setPageSize(size); setCurrentPage(1) } else { setCurrentPage(page) }
              }}
              size="small"
            />
          </div>
        </>
      )}

      {/* ─ 扣费表格 ── */}
      {isDeduction && (
        <>
          <div className="table-scroll-wrapper">
            <div style={{ minWidth: 2030 }}>
              <Table
                columns={deductionColumns}
                dataSource={pagedDeduction}
                pagination={false}
                size="small"
                rowKey="key"
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 12, color: '#000000e0' }}>共 {filteredDeduction.length} 条数据</span>
              <button
                onClick={() => console.log('导出扣费日志')}
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
                <DownloadOutlined style={{ fontSize: 14 }} />
                结果导出
              </button>
            </div>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredDeduction.length}
              showSizeChanger
              showQuickJumper
              pageSizeOptions={['10', '20', '50']}
              onChange={(page, size) => {
                if (size !== pageSize) { setPageSize(size); setCurrentPage(1) } else { setCurrentPage(page) }
              }}
              size="small"
            />
          </div>
        </>
      )}
    </div>
  )
}

export default AgentClaimsLogs
