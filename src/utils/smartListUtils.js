/**
 * Motor de predição de lista de compras.
 * Analisa o cartHistory do usuário e calcula um score de necessidade para
 * cada produto, baseado em três sinais:
 *   - frequência: com que regularidade o produto aparece nas compras
 *   - urgência:   quanto tempo passou desde a última compra vs. o intervalo médio
 *   - faltou:     quantas vezes o produto foi marcado como "missing" (demanda reprimida)
 *
 * Score final = frequência × min(urgência, 2) × (1 + taxaDeFalta)
 * Confidence  = min(score × 50, 100) — exibido como 0-100%
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24
const DEFAULT_AVG_DAYS = 7   // assume semanal quando há apenas 1 compra
const URGENCY_CAP = 2.0      // máximo de urgência (2× o intervalo médio)
const MIN_SCORE = 0.15       // threshold mínimo para aparecer na lista

export function computeSmartList(cartHistory) {
  if (!cartHistory || cartHistory.length === 0) return []

  const totalCarts = cartHistory.length
  const now = Date.now()

  // ── 1. Agregar dados por produto ────────────────────────────────────────────
  const stats = {}

  cartHistory.forEach(cart => {
    const cartTime = new Date(cart.finishedAt).getTime()
    if (isNaN(cartTime)) return

    cart.items.forEach(item => {
      if (!item.name) return
      const key = item.name.toLowerCase()

      if (!stats[key]) {
        stats[key] = {
          name: item.name,
          category: item.category || 'geral',
          lastQuantity: item.quantity || 1,
          lastPrice: item.price || 0,
          appearances: 0,
          missingCount: 0,
          purchaseTimes: [],
        }
      }

      const s = stats[key]
      s.appearances++
      if (item.status === 'missing') s.missingCount++
      s.purchaseTimes.push(cartTime)

      // Manter dados mais recentes
      if (cartTime >= Math.max(...s.purchaseTimes)) {
        s.name = item.name
        s.category = item.category || s.category
        s.lastQuantity = item.quantity || s.lastQuantity
        s.lastPrice = item.price || s.lastPrice
      }
    })
  })

  // ── 2. Calcular score para cada produto ─────────────────────────────────────
  const scored = Object.values(stats).map(s => {
    const sorted = [...s.purchaseTimes].sort((a, b) => a - b)
    const lastPurchaseTime = sorted[sorted.length - 1]
    const daysSinceLast = (now - lastPurchaseTime) / MS_PER_DAY

    // Intervalo médio entre compras
    let avgDaysBetween = DEFAULT_AVG_DAYS
    if (sorted.length >= 2) {
      const intervals = []
      for (let i = 1; i < sorted.length; i++) {
        intervals.push((sorted[i] - sorted[i - 1]) / MS_PER_DAY)
      }
      avgDaysBetween = intervals.reduce((a, b) => a + b, 0) / intervals.length
    }

    const frequency  = s.appearances / totalCarts                        // 0–1
    const urgency    = Math.min(daysSinceLast / Math.max(avgDaysBetween, 1), URGENCY_CAP)
    const missingRate = s.missingCount / s.appearances                   // 0–1
    const missingBoost = 1 + missingRate                                 // 1–2

    const score      = frequency * urgency * missingBoost
    const confidence = Math.min(Math.round(score * 50), 100)

    return {
      name: s.name,
      category: s.category,
      quantity: s.lastQuantity,
      price: s.lastPrice,
      score,
      confidence,
      // Metadados para exibição
      appearances: s.appearances,
      totalCarts,
      missingCount: s.missingCount,
      daysSinceLast: Math.round(daysSinceLast),
      avgDaysBetween: Math.round(avgDaysBetween),
    }
  })

  return scored
    .filter(p => p.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
}

/** Gera o texto de razão curto exibido abaixo do nome do produto */
export function getScoreReason(product) {
  const { daysSinceLast, avgDaysBetween, missingCount, appearances, totalCarts } = product
  const freq = Math.round((appearances / totalCarts) * 100)

  if (missingCount > 0 && missingCount >= appearances * 0.4) {
    return `Faltou ${missingCount}× — alta demanda`
  }
  if (daysSinceLast > avgDaysBetween * 1.5) {
    return `Atrasado ${daysSinceLast}d (média ${avgDaysBetween}d)`
  }
  if (daysSinceLast >= avgDaysBetween * 0.8) {
    return `Na hora — comprado a cada ${avgDaysBetween}d`
  }
  if (freq >= 80) {
    return `Comprado em ${freq}% das compras`
  }
  return `${appearances}× em ${totalCarts} compras`
}
