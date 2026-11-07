/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VAMPPhaseInfo, CARSItem } from '../types/quant';

export const VAMP_PHASES: VAMPPhaseInfo[] = [
  {
    key: 'V',
    title: 'Volume Accumulation',
    subtitle: 'Institutional foot-printing at structural lows',
    description:
      'Large institutional capital cannot enter the market all at once without causing immense slippage. They begin by establishing hidden limit orders and soaking up quiet supply around the key structural support level.',
    institutionalIntent:
      'Test market depth and absorb floating inventory without alerting other algorithmic participant models.',
    color: '#7aa2ff',
  },
  {
    key: 'A',
    title: 'Passive Absorption',
    subtitle: 'High volume with minimal price progression',
    description:
      'Notice the footprint: massive volume prints, yet price candles compress into tiny tight bodies. Large institutional iceberg buy orders are quietly swallowing every market sell order thrown at them.',
    institutionalIntent:
      'Soak up retail and algorithmic selling pressure at predetermined wholesale prices before initiating the run.',
    color: '#2dd4a7',
  },
  {
    key: 'M',
    title: 'Manipulation (Stop Hunt)',
    subtitle: 'Engineering liquidity below obvious support',
    description:
      'Retail traders place their protective stop-loss sell orders just beneath the visible support swing low. The institutional desk intentionally allows or pushes a sharp, rapid spike downward through the pool. As retail stops trigger, they turn into forced market sell orders.',
    institutionalIntent:
      'This cascade of forced retail market sell orders provides the deep wholesale liquidity institutions require to fill their massive long positions without driving the price against themselves.',
    color: '#ff6b6b',
  },
  {
    key: 'P',
    title: 'Positioning & Markup',
    subtitle: 'Supply exhaustion & aggressive reversal',
    description:
      'Once the stops are absorbed into the institutional book, there is zero remaining supply left under the market. Price violently snaps back upward like a beach ball held underwater and released, printing an explosive absorption reversal.',
    institutionalIntent:
      'Markup phase begins. Retail traders who just got stopped out are forced to either watch price take off without them or chase it higher at much worse prices.',
    color: '#ffd60a',
  },
];

export const CARS_ITEMS: Record<string, CARSItem> = {
  C: {
    id: 'C',
    letter: 'C',
    name: 'Context',
    shortDesc: 'Statistical location relative to Institutional VWAP',
    fullDesc:
      'Before entering any trade, the quantitative desk measures where price sits relative to institutional session value. Prices inside ±1.0σ reflect fair value equilibrium with no statistical edge. Extreme deviations (touching or exceeding −2.0σ) represent mean-reversion discount zones.',
    ruleTitle: 'VWAP Standard Deviation Z-Score Condition',
    mathFormula: 'Z = \\frac{\\text{Price} - \\text{VWAP}}{\\sigma} \\le -2.00',
    plainEnglishExplanation:
      'VWAP is the average price weighted by trading volume. If price is more than 2 standard deviations below VWAP, 95.4% of normal market fluctuations suggest it is statistically undervalued.',
    entryZone: 'Quant Entry Zone: Touch of −2.0σ band accompanied by confirmed volume absorption.',
    invalidationLevel: 'Invalidation Stop: 1-minute candle close beyond −2.50σ (structural regime breakdown).',
  },
  A: {
    id: 'A',
    letter: 'A',
    name: 'Asymmetry',
    shortDesc: 'Mathematical Risk-to-Reward and Win-Rate Hurdle',
    fullDesc:
      'Institutional quant strategies never take trades where the prospective reward does not dwarf the structural risk. Furthermore, transaction costs, exchange turnover taxes, and brokerage friction directly degrade net asymmetry.',
    ruleTitle: 'Expectancy & Break-Even Win-Rate Formula',
    mathFormula: 'P_{\\text{BE}} = \\frac{\\text{Risk}}{\\text{Risk} + \\text{Reward}} = \\frac{1}{1 + R:R}',
    plainEnglishExplanation:
      'With a 3:1 Reward-to-Risk ratio (e.g. risking $10 to make $30), you only need to be right 25% of the time to break even. But if exchange fees eat 20% of your gains, your required win-rate jumps significantly.',
    entryZone: 'Quant Entry Zone: High-probability discount level offering minimum 2.5:1 to 3:1 clear runway.',
    invalidationLevel: 'Invalidation Stop: The exact structural price level where the trade thesis is mathematically voided.',
  },
  R: {
    id: 'R',
    letter: 'R',
    name: 'Rejection',
    shortDesc: 'Price rejection wick anatomy and volume confirmation',
    fullDesc:
      'A true institutional rejection candle is characterized by an extended lower shadow indicating an intraday probe below value that was immediately rejected and bought back up by high-volume participants before the bar closed.',
    ruleTitle: 'Quant Rejection Wick Mathematical Condition',
    mathFormula: '\\text{Lower Wick Ratio} = \\frac{\\min(O, C) - L}{H - L} \\ge 0.70 \\quad (70\\%)',
    plainEnglishExplanation:
      'The lower wick must account for at least 70% of the entire candle length, and the candle body must close in the upper 30% of the range on volume higher than the 20-period moving average.',
    entryZone: 'Quant Entry Zone: Retest of the upper 50% of the rejection candle body on the subsequent bar.',
    invalidationLevel: 'Invalidation Stop: 1 tick below the absolute lowest point of the rejection wick.',
  },
  S: {
    id: 'S',
    letter: 'S',
    name: 'Structure',
    shortDesc: 'Market Structure Shift (MSS) vs False Wick Break',
    fullDesc:
      'Trend continuation is defined by sequences of Lower Highs (LH) and Lower Lows (LL) in a bear trend. A genuine institutional trend reversal (Market Structure Shift) requires an aggressive candle BODY CLOSE completely exceeding the prior Lower High.',
    ruleTitle: 'Structural Shift Quantitative Condition',
    mathFormula: '\\text{Candle Close} > \\text{Prior Lower High Pivot Price} \\quad (C > LH)',
    plainEnglishExplanation:
      'A wick piercing through the previous lower high is NOT a shift—it is often just a liquidity sweep. A genuine shift requires the bar to close decisively above the pivot level.',
    entryZone: 'Quant Entry Zone: Retest and defense of the broken Lower High pivot line (turning resistance into support).',
    invalidationLevel: 'Invalidation Stop: Below the newly formed structural swing low plus 1 tick buffer.',
  },
};
