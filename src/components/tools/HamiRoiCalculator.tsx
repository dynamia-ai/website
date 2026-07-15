'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Download } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import MainLayout from '@/components/layout/MainLayout';
import { localizedPath } from '@/utils/i18n';
import './hami-roi-calculator.css';

type ServerTier = 'flagship' | 'main' | 'inference';

interface GpuCard {
  id: string;
  name: string;
  price: number;
  tdp: number;
  serverTier: ServerTier;
}

interface GpuVendor {
  id: string;
  name: string;
  color: string;
  cards: GpuCard[];
}

interface CalculatorConfig {
  currencySymbol: string;
  moneyScale: 'eastAsian' | 'western';
  moneyUnits: {
    tenThousand: string;
    hundredMillion: string;
    thousand: string;
    million: string;
    billion: string;
  };
  defaultVendorId: string;
  electricityPrice: number;
  serverPrices: Record<ServerTier, number>;
  presets: Array<{
    id: string;
    label: string;
    count: number;
    vendorId: string;
    cardId: string;
    currentUtilization: number;
    ossUtilization: number;
    enterpriseUtilization: number;
  }>;
}

interface CalculatorState {
  vendorId: string;
  cardId: string;
  count: number;
  price: number;
  currentUtilization: number;
  ossUtilization: number;
  enterpriseUtilization: number;
  perServer: number;
  serverPrice: number;
  networkRatio: number;
  tdp: number;
  loadFactor: number;
  pue: number;
  electricityPrice: number;
  serverPower: number;
}

type NumericCalculatorStateKey = Exclude<keyof CalculatorState, 'vendorId' | 'cardId'>;

interface TcoResult {
  servers: number;
  gpu: number;
  server: number;
  network: number;
  electricity: number;
  total: number;
}

interface SavingsResult {
  gpus: number;
  servers: number;
  gpu: number;
  server: number;
  network: number;
  electricity: number;
  total: number;
}

const TCO_YEARS = 5;
const OSS_UTILIZATION_CAP = 40;
const OSS_SCALE_CAP = 200;
const ENTERPRISE_UTILIZATION_CAP = 80;
const ENTERPRISE_COST_RATE = 0.025;

function computeTco(state: CalculatorState, cardCount: number): TcoResult {
  const perServer = state.perServer > 0 ? state.perServer : 1;
  const servers = Math.ceil(cardCount / perServer);
  const gpu = cardCount * state.price;
  const server = servers * state.serverPrice;
  const network = (gpu + server) * state.networkRatio / 100;
  const powerKw = (cardCount * state.tdp * state.loadFactor / 100 + servers * state.serverPower) / 1000;
  const annualElectricity = powerKw * state.pue * 8760 * state.electricityPrice;
  const electricity = annualElectricity * TCO_YEARS;

  return {
    servers,
    gpu,
    server,
    network,
    electricity,
    total: gpu + server + network + electricity,
  };
}

function computeSavings(state: CalculatorState, utilization: number): SavingsResult {
  const perServer = state.perServer > 0 ? state.perServer : 1;
  const effectiveUtilization = Math.max(utilization, state.currentUtilization);
  const neededGpus = Math.ceil(state.count * state.currentUtilization / effectiveUtilization);
  const gpus = state.count - neededGpus;
  const servers = Math.ceil(state.count / perServer) - Math.ceil(neededGpus / perServer);
  const gpu = gpus * state.price;
  const server = servers * state.serverPrice;
  const network = (gpu + server) * state.networkRatio / 100;
  const savedPowerKw = (gpus * state.tdp * state.loadFactor / 100 + servers * state.serverPower) / 1000;
  const electricity = savedPowerKw * state.pue * 8760 * state.electricityPrice * TCO_YEARS;

  return { gpus, servers, gpu, server, network, electricity, total: gpu + server + network + electricity };
}

export default function HamiRoiCalculator() {
  const t = useTranslations('tools.hamiRoiCalculatorPage');
  const tTools = useTranslations('tools');
  const locale = useLocale();
  const catalog = t.raw('catalog') as GpuVendor[];
  const config = t.raw('config') as CalculatorConfig;
  const defaultVendor = catalog.find((vendor) => vendor.id === config.defaultVendorId) ?? catalog[0];
  const defaultCard = defaultVendor.cards[0];

  const [state, setState] = useState<CalculatorState>(() => ({
    vendorId: defaultVendor.id,
    cardId: defaultCard.id,
    count: 1000,
    price: defaultCard.price,
    currentUtilization: 25,
    ossUtilization: 35,
    enterpriseUtilization: 70,
    perServer: 8,
    serverPrice: config.serverPrices[defaultCard.serverTier],
    networkRatio: 12,
    tdp: defaultCard.tdp,
    loadFactor: 70,
    pue: 1.4,
    electricityPrice: config.electricityPrice,
    serverPower: 1500,
  }));

  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const activeVendor = catalog.find((vendor) => vendor.id === state.vendorId) ?? defaultVendor;
  const activeCard = activeVendor.cards.find((card) => card.id === state.cardId) ?? activeVendor.cards[0];

  const result = useMemo(() => {
    const tco = computeTco(state, state.count);
    const ossInput = Math.max(state.ossUtilization, state.currentUtilization);
    const ossCoveredGpus = Math.min(state.count, OSS_SCALE_CAP);
    const ossEffectiveUtilization = (
      ossCoveredGpus * ossInput + (state.count - ossCoveredGpus) * state.currentUtilization
    ) / state.count;
    const noneOutput = tco.total * state.currentUtilization / 100;
    const ossOutput = tco.total * ossEffectiveUtilization / 100;
    const enterpriseOutput = tco.total * state.enterpriseUtilization / 100;
    const releasedValue = enterpriseOutput - noneOutput;
    const enterpriseVsOss = enterpriseOutput - ossOutput;
    const enterpriseCost = tco.gpu * ENTERPRISE_COST_RATE;
    const neededCards = Math.ceil(state.count * state.enterpriseUtilization / state.currentUtilization);
    const extraCards = neededCards - state.count;
    const extraTco = computeTco(state, neededCards).total - tco.total;
    const overOssScale = state.count > OSS_SCALE_CAP;
    const enterpriseSavings = computeSavings(state, state.enterpriseUtilization);
    return {
      tco,
      ossInput,
      ossEffectiveUtilization,
      overOssScale,
      noneOutput,
      ossOutput,
      enterpriseOutput,
      releasedValue,
      enterpriseVsOss,
      enterpriseCost,
      netGainVsOss: enterpriseVsOss - enterpriseCost,
      roi: enterpriseCost > 0 ? releasedValue / enterpriseCost : 0,
      ossComparisonRoi: enterpriseCost > 0 ? enterpriseVsOss / enterpriseCost : 0,
      savingsRoi: enterpriseCost > 0 ? enterpriseSavings.total / enterpriseCost : 0,
      paybackMonths: releasedValue > 0
        ? enterpriseCost / (releasedValue / (TCO_YEARS * 12))
        : 0,
      extraCards,
      extraTco,
      ossSavings: computeSavings(state, ossEffectiveUtilization),
      enterpriseSavings,
    };
  }, [state]);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.round(value));
  const formatMoneyAmount = (value: number, maxDigits = 2) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDigits,
    }).format(value);
  const formatMoney = (value: number) => {
    if (config.moneyScale === 'eastAsian') {
      if (value >= 100000000) {
        return `${config.currencySymbol} ${formatMoneyAmount(value / 100000000, 2)} ${config.moneyUnits.hundredMillion}`;
      }
      if (value >= 10000) {
        return `${config.currencySymbol} ${formatMoneyAmount(value / 10000, 2)} ${config.moneyUnits.tenThousand}`;
      }
      return `${config.currencySymbol} ${formatMoneyAmount(value, 2)}`;
    }
    if (value >= 1000000000) {
      return `${config.currencySymbol}${formatMoneyAmount(value / 1000000000, 2)}${config.moneyUnits.billion}`;
    }
    if (value >= 1000000) {
      return `${config.currencySymbol}${formatMoneyAmount(value / 1000000, 2)}${config.moneyUnits.million}`;
    }
    if (value >= 1000) {
      return `${config.currencySymbol}${formatMoneyAmount(value / 1000, 2)}${config.moneyUnits.thousand}`;
    }
    return `${config.currencySymbol}${formatMoneyAmount(value, 2)}`;
  };
  /** Card pill / slider: keep up to 2 decimals in 万/K units. */
  const formatCardPrice = (value: number) => {
    if (config.moneyScale === 'eastAsian') {
      return `${config.currencySymbol}${formatMoneyAmount(value / 10000, 2)}${config.moneyUnits.tenThousand}`;
    }
    return `${config.currencySymbol}${formatMoneyAmount(value / 1000, 2)}${config.moneyUnits.thousand}`;
  };
  const updateNumber = (key: NumericCalculatorStateKey, value: number) => {
    setActivePresetId(null);
    setState((current) => ({ ...current, [key]: value }));
  };

  const selectVendor = (vendor: GpuVendor) => {
    const card = vendor.cards[0];
    setActivePresetId(null);
    setState((current) => ({
      ...current,
      vendorId: vendor.id,
      cardId: card.id,
      price: card.price,
      tdp: card.tdp,
      serverPrice: config.serverPrices[card.serverTier],
    }));
  };

  const selectCard = (card: GpuCard) => {
    setActivePresetId(null);
    setState((current) => ({
      ...current,
      cardId: card.id,
      price: card.price,
      tdp: card.tdp,
      serverPrice: config.serverPrices[card.serverTier],
    }));
  };

  const applyPreset = (preset: CalculatorConfig['presets'][number]) => {
    const vendor = catalog.find((item) => item.id === preset.vendorId);
    const card = vendor?.cards.find((item) => item.id === preset.cardId);
    if (!vendor || !card) return;

    setActivePresetId(preset.id);
    setState((current) => ({
      ...current,
      vendorId: vendor.id,
      cardId: card.id,
      count: preset.count,
      price: card.price,
      currentUtilization: preset.currentUtilization,
      ossUtilization: preset.ossUtilization,
      enterpriseUtilization: preset.enterpriseUtilization,
      tdp: card.tdp,
      serverPrice: config.serverPrices[card.serverTier],
    }));
  };

  const altitudeColumns = [
    {
      id: 'none' as const,
      title: t('plans.none.title'),
      utilization: state.currentUtilization,
      output: result.noneOutput,
      caption: t('comparison.noneCaption'),
    },
    {
      id: 'oss' as const,
      title: t('plans.oss.title'),
      utilization: result.ossEffectiveUtilization,
      output: result.ossOutput,
      caption: null as string | null,
    },
    {
      id: 'ent' as const,
      title: t('plans.enterprise.title'),
      utilization: state.enterpriseUtilization,
      output: result.enterpriseOutput,
      caption: t('comparison.entCaption', { util: state.enterpriseUtilization }),
    },
  ];

  const plans = [
    {
      id: 'none' as const,
      cardClass: '',
      nameClass: 'none',
      title: t('plans.none.title'),
      subtitle: t('plans.none.subtitle'),
      output: result.noneOutput,
      recommended: false,
      specs: [
        { value: `${state.currentUtilization}%`, label: t('plans.none.specs.utilization'), tone: 'none', danger: false },
        { value: '—', label: t('plans.none.specs.sharing'), tone: 'none', danger: false },
      ],
      features: (t.raw('plans.none.features') as string[]).map((feature) => ({ text: feature, muted: true })),
    },
    {
      id: 'oss' as const,
      cardClass: 'oss-card',
      nameClass: 'oss',
      title: t('plans.oss.title'),
      subtitle: t('plans.oss.subtitle'),
      output: result.ossOutput,
      recommended: false,
      specs: [
        { value: `${OSS_UTILIZATION_CAP}%`, label: t('plans.oss.specs.utilization'), tone: 'oss', danger: false },
        {
          value: t('plans.oss.scaleValue'),
          label: t('plans.oss.specs.scale'),
          tone: 'oss',
          danger: result.overOssScale,
          warn: result.overOssScale ? t('plans.oss.exceeded') : undefined,
        },
      ],
      features: [
        ...(t.raw('plans.oss.features') as string[]).map((feature, index) => ({
          text: feature,
          muted: index >= 2,
        })),
        {
          text: result.overOssScale
            ? t('plans.oss.limitNoteOver', { count: formatNumber(state.count) })
            : t('plans.oss.limitNote'),
          muted: true,
        },
      ],
    },
    {
      id: 'ent' as const,
      cardClass: 'ent',
      nameClass: 'ent',
      title: t('plans.enterprise.title'),
      subtitle: t('plans.enterprise.subtitle'),
      output: result.enterpriseOutput,
      recommended: true,
      specs: [
        { value: `${ENTERPRISE_UTILIZATION_CAP}%`, label: t('plans.enterprise.specs.utilization'), tone: 'ent', danger: false },
        { value: t('plans.enterprise.scaleValue'), label: t('plans.enterprise.specs.scale'), tone: 'ent', danger: false },
      ],
      features: (t.raw('plans.enterprise.features') as string[]).map((feature) => ({ text: feature, muted: false })),
    },
  ];

  const savingsRows = [
    { label: t('savings.gpu'), key: 'gpu' as const },
    { label: t('savings.server'), key: 'server' as const },
    { label: t('savings.network'), key: 'network' as const },
    { label: t('savings.electricity'), key: 'electricity' as const, tagged: true },
  ];

  const priceMax = Math.max(320000, Math.max(...activeVendor.cards.map((card) => card.price)));

  return (
    <MainLayout>
      <div className="hami-roi">
        <div className="hami-roi-wrap">
          <div className="header-row">
            <div>
              <Link
                href={localizedPath('/tools', locale)}
                className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 print:hidden"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                {tTools('backToList')}
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
            </div>
          </div>

          <div className="preset-row print:hidden">
            <span className="preset-label">{t('presetsLabel')}</span>
            {config.presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`preset${activePresetId === preset.id ? ' active' : ''}`}
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </button>
            ))}
            <span className="preset-spacer" />
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-[7px] rounded-[8px] bg-primary px-[18px] py-[9px] text-[0.78rem] font-semibold text-white transition-colors duration-200 hover:bg-primary-dark"
              onClick={() => window.print()}
            >
              <Download className="h-[14px] w-[14px]" />
              <span>{t('exportPdf')}</span>
            </button>
          </div>

          <div className="print-summary">
            <div className="print-summary-title">{t('printSummary.title')}</div>
            <div className="print-summary-grid">
              <div>{t('printSummary.model')}: {activeVendor.name} {activeCard.name}</div>
              <div>{t('printSummary.count')}: {formatNumber(state.count)} {t('inputs.countUnit')}</div>
              <div>{t('printSummary.price')}: {formatCardPrice(state.price)}</div>
              <div>{t('printSummary.current')}: {state.currentUtilization}%</div>
              <div>{t('printSummary.oss')}: {state.ossUtilization}%</div>
              <div>{t('printSummary.enterprise')}: {state.enterpriseUtilization}%</div>
            </div>
          </div>

          <div className="input-card print:hidden">
            <div className="section-title">{t('inputs.modelTitle')}</div>

            <div className="vendor-tabs">
              {catalog.map((vendor) => (
                <button
                  key={vendor.id}
                  type="button"
                  className={`vendor-tab${vendor.id === state.vendorId ? ' active' : ''}`}
                  onClick={() => selectVendor(vendor)}
                >
                  <span className="vdot" style={{ background: vendor.color }} />
                  {vendor.name}
                </button>
              ))}
            </div>

            <div className="card-select">
              {activeVendor.cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className={`card-pill${card.id === state.cardId ? ' active' : ''}`}
                  onClick={() => selectCard(card)}
                >
                  <span>{card.name}</span>
                  <span className="pprice">{formatCardPrice(card.price)}</span>
                </button>
              ))}
            </div>

            <div className="input-row">
              <div className="input-field">
                <div className="input-label">
                  <span>{t('inputs.count')}</span>
                  <span className="input-val">{formatNumber(state.count)} {t('inputs.countUnit')}</span>
                </div>
                <input type="range" min="50" max="5000" step="50" value={state.count} onChange={(event) => updateNumber('count', Number(event.target.value))} />
              </div>
              <div className="input-field">
                <div className="input-label">
                  <span>{t('inputs.price')}</span>
                  <span className="input-val">{formatNumber(state.price)}</span>
                </div>
                <input type="range" min="1000" max={priceMax} step="1000" value={state.price} onChange={(event) => updateNumber('price', Number(event.target.value))} />
              </div>
              <div className="input-field">
                <div className="input-label">
                  <span>{t('inputs.currentUtilization')}</span>
                  <span className="input-val amber">{state.currentUtilization}%</span>
                </div>
                <input type="range" min="10" max="35" value={state.currentUtilization} onChange={(event) => updateNumber('currentUtilization', Number(event.target.value))} />
              </div>
              <div className="input-field">
                <div className="input-label">
                  <span>{t('inputs.ossUtilization')}</span>
                  <span className="input-val amber">{state.ossUtilization}%</span>
                </div>
                <input type="range" min="25" max={OSS_UTILIZATION_CAP} value={state.ossUtilization} onChange={(event) => updateNumber('ossUtilization', Number(event.target.value))} />
              </div>
              <div className="input-field span-2">
                <div className="input-label">
                  <span>{t('inputs.enterpriseUtilization')}</span>
                  <span className="input-val green">{state.enterpriseUtilization}%</span>
                </div>
                <input type="range" min="50" max={ENTERPRISE_UTILIZATION_CAP} value={state.enterpriseUtilization} onChange={(event) => updateNumber('enterpriseUtilization', Number(event.target.value))} />
              </div>
            </div>

            <details className="adv-params">
              <summary>{t('advanced.title')}</summary>
              <div className="adv-grid">
                {([
                  ['perServer', t('advanced.perServer'), 1, 16, 1],
                  ['serverPrice', t('advanced.serverPrice'), 1000, 800000, 1000],
                  ['networkRatio', t('advanced.networkRatio'), 0, 30, 1],
                  ['tdp', t('advanced.tdp'), 50, 1200, 10],
                  ['loadFactor', t('advanced.loadFactor'), 30, 100, 5],
                  ['pue', t('advanced.pue'), 1.1, 2, 0.05],
                  ['electricityPrice', t('advanced.electricityPrice'), 0.01, 2, 0.01],
                  ['serverPower', t('advanced.serverPower'), 500, 4000, 100],
                ] as Array<[NumericCalculatorStateKey, string, number, number, number]>).map(([key, label, min, max, step]) => (
                  <div key={key} className="adv-field">
                    <label htmlFor={`hr-${key}`}>{label}</label>
                    <input
                      id={`hr-${key}`}
                      type="number"
                      min={min}
                      max={max}
                      step={step}
                      value={state[key]}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        if (!Number.isFinite(next)) return;
                        updateNumber(key, Math.min(max, Math.max(min, next)));
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="adv-note">{t('advanced.note')}</div>
            </details>
          </div>

          <div className="invest-bar">
            <div>
              <div className="invest-bar-label">
                {t('tco.title')} <span className="tco-tag">{t('tco.tag')}</span>
              </div>
              <div className="invest-bar-formula">
                {t('tco.breakdown', {
                  gpu: formatMoney(result.tco.gpu),
                  server: formatMoney(result.tco.server),
                  serverCount: formatNumber(result.tco.servers),
                  network: formatMoney(result.tco.network),
                  electricity: formatMoney(result.tco.electricity),
                })}
              </div>
            </div>
            <div className="invest-bar-num">{formatMoney(result.tco.total)}</div>
          </div>

          <div className="contrast-section">
            <div className="contrast-title">
              <div className="contrast-title-main">{t('comparison.title')}</div>
              <div className="contrast-title-sub">{t('comparison.subtitle')}</div>
            </div>

            <div className="altitude-chart">
              <div className="cap-lines-layer" aria-hidden>
                <div className="cap-line ent-line" />
                <div className="cap-line oss-line" />
              </div>

              {altitudeColumns.map((column) => {
                const heightPct = Math.min((column.utilization / ENTERPRISE_UTILIZATION_CAP) * 100, 100);
                return (
                  <div key={column.id} className="altitude-col">
                    <div className="altitude-bar-wrap">
                      <div className={`altitude-bar ${column.id}`} style={{ height: `${heightPct}%` }}>
                        {column.id === 'ent' ? <div className="ent-badge">{t('comparison.recommended')}</div> : null}
                        {column.id === 'oss' && result.overOssScale ? (
                          <div className="oss-cap-warn">{t('comparison.ossWarn')}</div>
                        ) : null}
                        <span>{Math.round(column.utilization)}%</span>
                      </div>
                    </div>
                    <div className="altitude-cap">
                      <div className={`altitude-cap-title ${column.id}`}>{column.title}</div>
                      <div className={`altitude-cap-num ${column.id}`}>{formatMoney(column.output)}</div>
                      {column.id === 'oss' ? (
                        <div className="altitude-cap-sub">
                          {result.overOssScale ? (
                            <>
                              <div>{t('comparison.ossCaptionOver', { util: result.ossInput })}</div>
                              <div className="warn">
                                {t('comparison.ossCaptionRest', {
                                  count: formatNumber(state.count - OSS_SCALE_CAP),
                                  baseline: state.currentUtilization,
                                })}
                              </div>
                            </>
                          ) : (
                            t('comparison.ossCaption', { util: result.ossInput })
                          )}
                        </div>
                      ) : (
                        <div className="altitude-cap-sub">{column.caption}</div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="cap-labels-layer">
                <div className="cap-line ent-line">
                  <span className="cap-line-label">{t('comparison.entCap')}</span>
                </div>
                <div className="cap-line oss-line">
                  <span className="cap-line-label">{t('comparison.ossCap')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan.id} className={`plan-card ${plan.cardClass}`}>
                {plan.recommended ? <span className="plan-tag">{t('comparison.recommendedShort')}</span> : null}
                <div className={`plan-name ${plan.nameClass}`}>{plan.title}</div>
                <div className="plan-sub">{plan.subtitle}</div>
                <div className="plan-specs">
                  {plan.specs.map((spec) => {
                    const warn = 'warn' in spec ? spec.warn : undefined;
                    return (
                      <div key={spec.label} className="spec-box">
                        {warn ? <span className="spec-warn-badge">{warn}</span> : null}
                        <div className={`spec-val ${spec.danger ? 'danger' : spec.tone}`}>{spec.value}</div>
                        <div className="spec-label">{spec.label}</div>
                      </div>
                    );
                  })}
                </div>
                <div className={`plan-num ${plan.nameClass}`}>{formatMoney(plan.output)}</div>
                <div className="plan-num-label">{t('comparison.effectiveOutput')}</div>
                <ul className="plan-feats">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className={feature.muted ? 'neg' : undefined}>{feature.text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="savings-section">
            <div className="savings-title">{t('savings.title')}</div>
            <div className="savings-sub">{t('savings.subtitle', { utilization: state.currentUtilization })}</div>
            <div className="savings-cols">
              {[
                {
                  id: 'oss' as const,
                  title: t('plans.oss.title'),
                  utilLabel: t('savings.utilTag', { utilization: Math.round(result.ossEffectiveUtilization) }),
                  data: result.ossSavings,
                },
                {
                  id: 'ent' as const,
                  title: t('plans.enterprise.title'),
                  utilLabel: t('savings.utilTag', { utilization: state.enterpriseUtilization }),
                  data: result.enterpriseSavings,
                },
              ].map((column) => (
                <div key={column.id} className={`savings-col ${column.id === 'ent' ? 'ent' : 'oss'}`}>
                  <div className="sv-col-head">
                    {column.title}
                    <span className="sv-col-util">{column.utilLabel}</span>
                  </div>
                  <div className="sv-cards">
                    {t('savings.released', {
                      gpus: formatNumber(column.data.gpus),
                      servers: formatNumber(column.data.servers),
                    })}
                  </div>
                  <div className="sv-items">
                    {savingsRows.map((row) => (
                      <div key={row.label} className="sv-item">
                        <span>
                          {row.label}
                          {row.tagged ? <span className="sv-elec-tag">{t('savings.electricityTag')}</span> : null}
                        </span>
                        <b>{formatMoney(column.data[row.key])}</b>
                      </div>
                    ))}
                  </div>
                  <div className="sv-total">
                    <span>{t('savings.total')}</span>
                    <b>{formatMoney(column.data.total)}</b>
                  </div>
                  {column.id === 'ent' ? (
                    <div className="sv-roi-line">
                      {t('savings.roiLine', {
                        cost: formatMoney(result.enterpriseCost),
                        roi: result.savingsRoi.toFixed(1),
                      })}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="savings-note">{t('savings.note')}</div>
          </div>

          <div className="value-hero">
            <div className="value-hero-tag">
              <span className="dot" />
              {t('hero.eyebrow')}
            </div>
            <div className="value-hero-label">{t('hero.releasedValue')}</div>
            <div className="value-hero-amount">{formatMoney(result.releasedValue)}</div>
            <div className="value-hero-vs">
              {t('hero.vsOss', {
                cost: formatMoney(result.enterpriseCost),
                extraValue: formatMoney(result.enterpriseVsOss),
                netGain: formatMoney(result.netGainVsOss),
                roi: result.ossComparisonRoi.toFixed(1),
              })}
            </div>
            <div className="value-hero-vs">
              {t('hero.avoidedPurchase', {
                count: formatNumber(result.extraCards),
                tco: formatMoney(result.extraTco),
              })}
            </div>
            <div className="value-hero-meta">
              <div>
                <div className="value-hero-meta-label">{t('hero.cost')}</div>
                <div className="value-hero-meta-value">{formatMoney(result.enterpriseCost)}</div>
              </div>
              <div>
                <div className="value-hero-meta-label">{t('hero.roi')}</div>
                <div className="value-hero-meta-value">
                  {result.roi.toFixed(1)} <span className="small">{t('hero.times')}</span>
                </div>
              </div>
              <div>
                <div className="value-hero-meta-label">{t('hero.payback')}</div>
                <div className="value-hero-meta-value">{t('hero.months', { value: result.paybackMonths.toFixed(1) })}</div>
              </div>
            </div>
          </div>

          <details className="foot-note">
            <summary>{t('notes.title')}</summary>
            <div style={{ marginTop: 10 }}>
              <p><b>{t('notes.ossTitle')}</b> {t('notes.oss')}</p>
              <p><b>{t('notes.enterpriseTitle')}</b> {t('notes.enterprise')}</p>
              <p><b>{t('notes.tcoTitle')}</b> {t('notes.tco')}</p>
            </div>
          </details>
        </div>
      </div>
    </MainLayout>
  );
}
