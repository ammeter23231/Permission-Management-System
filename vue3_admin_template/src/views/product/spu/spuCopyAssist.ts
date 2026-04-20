/** 商品文案辅助：前端占位实现，后续可替换为云端流式接口 */

export type CopyToneVariant = 'a' | 'b' | 'c'

export interface DraftContext {
  spuName: string
  brandName: string
  saleAttrLines: string[]
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

/** 模拟流式输出（逐段写入 partial） */
export async function streamMockText(
  full: string,
  onPartial: (text: string) => void,
  options: {
    chunkSize?: number
    delayMs?: number
    signal?: AbortSignal
  } = {},
): Promise<void> {
  const chunkSize = options.chunkSize ?? 5
  const delayMs = options.delayMs ?? 32
  const signal = options.signal
  for (let i = 0; i < full.length; i += chunkSize) {
    if (signal?.aborted) {
      const err = new Error('aborted')
      err.name = 'AbortError'
      throw err
    }
    await sleep(delayMs)
    onPartial(full.slice(0, Math.min(i + chunkSize, full.length)))
  }
}

const BANNED_HINT =
  '（文案已规避绝对化用语：不含「最」「第一」「国家级」等，上线前请按平台规则复核。）'

export function buildMockDraft(ctx: DraftContext): string {
  const name = ctx.spuName.trim() || '本商品'
  const brand = ctx.brandName.trim() || '合作品牌'
  const attrs =
    ctx.saleAttrLines.length > 0
      ? ctx.saleAttrLines.join('；')
      : '规格与款式以页面展示为准'

  return [
    `【${brand}｜${name}】`,
    '',
    `核心卖点：精选材质与做工，兼顾日常使用与耐看外观；${attrs}。`,
    '',
    '适用场景：家庭/办公/出行等多场景；具体功能以实物与说明书为准。',
    '',
    `服务说明：支持正规售后渠道咨询；${BANNED_HINT}`,
  ].join('\n')
}

export function polishFormalMock(text: string): string {
  const base = text.trim() || '本商品为在售 SPU，请以页面参数为准。'
  return [
    '【正式版说明】',
    '',
    base,
    '',
    '以上为商品客观描述，不含夸大承诺；价格、库存与活动以系统展示为准。',
  ].join('\n')
}

export function polishPromoMock(text: string): string {
  const base = text.trim() || '本商品为在售 SPU，欢迎选购。'
  return [
    '【促销向短文案】',
    '',
    base,
    '',
    '限时活动与优惠以结算页为准；理性消费，按需购买。',
    '',
    BANNED_HINT,
  ].join('\n')
}

export function alternateVersionMock(text: string, variant: CopyToneVariant): string {
  const base = text.trim() || '本商品为在售 SPU。'
  const tag =
    variant === 'a' ? '简洁版' : variant === 'b' ? '故事版' : '参数向'
  const tail =
    variant === 'a'
      ? '一句话：好用、耐看、售后可查。'
      : variant === 'b'
        ? '从选材到品控，每一步都希望让日常使用更省心。'
        : '关键参数与规格请对照销售属性组合与商详页表格。'
  return [`【多版本改写｜${tag}】`, '', base, '', tail, '', BANNED_HINT].join('\n')
}

export function buildSaleAttrBulletBlock(lines: string[]): string {
  if (!lines.length) return ''
  return ['【销售属性要点】', '', ...lines.map((l) => `· ${l}`), ''].join('\n')
}

export function suggestSpuNames(ctx: {
  spuName: string
  brandName: string
}): string[] {
  const seed = ctx.spuName.trim() || '新品'
  const b = ctx.brandName.trim() || ''
  const prefix = b ? `${b} ` : ''
  return [
    `${prefix}${seed}｜标准款`,
    `${prefix}${seed}（热卖系列）`,
    `${prefix}${seed}｜多规格可选`,
  ]
}

export function suggestSaleAttrValues(attrName: string): string[] {
  const a = attrName.trim() || '规格'
  return [`标准${a}`, `升级${a}`, `定制${a}`]
}
