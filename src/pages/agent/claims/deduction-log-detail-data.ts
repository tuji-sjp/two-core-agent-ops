// 扣费日志详情页 - 数据模型与模拟数据

export type NodeStatus = 'hit' | 'pass' | 'skip'

export interface SubNode {
  key: string
  name: string
  status: NodeStatus
  conclusion: string
}

export interface MbNode {
  status: NodeStatus
  conclusion: string
}

export interface DecisionChain {
  mbStandardize?: MbNode
  mbDeduct?: MbNode
  rule: {
    status: NodeStatus
    conclusion: string
    hasResult: boolean
    sub: SubNode[]
  }
  clause: {
    status: NodeStatus
    conclusion: string
    reflected: boolean
  }
  risk: {
    status: NodeStatus
    conclusion: string
    risks: string[]
    toHuman: boolean
  }
  output: {
    status: NodeStatus
    conclusion: string
  }
}

export type FeeResult = '扣费' | '通过' | '转人工'

export interface FeeItem {
  id: string
  name: string
  category: string
  unreasonable: boolean
  spec: string
  unitPrice: number
  quantity: number
  amount: number
  result: FeeResult
  deductAmount: number
  chain: DecisionChain
}

export interface BillHeader {
  taskNo: string
  caseNo: string
  billNo: string
  hospital: string
  patient: string
  totalAmount: number
  totalDeduct: number
}

const unreasonableCategories = ['康复治疗', '营养补充类', '中草药', '乙类传染病'] as const

const feeItemsTemplate: FeeItem[] = [
  {
    id: 'f01', name: '针灸', category: '中草药', unreasonable: true, spec: '次', unitPrice: 28, quantity: 12, amount: 336, result: '扣费', deductAmount: 168,
    chain: {
      rule: { status: 'hit', conclusion: '命中项目级+标签级+产品级扣费知识：针灸超频次且属中医理疗限用产品。', hasResult: true, sub: [
        { key: 'project', name: '项目级扣费知识', status: 'hit', conclusion: '针灸限2次/日，超量部分不予支付。' },
        { key: 'tag', name: '标签级扣费知识', status: 'hit', conclusion: '命中「中医理疗叠加收费」标签。' },
        { key: 'product', name: '产品级扣费知识', status: 'hit', conclusion: '命中针灸类限定支付产品目录。' },
      ]},
      clause: { status: 'skip', conclusion: '规则模块已得出判定结果，未进入条款判定。', reflected: false },
      risk: { status: 'pass', conclusion: '扣费金额低于人工复核阈值，无需转人工。', risks: [], toHuman: false },
      output: { status: 'hit', conclusion: '标化输出：扣费 168.00 元，扣费依据=超量收费。' },
    },
  },
  {
    id: 'f02', name: '床位费', category: '其他', unreasonable: false, spec: '日', unitPrice: 50, quantity: 8, amount: 400, result: '通过', deductAmount: 0,
    chain: {
      rule: { status: 'pass', conclusion: '', hasResult: false, sub: [
        { key: 'project', name: '项目级扣费知识', status: 'hit', conclusion: '项目级已命中：床位费特需病房限定标准。' },
        { key: 'tag', name: '标签级扣费知识', status: 'pass', conclusion: '未命中分解收费标签。' },
        { key: 'product', name: '产品级扣费知识', status: 'pass', conclusion: '未命中产品级限制。' },
      ]},
      clause: { status: 'pass', conclusion: '条款知识库未发现该项目相关限制条款。', reflected: false },
      risk: { status: 'pass', conclusion: '无风险，正常支付。', risks: [], toHuman: false },
      output: { status: 'pass', conclusion: '标化输出：通过，扣费 0.00 元。' },
    },
  },
  {
    id: 'f03', name: '真空采血管', category: '乙类传染病', unreasonable: true, spec: '支', unitPrice: 6, quantity: 20, amount: 120, result: '扣费', deductAmount: 72,
    chain: {
      rule: { status: 'hit', conclusion: '命中标签级扣费知识：耗材重复收费（同一采血已含采血管成本）。', hasResult: true, sub: [
        { key: 'project', name: '项目级扣费知识', status: 'pass', conclusion: '项目级未命中。' },
        { key: 'tag', name: '标签级扣费知识', status: 'hit', conclusion: '命中「耗材重复收费」标签，已包含于检验项目中。' },
        { key: 'product', name: '产品级扣费知识', status: 'pass', conclusion: '已得出标签级结论，跳过产品级判定。' },
      ]},
      clause: { status: 'skip', conclusion: '规则模块已得出判定结果，未进入条款判定。', reflected: false },
      risk: { status: 'pass', conclusion: '扣费金额较小，无需转人工。', risks: [], toHuman: false },
      output: { status: 'hit', conclusion: '标化输出：扣费 72.00 元，扣费依据=重复收费。' },
    },
  },
  {
    id: 'f04', name: '真空采血管', category: '乙类传染病', unreasonable: true, spec: '支', unitPrice: 6, quantity: 6, amount: 36, result: '转人工', deductAmount: 0,
    chain: {
      rule: { status: 'hit', conclusion: '命中项目级扣费知识：乙类传染病专项耗材收费限制。', hasResult: true, sub: [
        { key: 'project', name: '项目级扣费知识', status: 'hit', conclusion: '项目级已命中：传染病专项耗材限收费目录内。' },
        { key: 'tag', name: '标签级扣费知识', status: 'pass', conclusion: '标签级证据不足，未命中。' },
        { key: 'product', name: '产品级扣费知识', status: 'pass', conclusion: '产品级未命中。' },
      ]},
      clause: { status: 'skip', conclusion: '规则模块已得出判定结果，未进入条款判定。', reflected: false },
      risk: { status: 'hit', conclusion: '存在合规风险且证据链不完整，转人工复核。', risks: ['规则证据需补充', '传染病专项目录待核实'], toHuman: true },
      output: { status: 'hit', conclusion: '标化输出：转人工复核，暂不扣费。' },
    },
  },
  {
    id: 'f05', name: '休感诱发电位', category: '康复治疗', unreasonable: true, spec: '次', unitPrice: 120, quantity: 3, amount: 360, result: '扣费', deductAmount: 240,
    chain: {
      rule: { status: 'hit', conclusion: '命中项目级扣费知识：诱发电位检查需有诊断支撑。', hasResult: true, sub: [
        { key: 'project', name: '项目级扣费知识', status: 'hit', conclusion: '项目级已命中：诱发电位检查适应症限定。' },
        { key: 'tag', name: '标签级扣费知识', status: 'pass', conclusion: '标签级未命中。' },
        { key: 'product', name: '产品级扣费知识', status: 'pass', conclusion: '产品级未命中。' },
      ]},
      clause: { status: 'skip', conclusion: '规则模块已得出判定结果，未进入条款判定。', reflected: false },
      risk: { status: 'pass', conclusion: '判定证据充分，风险可控，无需转人工。', risks: ['适应症不充分'], toHuman: false },
      output: { status: 'hit', conclusion: '标化输出：扣费 240.00 元，扣费依据=适应症不符。' },
    },
  },
  {
    id: 'f06', name: '血清乳酸脱氢酶同工酶电泳分析', category: '乙类传染病', unreasonable: true, spec: '次', unitPrice: 90, quantity: 2, amount: 180, result: '扣费', deductAmount: 90,
    chain: {
      rule: { status: 'hit', conclusion: '命中产品级扣费知识：同类检验项目重复开立。', hasResult: true, sub: [
        { key: 'project', name: '项目级扣费知识', status: 'pass', conclusion: '项目级未命中。' },
        { key: 'tag', name: '标签级扣费知识', status: 'pass', conclusion: '标签级未命中。' },
        { key: 'product', name: '产品级扣费知识', status: 'hit', conclusion: '命中「同类检验重复」，限收1次/疗程。' },
      ]},
      clause: { status: 'skip', conclusion: '规则模块已得出判定结果，未进入条款判定。', reflected: false },
      risk: { status: 'pass', conclusion: '无额外风险。', risks: [], toHuman: false },
      output: { status: 'hit', conclusion: '标化输出：扣费 90.00 元，扣费依据=重复检验。' },
    },
  },
  {
    id: 'f07', name: '维D2磷葡钙', category: '营养补充类', unreasonable: true, spec: '盒', unitPrice: 45, quantity: 4, amount: 180, result: '扣费', deductAmount: 180,
    chain: {
      rule: { status: 'hit', conclusion: '命中标签级扣费知识：营养补充类药品属医保支付限制范围。', hasResult: true, sub: [
        { key: 'project', name: '项目级扣费知识', status: 'pass', conclusion: '项目级未命中。' },
        { key: 'tag', name: '标签级扣费知识', status: 'hit', conclusion: '命中「营养补充剂限支付」标签，全额不予支付。' },
        { key: 'product', name: '产品级扣费知识', status: 'pass', conclusion: '已得出标签级结论，跳过产品级判定。' },
      ]},
      clause: { status: 'skip', conclusion: '规则模块已得出判定结果，未进入条款判定。', reflected: false },
      risk: { status: 'pass', conclusion: '政策明确，无需转人工。', risks: [], toHuman: false },
      output: { status: 'hit', conclusion: '标化输出：扣费 180.00 元，扣费依据=超医保目录。' },
    },
  },
  {
    id: 'f08', name: '维生素D', category: '营养补充类', unreasonable: false, spec: '盒', unitPrice: 22, quantity: 2, amount: 44, result: '通过', deductAmount: 0,
    chain: {
      rule: { status: 'pass', conclusion: '', hasResult: false, sub: [
        { key: 'project', name: '项目级扣费知识', status: 'hit', conclusion: '项目级已命中：维生素D限定支付条件。' },
        { key: 'tag', name: '标签级扣费知识', status: 'pass', conclusion: '有佝偻病诊断支撑，符合限定支付条件。' },
        { key: 'product', name: '产品级扣费知识', status: 'pass', conclusion: '产品级未命中。' },
      ]},
      clause: { status: 'pass', conclusion: '条款符合限定支付适应症。', reflected: false },
      risk: { status: 'pass', conclusion: '无风险。', risks: [], toHuman: false },
      output: { status: 'pass', conclusion: '标化输出：通过，扣费 0.00 元。' },
    },
  },
  {
    id: 'f09', name: '徒手平衡功能检查', category: '康复治疗', unreasonable: true, spec: '次', unitPrice: 35, quantity: 6, amount: 210, result: '扣费', deductAmount: 105,
    chain: {
      rule: { status: 'hit', conclusion: '命中项目级扣费知识：康复评估类项目超频次收费。', hasResult: true, sub: [
        { key: 'project', name: '项目级扣费知识', status: 'hit', conclusion: '平衡功能检查限3次/疗程，超量扣减。' },
        { key: 'tag', name: '标签级扣费知识', status: 'pass', conclusion: '未命中评估叠加标签。' },
        { key: 'product', name: '产品级扣费知识', status: 'pass', conclusion: '已得出项目级结论。' },
      ]},
      clause: { status: 'skip', conclusion: '规则模块已得出判定结果。', reflected: false },
      risk: { status: 'pass', conclusion: '无额外风险。', risks: [], toHuman: false },
      output: { status: 'hit', conclusion: '标化输出：扣费 105.00 元，扣费依据=超频次。' },
    },
  },
  {
    id: 'f10', name: '步态分析检查', category: '康复治疗', unreasonable: false, spec: '次', unitPrice: 60, quantity: 2, amount: 120, result: '通过', deductAmount: 0,
    chain: {
      rule: { status: 'pass', conclusion: '', hasResult: false, sub: [
        { key: 'project', name: '项目级扣费知识', status: 'hit', conclusion: '项目级已命中：步态分析频次限定。' },
        { key: 'tag', name: '标签级扣费知识', status: 'pass', conclusion: '未命中。' },
        { key: 'product', name: '产品级扣费知识', status: 'pass', conclusion: '未命中。' },
      ]},
      clause: { status: 'pass', conclusion: '条款无限制。', reflected: false },
      risk: { status: 'pass', conclusion: '无风险。', risks: [], toHuman: false },
      output: { status: 'pass', conclusion: '标化输出：通过，扣费 0.00 元。' },
    },
  },
  {
    id: 'f11', name: '康复评定', category: '康复治疗', unreasonable: true, spec: '次', unitPrice: 80, quantity: 4, amount: 320, result: '扣费', deductAmount: 160,
    chain: {
      rule: { status: 'hit', conclusion: '命中项目级扣费知识：康复评定超限定频次。', hasResult: true, sub: [
        { key: 'project', name: '项目级扣费知识', status: 'hit', conclusion: '康复评定限2次/疗程，超量扣减2次。' },
        { key: 'tag', name: '标签级扣费知识', status: 'pass', conclusion: '未命中。' },
        { key: 'product', name: '产品级扣费知识', status: 'pass', conclusion: '已得出项目级结论。' },
      ]},
      clause: { status: 'skip', conclusion: '规则模块已得出判定结果。', reflected: false },
      risk: { status: 'pass', conclusion: '无额外风险。', risks: [], toHuman: false },
      output: { status: 'hit', conclusion: '标化输出：扣费 160.00 元，扣费依据=超频次。' },
    },
  },
  {
    id: 'f12', name: '平衡功能训练', category: '康复治疗', unreasonable: false, spec: '次', unitPrice: 40, quantity: 10, amount: 400, result: '通过', deductAmount: 0,
    chain: {
      rule: { status: 'pass', conclusion: '', hasResult: false, sub: [
        { key: 'project', name: '项目级扣费知识', status: 'hit', conclusion: '项目级已命中：康复训练频次限定。' },
        { key: 'tag', name: '标签级扣费知识', status: 'pass', conclusion: '未命中。' },
        { key: 'product', name: '产品级扣费知识', status: 'pass', conclusion: '未命中。' },
      ]},
      clause: { status: 'pass', conclusion: '条款无限制。', reflected: false },
      risk: { status: 'pass', conclusion: '无风险。', risks: [], toHuman: false },
      output: { status: 'pass', conclusion: '标化输出：通过，扣费 0.00 元。' },
    },
  },
  {
    id: 'f13', name: '引导式教育训练', category: '康复治疗', unreasonable: false, spec: '次', unitPrice: 55, quantity: 8, amount: 440, result: '通过', deductAmount: 0,
    chain: {
      rule: { status: 'pass', conclusion: '', hasResult: false, sub: [
        { key: 'project', name: '项目级扣费知识', status: 'hit', conclusion: '项目级已命中：引导式教育限定支付条件。' },
        { key: 'tag', name: '标签级扣费知识', status: 'pass', conclusion: '未命中。' },
        { key: 'product', name: '产品级扣费知识', status: 'pass', conclusion: '未命中。' },
      ]},
      clause: { status: 'pass', conclusion: '条款无限制。', reflected: false },
      risk: { status: 'pass', conclusion: '无风险。', risks: [], toHuman: false },
      output: { status: 'pass', conclusion: '标化输出：通过，扣费 0.00 元。' },
    },
  },
]

export function getFeeItems(): FeeItem[] {
  return feeItemsTemplate
}

export function getBillHeader(taskNo: string, caseNo: string, billNo: string): BillHeader {
  return {
    taskNo,
    caseNo,
    billNo,
    hospital: '市第一人民医院',
    patient: '张**',
    totalAmount: 8642.5,
    totalDeduct: 1236.0,
  }
}

export function getMbStandardize(item: FeeItem): MbNode {
  return item.chain.mbStandardize ?? {
    status: 'pass',
    conclusion: `调用 HIDS 接口获取「${item.name}」的 TopN 推荐项，基于作业标化逻辑命中最优标化项目（标化编码已写入共享状态）。`,
  }
}

export function getMbDeduct(item: FeeItem): MbNode {
  return item.chain.mbDeduct ?? {
    status: item.result === '通过' ? 'pass' : 'hit',
    conclusion: item.result === '通过'
      ? `基于标化项目调用 MBE 剔费接口，未返回医保剔费数据，无特殊剔费场景。`
      : `基于标化项目调用 MBE 剔费接口获取医保剔费数据，结合案件信息识别到特殊剔费场景并完成针对性处理。`,
  }
}

export function getUnreasonableGroups(): { category: string; items: FeeItem[] }[] {
  return unreasonableCategories
    .map(category => ({
      category,
      items: feeItemsTemplate.filter(i => i.unreasonable && i.category === category),
    }))
    .filter(g => g.items.length > 0)
}
