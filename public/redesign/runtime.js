/* Approved complete demo interactions, migrated without changing editorial content. */
export function mountRedesign(root, context) {
const normalizeHTML=context.normalizeHTML||((value)=>value);
const translateText=context.translateText||((value)=>value);
  const {
    document,
    window,
    location,
    localStorage,
    navigator,
    matchMedia,
    requestAnimationFrame,
    cancelAnimationFrame,
    setTimeout,
    clearTimeout,
    Blob,
    FormData,
    URL,
    URLSearchParams,
    data,
    text: uiCopy
  } = context;
  const HAMI = uiCopy("sc26e786858e46e");
  const app = document.querySelector(uiCopy("s732bfeabcbcc70"));
  const iconPaths = {
    chip: uiCopy("s156621097a6b71"),
    grid: uiCopy("se08ab14c4e0b66"),
    layers: uiCopy("s663eab2e29fb8b"),
    team: uiCopy("sb7d964678aa6c8"),
    chart: uiCopy("sb0c5012797b9a1"),
    code: uiCopy("s0a0b79de1c4bbe"),
    book: uiCopy("s6a5fc910dc9870"),
    check: uiCopy("sbb2ee8eea54739"),
    network: uiCopy("se51071d97839a6"),
    shield: uiCopy("s65c245d662fec4")
  };
  const icon = name => `<span class="icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${iconPaths[name] || iconPaths.grid}"/></svg></span>`;
  const link = (href, text) => `<a class="textlink" href="${href}">${text}<span class="arrow">${uiCopy("s161660030aa6c9")}</span></a>`;
  const cta = (title = uiCopy("sa7d9d204e5ed41"), desc = uiCopy("s29a10275ba87da")) => `<div class="final-cta"><div><h3>${title}</h3><p>${desc}</p></div><button class="btn primary" data-contact>${uiCopy("s100a75b2913a7b")}</button></div>`;
  const intro = (k, h, p = '', l = '') => `<div class="intro"><div><div class="eyebrow">${k}</div><h2>${h}</h2>${p ? `<p>${p}</p>` : ''}</div>${l}</div>`;
  const section = (content, cls = '', id = '') => `<section class="section ${cls}"${id ? `${uiCopy("sf19c8385f37d65")}${id}${uiCopy("s8a331fdde7032f")}` : ''}><div class="wrap">${content}</div></section>`;
  function arch() {
    return `<div class="visual-stage" aria-label="业务经过密瓜 GPU 共享、调度和管理层连接异构设备的示意"><div class="dotfield"></div><div class="arch"><div class="arch-caption"><span>${uiCopy("s105abc15574a2a")}</span><span>${uiCopy("s02555f3c39f10e")}</span></div><div class="workloads"><div class="workload"><i class="mini-dot"></i>${uiCopy("saf8b11e1a8445d")}</div><div class="workload"><i class="mini-dot"></i>${uiCopy("s65a4c3373377e5")}</div><div class="workload"><i class="mini-dot"></i>${uiCopy("sfdf065f442616f")}</div></div><div class="stream"><i></i><i></i><i></i></div><div class="engine"><div class="engine-top"><div><div class="engine-title">${uiCopy("s2dafad3f3ca154")}<span style="color:#76b900;font-size:13px;margin-left:6px">${uiCopy("s234f1b97e70059")}</span></div><div class="tiny">${uiCopy("s9c30b0b5498ea9")}</div></div>${icon(uiCopy("se3b816898ca5ba"))}</div><div class="engine-body"><div>${uiCopy("sfc2d7d0b2fcd75")}<span>${uiCopy("s20af03b1296fc9")}</span></div><div>${uiCopy("s64d14ca8ef2e19")}<span>${uiCopy("s5cbc288938e48d")}</span></div><div>${uiCopy("s6720ea68b33ac8")}<span>${uiCopy("s78f9ae721fb57f")}</span></div></div></div><div class="stream"><i></i><i></i><i></i></div><div class="device-row"><div class="device"><div class="dtop">${uiCopy("s28b919b23808ef")}<i class="mini-dot"></i></div><div class="slots"><i></i><i></i><i class="blue"></i><i class="gray"></i></div></div><div class="device"><div class="dtop">${uiCopy("s905bc05e7e6001")}<i class="mini-dot"></i></div><div class="slots"><i class="blue"></i><i class="blue"></i><i></i><i></i></div></div><div class="device"><div class="dtop">${uiCopy("s7ce59f2c46e202")}<i class="mini-dot"></i></div><div class="slots"><i></i><i class="gray"></i><i class="blue"></i><i class="gray"></i></div></div></div><div class="base-label">${uiCopy("s51dbe26057eb9d")}</div><div class="status-chip"><i class="mini-dot"></i>${uiCopy("s7521d766cc73e8")}</div></div></div>`;
  }
  function products() {
    return `<div class="grid2"><article class="product-card"><div class="audience">${uiCopy("s0c591729aec37f")}</div><h3>${uiCopy("sd6aff76589ed73")}</h3><p>${uiCopy("s7a8fe445b3480f")}</p><div class="product-vis"><div class="layer">${uiCopy("s5186ff0c311ecb")}<span>${uiCopy("s34fb9bd8bfc7bb")}</span></div><div class="layer accent">${uiCopy("sd6aff76589ed73")}<span>${uiCopy("sdfc1248c52c35e")}</span></div></div><ul><li>${uiCopy("saa162e843c93b7")}</li><li>${uiCopy("s5f7f24d7f6f0b2")}</li><li>${uiCopy("s52175ae6b1fb3e")}</li></ul><div class="card-actions">${link(uiCopy("s0b7e7750df02b5"), uiCopy("s068ab901a4cc62"))}<span class="label">${uiCopy("s7d5fb856fcce4c")}</span></div></article><article class="product-card platform"><div class="audience">${uiCopy("sf82e7a8cfa9897")}</div><h3>${uiCopy("s896fd762cb0eeb")}</h3><p>${uiCopy("s6e06e40079d432")}</p><div class="product-vis"><div class="layer navy">${uiCopy("s896fd762cb0eeb")}<span>${uiCopy("s7a5ab897c73b32")}</span></div><div class="layer accent">${uiCopy("s050fb0c36ac0ad")}<span>${uiCopy("sacd7f74ecfc8ac")}</span></div></div><ul><li>${uiCopy("s5aa6b700cbc182")}</li><li>${uiCopy("s506b2b68c71b8e")}</li><li>${uiCopy("s62c2a62410017c")}</li></ul><div class="card-actions">${link(uiCopy("s929cc1cbe8a04c"), uiCopy("s1313d928fc484c"))}<span class="label">${uiCopy("s6522756b8ce409")}</span></div></article></div><div class="opensource-strip"><img src="${HAMI}" alt="HAMi"><p><strong>${uiCopy("sf19187943068d4")}</strong>${uiCopy("sba96b73d5bd3cc")}</p>${link(uiCopy("s64a0210a3ec2c9"), uiCopy("s8d9a4b463152f8"))}</div>`;
  }
  const CASE_LIBRARY = data.CASE_LIBRARY;
  function caseLogo(c) {
    return `<span data-company="${c.slug}" class="case-company-logo ${c.logoDark ? uiCopy("s5a6da71ef2fc6a") : ''}"><img src="${c.logo}" alt="${safe(c.name)}" loading="lazy"></span>`;
  }
  function caseCards(limit = CASE_LIBRARY.length) {
    return CASE_LIBRARY.slice(0, limit).map(c => `<a class="case-preview" href="#/cases/${c.slug}" aria-label="查看案例：${safe(c.title)}"><div class="case-preview-top">${caseLogo(c)}<h3>${safe(c.title)}</h3></div><div class="case-preview-bottom"><div class="case-result"><strong class="case-result-number">${safe(c.metric)}</strong><span class="case-result-label">${safe(c.label)}</span><time datetime="${c.date}">${c.date.replaceAll('-', '.')}</time></div><span class="case-view">${uiCopy("s53c8df207f836a")}<span aria-hidden="true">${uiCopy("sca29edb4680a64")}</span></span></div></a>`).join('');
  }
  function practiceCTA() {
    return `<div class="case-more"><div><h2>${uiCopy("s35ce8690a21b31")}</h2><p>${uiCopy("s2c8c52728ddabc")}</p></div><a class="btn primary" href="#/get-practices">${uiCopy("s98692c5ed9acf7")}<span aria-hidden="true">${uiCopy("s161660030aa6c9")}</span></a></div>`;
  }
  function casePage() {
    return `<section class="case-overview-hero"><div class="wrap"><div class="eyebrow">${uiCopy("s6603e144bd1ede")}</div><h1>${uiCopy("s06350c2213ac51")}<br>${uiCopy("s84f337d935f4de")}</h1><p class="lead">${uiCopy("s2c87e07923285f")}</p></div></section>` + section(`<div class="case-library-meta"><strong>${CASE_LIBRARY.length}${uiCopy("sdca6b58790d96b")}</strong><a href="https://www.cncf.io/case-studies/?_sft_lf-project=hami" target="_blank" rel="noopener">${uiCopy("s3f88c75770817f")}</a></div><div class="case-library" id="case-list">${caseCards()}</div>${practiceCTA()}`);
  }
  function caseToc(c) {
    return c.toc.map((t, i) => `<a href="#/cases/${c.slug}?section=${t.id}" data-article-section="${t.id}"><span>${String(i + 1).padStart(2, '0')}</span>${safe(t.text)}</a>`).join('');
  }
  function caseAttribution(c) {
    return `<div class="case-source-note"><p>${uiCopy("s457f372b01cb1f")}<a href="${c.source}" target="_blank" rel="noopener">${safe(c.sourceTitle)}${uiCopy("s7d0da37bafe18c")}</a><br>${uiCopy("sb32b8a9b42bcf3")}${c.date}</p><p>${uiCopy("sea5f2a5dc73eed")}</p><p>${uiCopy("s88bb5dad6a039f")}<a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">${uiCopy("s6ec629769487dc")}</a>${uiCopy("sa1835474deff0b")}<a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">${uiCopy("safce5763629229")}</a>${uiCopy("s68706e28bfa89b")}</p>${c.note ? `<p class="fact-note">${uiCopy("sa5d8b670fca37c")}${safe(c.note)}</p>` : ''}</div>`;
  }
  function caseDetailPage(slug) {
    const c = CASE_LIBRARY.find(x => x.slug === slug);
    if (!c) return notFound();
    return `<article><section class="case-detail-hero"><div class="wrap"><nav class="breadcrumb" aria-label="面包屑"><a href="#/">${uiCopy("s203c08e0d44ac3")}</a><span>${uiCopy("s8a5edab2826324")}</span><a href="#/cases">${uiCopy("s6603e144bd1ede")}</a><span>${uiCopy("s8a5edab2826324")}</span><span>${safe(c.name)}</span></nav><div class="case-detail-title">${caseLogo(c)}<div><h1>${safe(c.title)}</h1><div class="case-source-line"><span>${uiCopy("s3d1fe51d7a486e")}</span><time datetime="${c.date}">${c.date.replaceAll('-', '.')}</time><a href="${c.source}" target="_blank" rel="noopener">${uiCopy("s20afc8ee6c4ae7")}</a></div></div></div><div class="case-key-outcomes" aria-label="三个关键成果">${c.outcomes.map(([value, label, context]) => `<div class="case-key-outcome"><b class="${value.length > 8 ? uiCopy("se18188296f78ae") : ''}">${safe(value)}</b><strong>${safe(label)}</strong>${context ? `<p>${safe(context)}</p>` : ''}</div>`).join('')}</div><div class="case-outcome-source"><a href="${c.outcomeSource}" target="_blank" rel="noopener">${uiCopy("s2ab2ba6083a767")}${c.outcomeSource.includes(uiCopy("s602c7945988e2b")) ? uiCopy("s22388696afe41f") : uiCopy("s02d0cbfa81ab69")}${uiCopy("s7d0da37bafe18c")}</a></div></div></section><div class="wrap case-reader"><div><details class="case-mobile-toc"><summary>${uiCopy("s421185c97f13fb")}</summary><nav>${caseToc(c)}</nav></details><div class="article-prose">${c.body}</div>${caseAttribution(c)}<div class="actions" style="margin-top:30px"><a class="btn" href="#/cases">${uiCopy("s8f4d6181850ac1")}</a><a class="btn primary" href="#/get-practices">${uiCopy("s1efd2889783dcb")}</a></div></div><aside class="article-toc" aria-label="案例目录"><strong>${uiCopy("s421185c97f13fb")}</strong>${caseToc(c)}</aside></div></article>`;
  }
  let practiceAccess = false;
  function practiceFormPage() {
    practiceAccess = false;
    return `<section class="sales-page"><div class="wrap sales-layout"><div class="sales-copy"><div class="eyebrow">${uiCopy("s7091ab77169e9f")}</div><h1>${uiCopy("s147af34039abc2")}<br>${uiCopy("s53b5770b6441a1")}</h1><p>${uiCopy("see4059babdd532")}</p><div class="practice-pack-preview"><strong>${uiCopy("s059ee48eeb0367")}</strong><p>${uiCopy("s91411a45234e49")}</p></div><p style="font-size:13px">${uiCopy("s2c5407e9fd77c3")}</p><a class="textlink" href="#/cases">${uiCopy("s19dadcbad1380a")}</a></div><div class="sales-form"><h2>${uiCopy("saea756d09f9dd2")}</h2><p>${uiCopy("sc186c2a64ea1e7")}</p><form id="practice-form"><div class="form-grid"><label class="field">${uiCopy("s259f1121cdc994")}<input name="name" required maxlength="80" autocomplete="name" placeholder="你的姓名"></label><label class="field">${uiCopy("s53bc39739ae700")}<input name="company" required maxlength="120" autocomplete="organization" placeholder="公司或组织名称"></label><label class="field full">${uiCopy("s9b2f790207e15e")}<input type="email" name="email" required maxlength="254" autocomplete="email" placeholder="you@company.com"></label><label class="field">${uiCopy("sbc3c0420e12ec7")}<input name="role" maxlength="120" autocomplete="organization-title" placeholder="你的职责"></label><label class="field">${uiCopy("s40eb6057d6c413")}<input name="phone" maxlength="80" placeholder="便于沟通的联系方式"></label><fieldset class="practice-gpu full"><legend>${uiCopy("s776478abe08e20")}</legend><div class="gpu-options">${[uiCopy("s0b70156a4f6031"), uiCopy("s54f60250d9b956"), uiCopy("s941f47da2d2a1b"), uiCopy("s260f0fd4669895"), uiCopy("sb406ad54abd5ae"), uiCopy("s012a344c3b1bc2")].map((v, i) => `<label class="gpu-choice"><input type="radio" name="gpu" value="${v}" required>${v}</label>`).join('')}</div></fieldset><label class="field full">${uiCopy("sa93fd8ab30b4d5")}<textarea name="notes" required minlength="5" maxlength="2000" placeholder="例如：设备型号、集群环境、训练或推理等应用场景，以及希望解决的问题。至少填写 5 个字符。"></textarea></label></div><p class="form-footnote">${uiCopy("s6472fdeccbce5b")}</p><button type="submit" class="btn primary">${uiCopy("s1d846ae2f38036")}</button></form><div id="practice-result" class="practice-result" role="status" tabindex="-1" hidden></div></div></div></section>`;
  }
  function validatePractice(form) {
    for (const name of [uiCopy("s82a3537ff0dbce"), uiCopy("sf168ccdd91548c"), uiCopy("sab5aa97074c454")]) {
      const el = form.elements[name],
        min = name === uiCopy("sab5aa97074c454") ? 5 : 1;
      el.setCustomValidity(translateText(el.value.trim().length < min ? name === uiCopy("sab5aa97074c454") ? uiCopy("s32ac3cbb4a9512") : uiCopy("s41a0564d3d5d8c") : ''));
    }
    return form.checkValidity();
  }
  document.addEventListener(uiCopy("sc96c6d5be8d08a"), e => {
    if (e.target.form?.id === uiCopy("sf5ea9bc26453e2")) e.target.setCustomValidity('');
  });
  document.addEventListener(uiCopy("s75490bd7b93e6f"), e => {
    if (e.target.id !== uiCopy("sf5ea9bc26453e2")) return;
    e.preventDefault();
    if (!validatePractice(e.target)) {
      e.target.reportValidity();
      return;
    }
    practiceAccess = true;
    e.target.hidden = true;
    const box = document.getElementById(uiCopy("sa4a2f8264d03b5"));
    box.hidden = false;
    box.innerHTML = normalizeHTML(`<span class="tag">${uiCopy("sa445b6bec792c1")}</span><h3>${uiCopy("sae36aa8fdb601d")}</h3><p>${uiCopy("s1577985fb42b59")}</p><button type="button" class="btn primary" data-practice-download>${uiCopy("s947b3f1bf6eb48")}</button><p data-download-status aria-live="polite"></p><p style="margin-top:20px;font-size:12px">${uiCopy("sac24390430701c")}</p>`);
    box.focus();
  });
  document.addEventListener(uiCopy("se5c7ffac26fed6"), async e => {
    if (!e.target.closest(uiCopy("scc5412c383efa2")) || !practiceAccess || !document.getElementById(uiCopy("sf5ea9bc26453e2"))?.hidden) return;
    const downloadButton=e.target.closest(uiCopy("scc5412c383efa2"));
    if(downloadButton.disabled)return;
    downloadButton.disabled=true;
    const status=document.querySelector(uiCopy("s3afbb8304398bf"));
    status.textContent=uiCopy("downloadPreparing");
    try {
    const content = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${uiCopy("s059ee48eeb0367")}</title><style>${uiCopy("sb0d0f4521ade49")}</style><main><h1>${uiCopy("s059ee48eeb0367")}</h1><p>${uiCopy("s0688607e8b74ba")}</p><p>${uiCopy("s3fd92f3f7f2927")}</p><nav>${CASE_LIBRARY.map(c => `<a href="#${c.slug}">${safe(c.name)}${uiCopy("s588da410532073")}${safe(c.title)}</a>`).join('')}</nav>${CASE_LIBRARY.map(c => `<article id="${c.slug}"><h1>${safe(c.title)}</h1><p>${safe(c.name)}${uiCopy("s588da410532073")}${c.date}</p>${c.body}${caseAttribution(c)}</article>`).join('')}</main></html>`;
    const portableContent=context.prepareDownload?await context.prepareDownload(content):content;
    const url = URL.createObjectURL(new Blob([portableContent], {
      type: uiCopy("sa258965c9914fc")
    }));
    const a = document.createElement(uiCopy("sca978112ca1bbd"));
    a.href = url;
    a.download = uiCopy("sf855a52017839f");
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    document.querySelector(uiCopy("s3afbb8304398bf")).textContent = translateText(uiCopy("sf0f8b0a3610ea6"));
    } catch {
      status.textContent=uiCopy("downloadRetry");
    } finally {
      downloadButton.disabled=false;
    }
  });
  const ECO_ASSETS = {
    "iluvatar": uiCopy("s28c8807088f7a9"),
    "amd": uiCopy("s71b92166f7a839"),
    "aws": uiCopy("s35af7b939d866b"),
    "nvidia": uiCopy("s4298ca81cc1130"),
    "biren": uiCopy("s068ff48926b34d"),
    "cambricon": uiCopy("sc6a7bd97d22996"),
    "t-head": uiCopy("sea01efa0fa0200"),
    "moore": uiCopy("s3f639e61f31b7b"),
    "kunlunxin": uiCopy("s81a3e059fba2f0"),
    "ascend": uiCopy("sa40be66f4bd87a"),
    "metax": uiCopy("s6684d444282455"),
    "hygon": uiCopy("s07f1393dcc36f2"),
    "enflame": uiCopy("se297fdc1d07cdc"),
    "vastai": uiCopy("s60f5a3f7c16df2"),
    "kubernetes": uiCopy("s9b0b93814603c1"),
    "llmd": uiCopy("s5da6fefa4c1020"),
    "prometheus": uiCopy("s90a31c86e8469f"),
    "envoy": uiCopy("s2428da840de925"),
    "containerd": uiCopy("s129b381866110b"),
    "koordinator": uiCopy("s19578f110c30e6"),
    "kueue": uiCopy("sc10df155b84677"),
    "vllm": uiCopy("s1c67142473caec"),
    "volcano": uiCopy("s6c9bb427b99269"),
    "kai": uiCopy("s40da22b4913194"),
    "cncf": uiCopy("sb0ecca39ab1d09")
  };
  function brandTile(id, name) {
    return `<div class="brand-tile" data-brand="${id}" title="${name}"><img src="${ECO_ASSETS[id]}" alt="${name}" loading="lazy"></div>`;
  }
  function cncfProof(company = false) {
    return `<div class="${company ? uiCopy("s6e6a89465fdc97") : uiCopy("sd30511ba057e58")}"><div class="${company ? uiCopy("s22cdb4b968a011") : uiCopy("sa68694018134ad")}">${company ? '' : `<div class="cncf-marks">`}<img src="${HAMI}" alt="HAMi"><i aria-hidden="true"></i><img src="${ECO_ASSETS.cncf}" alt="Cloud Native Computing Foundation">${company ? '' : `</div>`}${company ? `</div>` : ''}<div class="cncf-copy"><strong>${uiCopy("s404d7c1dfcb8cd")}</strong><p>${company ? uiCopy("s6b7022cb6fa07b") : uiCopy("sac78f517dffba1")}</p></div><a class="${company ? uiCopy("sdd8412d8011d34") : uiCopy("s6469d3ae5a1376")}" href="https://www.cncf.io/projects/hami/" target="_blank" rel="noopener">${company ? uiCopy("sd3af0fbcaab2c1") : uiCopy("s14a88527e16f53")}</a>${company ? '' : `</div>`}</div>`;
  }
  function ecosystem() {
    return `<div class="ecosystem"><div class="eco-label">${uiCopy("s842836ba0dc359")}</div><div class="eco-layer"><span>${uiCopy("sa68d504211445e")}</span><span>${uiCopy("s6249a8e1208960")}</span><span>${uiCopy("sc275d742b000b6")}</span></div><div class="eco-core">${uiCopy("s83e75e566288b3")}</div><div class="eco-connector"></div><div class="eco-layer" style="margin:0"><span>${uiCopy("s6ef924c151c720")}</span></div><div class="eco-connector"></div><div class="eco-hardware"><span>${uiCopy("s0890f456684a70")}</span><span>${uiCopy("s3c8a873e2dc05c")}</span><span>${uiCopy("sf4028f1cfbe3d7")}</span><span>${uiCopy("s89b1aee4285be9")}</span><span>${uiCopy("s412b57e7120390")}</span><span>${uiCopy("sfb18fcea5da9db")}</span></div><div class="eco-note">${uiCopy("s53c564283d8806")}</div></div>`;
  }
  function resources() {
    return `<div class="grid3">${[[uiCopy("s92719fe0cf8cd5"), uiCopy("s7855e5e9727ea5"), uiCopy("sa367e1f2a4640d"), uiCopy("s91e9c2609a5392")], [uiCopy("s0f2a693e93e2ed"), uiCopy("sc20f7618d330a8"), uiCopy("s6e34d643988814"), uiCopy("s1335af64ab2005")], [uiCopy("scc57fc1903e444"), uiCopy("s5ca6730d441522"), uiCopy("s7c67703e49ed02"), uiCopy("s4f1f138e4c79c9")]].map(([i, t, d, u]) => `<a class="resource-card" href="${u}">${icon(i)}<div><strong>${t}</strong><small>${d}</small></div><span class="arrow">${uiCopy("sca29edb4680a64")}</span></a>`).join('')}</div>`;
  }
  function faq() {
    const entries = ['opensource', 'product', 'compatibility', 'performance', 'cases', 'evaluation', 'support'];
    return `<section class="home-faq" aria-labelledby="home-faq-title" id="faq"><div class="home-faq-heading"><div class="eyebrow">${uiCopy('faq.eyebrow') || ''}</div><h2 id="home-faq-title">${uiCopy('faq.title') || ''}</h2></div><div class="home-faq-list">${entries.map(key => `<details name="home-faq"><summary><span>${uiCopy('faq.' + key + '.q') || ''}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="home-faq-answer"><p>${uiCopy('faq.' + key + '.a') || ''}</p></div></details>`).join('')}</div></section>`;
  }
  const HOME_MOTION = {
    brand: uiCopy("s91b9cdcbcb342b"),
    brandPoster: uiCopy("s95fee417e1c8b6"),
    original: uiCopy("sb26039279d4d55"),
    originalPoster: uiCopy("s563bdd96dbae23")
  };
  function motionImage(key, poster, cls, alt) {
    const reduced = matchMedia(uiCopy("sfce63bfb9ebaba")).matches;
    return `<img class="${cls}" data-motion-image="${key}" src="${HOME_MOTION[reduced ? poster : key]}" alt="${alt}" data-motion-poster="${poster}" data-motion-paused="${reduced}">`;
  }
  function brandSignature() {
    return `<div class="brand-signature"><div class="brand-motion brand-cycle" role="img" aria-label="${uiCopy("s0510925c41d7bb")}"><span class="brand-cycle-frame brand-cycle-dynamia" aria-hidden="true"><img class="cycle-light" src="/redesign/assets/cf10a2fcc13438169897.svg" alt=""><img class="cycle-dark" src="/redesign/assets/931baba8fa5e14fe2655.svg" alt=""></span><span class="brand-cycle-frame brand-cycle-hami" aria-hidden="true"><span class="brand-cycle-label">${uiCopy("brandCreatorsOf")}</span><span class="brand-cycle-logo"><img class="cycle-light" src="${HAMI}" alt=""><img class="cycle-dark" src="/redesign/assets/hami-horizontal-color-white.png" alt=""></span></span></div><a class="cncf-project-link" href="https://www.cncf.io/projects/hami/" target="_blank" rel="noopener"><b>${uiCopy("s4b4c706a63b2b9")}</b><span>${uiCopy("s8fa56c2b094b9c")}</span><span aria-hidden="true">${uiCopy("sca29edb4680a64")}</span></a></div>`;
  }
  function originalHomeAnimation() {
    return `<figure class="original-animation">${motionImage(uiCopy("s0682c5f2076f09"), uiCopy("s0439c24b0c553b"), '', uiCopy("s639bca75d8b51e"))}</figure>`;
  }
  function syncMotionButtons() {
    document.querySelectorAll(uiCopy("s658191dac2cc7b")).forEach(b => {
      const im = document.querySelector(`${uiCopy("s885a1412e82488")}${b.dataset.motionToggle}${uiCopy("s9980a615c2c256")}`);
      const paused = im?.dataset.motionPaused === uiCopy("sb5bea41b6c623f");
      b.setAttribute(uiCopy("scaf57005bfdd09"), String(paused));
      b.setAttribute(uiCopy("s66ba2129a90d4a"), (paused ? uiCopy("sc3396195e91ccd") : uiCopy("s8d12fc0d4eb260")) + (b.dataset.motionToggle === uiCopy("s04a9fba2f0c404") ? uiCopy("sf73f76d26759fc") : uiCopy("s934b8a14ba68a2")));
      b.textContent = b.dataset.motionToggle === uiCopy("s04a9fba2f0c404") ? paused ? '▷' : 'Ⅱ' : paused ? uiCopy("sba51e0ff821593") : uiCopy("s2606b4fc612432");
    });
  }
  document.addEventListener(uiCopy("se5c7ffac26fed6"), e => {
    const b = e.target.closest(uiCopy("s658191dac2cc7b"));
    if (!b) return;
    const im = document.querySelector(`${uiCopy("s885a1412e82488")}${b.dataset.motionToggle}${uiCopy("s9980a615c2c256")}`),
      pause = im.dataset.motionPaused !== uiCopy("sb5bea41b6c623f");
    im.src = HOME_MOTION[pause ? im.dataset.motionPoster : im.dataset.motionImage];
    im.dataset.motionPaused = String(pause);
    syncMotionButtons();
  });
  function communityCommitment() {
    const metrics = [[uiCopy("see798ee5171f7a"), uiCopy("s4d54df5a957905"), `<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>`], [uiCopy("s6082f4baecb16a"), '700+', `<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3"/>`], [uiCopy("s7a6d33a01fe13f"), uiCopy("s2fb6b1a12f2e09"), `<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>`], [uiCopy("sc0796137a9f7f1"), '300+', `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h4M7 12h4m3 3 2 2 4-4"/>`]];
    return `<section class="community-commitment" id="community-commitment" aria-labelledby="community-title"><div class="wrap"><div class="community-heading"><div><div class="eyebrow">${uiCopy("s205eb365c88b51")}</div><h2 id="community-title">${uiCopy("s7fc2d0972c1079")}</h2></div><p>${uiCopy("s5a890d93641716")}<a href="https://www.cncf.io/projects/hami/" target="_blank" rel="noopener">${uiCopy("s88342a6ff6fcda")}</a>${uiCopy("sf5099a7773aafc")}</p></div><div class="community-metrics">${metrics.map(([label, value, svg], index) => `<div class="community-number-row"><div class="community-metric-label"><svg viewBox="0 0 24 24" aria-hidden="true">${svg}</svg><span>${label}</span></div><div class="community-number"><span ${index === 0 ? 'data-github-stars' : index === 2 ? 'data-container-pulls' : ''}>${index === 0 || index === 2 ? '—' : value}</span><span class="lit-number" ${index === 0 ? 'data-github-stars' : index === 2 ? 'data-container-pulls' : ''} aria-hidden="true">${index === 0 || index === 2 ? '—' : value}</span></div></div>`).join('')}</div><div class="community-section-link"><a href="#/opensource">${uiCopy("sb9a11caae58ca7")}<span aria-hidden="true">${uiCopy("sca29edb4680a64")}</span></a></div></div></section>`;
  }
  let communityScrollFrame = 0;
  function updateCommunityNumbers() {
    communityScrollFrame = 0;
    document.querySelectorAll(uiCopy("s73e1230d59edcc")).forEach(row => {
      const rect = row.getBoundingClientRect(),
        center = rect.top + rect.height / 2;
      // Like Solo: a row stays dim until it reaches the middle of the viewport.
      // Reduced-motion users retain the scroll state, without animated movement.
      const progress = Math.max(0, Math.min(1, (window.innerHeight * .58 - center) / (window.innerHeight * .10)));
      row.style.setProperty(uiCopy("sf2e07dd1352e07"), progress.toFixed(3));
      row.style.setProperty(uiCopy("s7a38e81a20cbb2"), (.25 + .75 * progress).toFixed(3));
      row.classList.toggle(uiCopy("scc3ddff7b315cb"), progress >= .99);
    });
  }
  function queueCommunityNumbers() {
    if (!communityScrollFrame) communityScrollFrame = requestAnimationFrame(updateCommunityNumbers);
  }
  window.addEventListener(uiCopy("se16a9d4d1cf9ea"), queueCommunityNumbers, {
    passive: true
  });
  window.addEventListener(uiCopy("sacd532d8913e66"), queueCommunityNumbers);
  matchMedia(uiCopy("sfce63bfb9ebaba")).addEventListener(uiCopy("s12ea12eace7d65"), queueCommunityNumbers);
  function homepage() {
    return `<section class="hero home-hero"><div class="wrap hero-grid"><div><div class="eyebrow hero-signature">${uiCopy("s98f908e58835fc")}</div><h1>${uiCopy("home.hero.title")}<br><em>${uiCopy("home.hero.emphasis")}</em></h1><div class="hero-message-support"><p class="hero-positioning">${uiCopy("home.hero.positioning")}</p><p class="lead hero-description">${uiCopy("home.hero.description")}</p></div><div class="actions"><button class="btn primary" data-contact>${uiCopy("s100a75b2913a7b")}</button>${starProof()}</div></div>${originalHomeAnimation()}</div>${heroUsers()}</section>` + section(whyChoose(), uiCopy("s76ea797fbf44a4"), uiCopy("sc00bfdb7447193")) + section(intro(uiCopy("s3f8ed77e6177a7"), uiCopy("sad2632015fbd3d"), uiCopy("s33a74c93d454c2"), link(uiCopy("sa4fc0519455ff4"), uiCopy("sf3f186e082a7a2"))) + products(), '', uiCopy("s0a3e27b8ca8182")) + section(homepageEcosystem(), uiCopy("s081441479ce153"), uiCopy("s570dd38dc5baf3")) + communityCommitment() + section(faq() + cta() + `<div class="home-brand-closing">${brandSignature()}</div>`, '', uiCopy("scced28c6dc3f99"));
  }
  function renderPool(mode = uiCopy("s433cd7fc8060e0")) {
    const shared = mode === uiCopy("sa4d26868017c0c");
    document.querySelector(uiCopy("s784eaa6228632e")).innerHTML = normalizeHTML(`<div class="gpu-grid">${[0, 1, 2].map(i => `<div class="gpu-block"><strong>${uiCopy("s4c3a114a33f1f8")}${String(i + 1).padStart(2, '0')}</strong><div class="gpu-memory">${shared ? i === 0 ? `<div class="job" style="height:38px">${uiCopy("sfe343d519e5258")}</div><div class="job blue" style="height:38px">${uiCopy("s5205af2e5499e2")}</div><div class="job orange" style="height:38px">${uiCopy("sc27d97ea3537dc")}</div>` : '' : `<div class="job ${i === 1 ? uiCopy("s16477688c0e006") : i === 2 ? uiCopy("s1b4c9133da73a7") : ''}" style="height:38px">${uiCopy("scaa71bda0f8f9b")}${uiCopy("sb5d4045c3f466f")[i]}</div>`}</div></div>`).join('')}</div><p class="pool-caption">${shared ? uiCopy("s568e3452b49bf4") : uiCopy("s323a2c273ce1d1")}</p>`);
    document.querySelectorAll(uiCopy("s7124f88aa34fb7")).forEach(b => {
      b.classList.toggle(uiCopy("s96879611650f80"), b.dataset.pool === mode);
      b.setAttribute(uiCopy("scaf57005bfdd09"), b.dataset.pool === mode);
    });
  }
  function renderCap(id = uiCopy("sc3bc45ac352fe4")) {
    let content = '';
    if (id === uiCopy("sc3bc45ac352fe4")) content = `<div class="console-heading"><h4>${uiCopy("s388a6a75900967")}</h4><span>${uiCopy("s608d0b13cc8bdf")}</span></div><div class="mini-stats"><div class="mini-stat"><small>${uiCopy("s4d90e79d6e2779")}</small><b>${uiCopy("s939f59faad878a")}</b></div><div class="mini-stat"><small>${uiCopy("sd49ab45abe5209")}</small><b>${uiCopy("s43613e51063f1c")}</b></div><div class="mini-stat"><small>${uiCopy("s80c1f17632d600")}</small><b>${uiCopy("scc1cf1f0150668")}</b></div></div><table class="mini-table"><thead><tr><th>${uiCopy("s63c2b006b0bc9c")}</th><th>${uiCopy("s8dfdf04ba1c47d")}</th><th>${uiCopy("sadb18344fd873c")}</th><th>${uiCopy("s6320b4a8722a85")}</th></tr></thead><tbody>${[uiCopy("s4b911f91b5ec15"), uiCopy("sfc2e8068157bb2"), uiCopy("sdc367a7c561565")].map((v, i) => `<tr><td>${v}</td><td>${uiCopy("s9bf1bf3ed57837")}</td><td><div class="bar"><i style="width:${[36, 52, 28][i]}%"></i></div></td><td class="state">${uiCopy("scd08bc1c884b17")}</td></tr>`).join('')}</tbody></table>`;else if (id === uiCopy("seb7e1d753aa71f")) content = `<div class="console-heading"><h4>${uiCopy("s7c7ebf99292d43")}</h4><span>${uiCopy("s5f995ecdf05ead")}</span></div><div class="cluster-map"><div class="cluster-node">${uiCopy("se7e289926e862e")}<b>${uiCopy("scfb2b6aab5aed1")}</b></div><span class="cluster-link">${uiCopy("sbda050585a00f0")}</span><div class="cluster-node" style="background:#eaf4df;border-color:#c3dda5">${uiCopy("s896fd762cb0eeb")}<b>${uiCopy("s6c659a2723555b")}</b></div><span class="cluster-link">${uiCopy("sbda050585a00f0")}</span><div class="cluster-node">${uiCopy("sf51cbeafec9c20")}<b>${uiCopy("s21c8215eb4d93e")}</b></div></div><table class="mini-table"><tr><th>${uiCopy("sf516c7d9d20317")}</th><th>${uiCopy("s5192009d2b87cb")}</th></tr><tr><td>${uiCopy("s14b2da2d58f38a")}</td><td>${uiCopy("sbce96e3c3f037c")}</td></tr></table>`;else content = `<div class="console-heading"><h4>${uiCopy("sdce130841770e9")}</h4><span>${uiCopy("s483eb1fdf12577")}</span></div><div class="quotas">${[uiCopy("s43f1d765f8cc3b"), uiCopy("sca0bc37a7067b0"), uiCopy("sfdd655cf571d9d")].map((x, i) => `<div class="quota">${x}<div><i style="width:${[62, 42, 73][i]}%"></i></div><small>${uiCopy("s060e9c194202f6")}</small></div>`).join('')}</div><table class="mini-table"><tr><th>${uiCopy("s4f0d458874d479")}</th><th>${uiCopy("se6a897f5ebc164")}</th><th>${uiCopy("s40f6d6bab7e54c")}</th></tr><tr><td>${uiCopy("s52a8056e0e06a0")}</td><td>${uiCopy("s6e6d6ddbb7c1a4")}</td><td>${uiCopy("s00a87a144308b9")}</td></tr><tr><td>${uiCopy("scaaae0bc4a5ac3")}</td><td>${uiCopy("s379b2f2fe0e1bb")}</td><td>${uiCopy("s0142a521aa1312")}</td></tr></table>`;
    const panel = document.querySelector(uiCopy("s30c33de699d93a"));
    panel.setAttribute(uiCopy("sedde6c5d24e5a6"), uiCopy("s4c51b8cffb9a43") + id);
    panel.innerHTML = normalizeHTML(`<div class="console reveal"><div class="console-bar"><span class="window-dots"><i></i><i></i><i></i></span><span>${uiCopy("s3a2cf7d5a8058a")}</span><span>${uiCopy("s04f9d502b9430f")}</span></div><div class="console-main"><div class="console-side"><i></i><i></i><i></i><i></i></div><div class="console-content">${content}</div></div></div>`);
    document.querySelectorAll(uiCopy("sb4088bfb65ad25")).forEach(b => {
      b.classList.toggle(uiCopy("s96879611650f80"), b.dataset.cap === id);
      b.setAttribute(uiCopy("s7a36887bd59142"), b.dataset.cap === id);
      b.tabIndex = b.dataset.cap === id ? 0 : -1;
    });
  }
  function pageHero(k, title, desc, buttons = '', side = '') {
    return `<section class="page-hero"><div class="wrap"><div class="breadcrumb"><a href="#/">${uiCopy("s203c08e0d44ac3")}</a><span>${uiCopy("s8a5edab2826324")}</span><span>${k}</span></div><div class="${side ? uiCopy("sb730e5c696592d") : ''}"><div><div class="eyebrow">${k}</div><h1>${title}</h1><p class="lead">${desc}</p>${buttons ? `<div class="actions">${buttons}</div>` : ''}</div>${side}</div></div></section>`;
  }
  const mainButton = `<button class="btn primary" data-contact>${uiCopy("s100a75b2913a7b")}</button>`;
  function comparison() {
    const rows = [[uiCopy("sf957ff27377a26"), uiCopy("sc9dc899d2529ad"), uiCopy("s709c44a8d28a4b"), uiCopy("sd7be9878b92203")], [uiCopy("s1c76cd37be000b"), uiCopy("s11f5f02e90177d"), uiCopy("s91d70b19f3d788"), uiCopy("s0466d2cb57a2f9")], [uiCopy("s9ed3c8b006df92"), uiCopy("s32eb4894c98970"), uiCopy("s40f344b8083edb"), uiCopy("s0a6a4ea50b755b")], [uiCopy("s6cc4c15cf591df"), uiCopy("s5827af9b2b7224"), uiCopy("se78541379f57e0"), uiCopy("se180c778b84ad9")], [uiCopy("scfa41fe77b9cf7"), uiCopy("s5827af9b2b7224"), uiCopy("se78541379f57e0"), uiCopy("se180c778b84ad9")], [uiCopy("s00043fa61eb299"), uiCopy("s87385eb586bd4a"), uiCopy("se3c1a25c90ea02"), uiCopy("se3c1a25c90ea02")]];
    return `<div class="comparison-wrap"><table class="comparison"><thead><tr><th>${uiCopy("sb081a851d6b82f")}</th><th>${uiCopy("s605bbf91612c58")}<small>${uiCopy("s0448a702a9c01c")}</small></th><th>${uiCopy("sd6aff76589ed73")}<small>${uiCopy("s279e01bd1565c2")}</small></th><th>${uiCopy("s896fd762cb0eeb")}<small>${uiCopy("s1eb2e19894dec4")}</small></th></tr></thead><tbody>${rows.map(row => `<tr>${row.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}<tr><td>${uiCopy("s5aa44558b52d2e")}</td><td>${link(uiCopy("s64a0210a3ec2c9"), uiCopy("s5bcd0ddcdd694b"))}</td><td>${link(uiCopy("s0b7e7750df02b5"), uiCopy("s068ab901a4cc62"))}</td><td>${link(uiCopy("s929cc1cbe8a04c"), uiCopy("s1313d928fc484c"))}</td></tr></tbody></table></div><p class="case-disclaimer">${uiCopy("s278c0ecd41676a")}</p>`;
  }
  const VIDEO_LIBRARY = [{
    id: uiCopy("s60749771cd2948"),
    title: uiCopy("sa2d81ae167b215"),
    description: uiCopy("s93e0782706f622"),
    duration: '8:50',
    bvid: uiCopy("sa0e1573de04667")
  }, {
    id: uiCopy("s8fdf2422538f8f"),
    title: uiCopy("sdeae504970fd41"),
    description: uiCopy("scaa7bc78d6aa9b"),
    duration: '13:29',
    bvid: uiCopy("s39a66624fc60e6")
  }];
  function videosPage() {
    return pageHero(uiCopy("s21734c193385b2"), uiCopy("sc20f7618d330a8"), uiCopy("s40a4a495a79c0d")) + section(`<div class="video-library">${VIDEO_LIBRARY.map(v => `<a class="video-card" href="#/videos/${v.id}" aria-label="观看：${v.title}"><div class="video-cover"><img src="/redesign/assets/e21fa5bd833c3276b91d.png" alt="" loading="lazy"><span class="video-play" aria-hidden="true">${uiCopy("sf36bd7b77a9be1")}</span><span class="video-duration">${v.duration}</span></div><div class="video-card-copy"><h2>${v.title}</h2><p>${v.description}</p><span class="textlink">${uiCopy("s1d68addb94c1f8")}<span aria-hidden="true">${uiCopy("s161660030aa6c9")}</span></span></div></a>`).join('')}</div><p class="video-update-note">${uiCopy("sf1881a9845e332")}</p>`);
  }
  function videoDetailPage(id) {
    const v = VIDEO_LIBRARY.find(x => x.id === id);
    if (!v) return notFound();
    return pageHero(uiCopy("sc20f7618d330a8"), v.title, v.description) + section(`<a class="textlink" href="#/videos">${uiCopy("s9ea3cdb6d6e7c8")}</a><div class="video-player"><iframe src="https://player.bilibili.com/player.html?bvid=${v.bvid}&autoplay=0&quality=80&danmaku=0" title="${v.title}" allow="fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><p class="video-player-note">${uiCopy("sd0d607b1b2d658")}<a href="https://www.bilibili.com/video/${v.bvid}/" target="_blank" rel="noopener">${uiCopy("sea1b8f9b608306")}</a></p>`);
  }
  function resourcePage() {
    return pageHero(uiCopy("sdaa6d02a55bc3d"), uiCopy("sc4a7d8846db15a"), uiCopy("sf23e09ca6e725c")) + section(resources()) + section(intro(uiCopy("s48b484e1202f01"), uiCopy("s016b0bf090480f")) + toolCards(), uiCopy("s76ea797fbf44a4"));
  }
  function compatibilityPage() {
    return pageHero(uiCopy("s142a53800664a9"), `${uiCopy("sc9c043b3a9ab09")}<br>${uiCopy("sb4dda3e66000f9")}`, uiCopy("se4b5a2990425dd")) + section(`<div class="compat"><div><div class="eyebrow">${uiCopy("s0a3e713d51fd13")}</div><h2>${uiCopy("s25087434d15244")}</h2><p>${uiCopy("s08491651a2ce13")}</p><div class="actions">${link(uiCopy("sb1cc02be2b578d"), uiCopy("s0df2c3992494b4"))}</div></div>${ecosystem()}</div>`) + section(intro(uiCopy("sc6f9a90036bf49"), uiCopy("sa1f92416e021e4")) + `<div class="grid4">${[[uiCopy("s3009be769fb8f9"), uiCopy("scef7a4beba6cb3"), uiCopy("s421be782777d75")], [uiCopy("sd7cea7305a333d"), uiCopy("s577ee9fbf34964"), uiCopy("s8b16f174df48e2")], [uiCopy("scc57fc1903e444"), uiCopy("s80c1f17632d600"), uiCopy("s0dd9b0f486277e")], [uiCopy("se3b816898ca5ba"), uiCopy("s58457e8011a54b"), uiCopy("sb247db0797d17f")]].map(([i, h, p]) => `<div class="feature-card">${icon(i)}<h3>${h}</h3><p>${p}</p></div>`).join('')}</div><div class="page-callout">${uiCopy("sffb9233a321d7d")}</div>` + cta(uiCopy("s0b1ca84f720db7")), uiCopy("s76ea797fbf44a4"));
  }
  const TEAM_MEMBERS = [{
    "id": uiCopy("sb2ab54fd83e577"),
    "name": uiCopy("sc69c375762d453"),
    "role": uiCopy("s09514c7d35e094"),
    "tag": uiCopy("se6ac154f384ade"),
    "image": uiCopy("s1c740a5702b1bb"),
    "github": uiCopy("sdc0a7827939b4e"),
    "linkedin": uiCopy("s9f964ff7744a10"),
    "bio": uiCopy("s7902490440ea7b"),
    "details": [[uiCopy("s493be52c8a39b5"), uiCopy("sd7e168b8309656")], [uiCopy("sa6a81243233e92"), uiCopy("s7d94af8ccf49c1")]]
  }, {
    "id": uiCopy("s4692a3334b4419"),
    "name": uiCopy("s32c7ee76104b25"),
    "role": uiCopy("se7fd1af6128c4b"),
    "tag": uiCopy("se6ac154f384ade"),
    "image": uiCopy("sdf03fb6fa9ec38"),
    "github": uiCopy("s97fd1d966ef1b2"),
    "linkedin": uiCopy("sc5581067bbeba4"),
    "bio": uiCopy("s1c94aa006e4ea1"),
    "details": [[uiCopy("s493be52c8a39b5"), uiCopy("s06ece297b8b0ea")], [uiCopy("sa6a81243233e92"), uiCopy("s7e39081d97a790")]]
  }, {
    "id": uiCopy("s930a68a51a2db9"),
    "name": uiCopy("s61fca22430aa22"),
    "role": uiCopy("s85c59e66d9490e"),
    "tag": uiCopy("s5ef1d8f4ee187e"),
    "image": uiCopy("s2d1afa580740ab"),
    "github": uiCopy("sb70717aa7ba333"),
    "linkedin": uiCopy("s3810a0ce5f152e"),
    "bio": uiCopy("s8deb4e903dce0a"),
    "details": []
  }, {
    "id": uiCopy("team.reza.id"),
    "name": uiCopy("team.reza.name"),
    "role": uiCopy("team.reza.role"),
    "tag": uiCopy("team.reza.tag"),
    "image": uiCopy("team.reza.image"),
    "github": "",
    "linkedin": "",
    "bio": uiCopy("team.reza.bio"),
    "details": []
  }];
  function teamSocial(member) {
    if (!member.github && !member.linkedin) return '';
    return `<div class="social-links"><a class="social-link" href="${member.github}" target="_blank" rel="noopener" aria-label="${member.name}的 GitHub"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.96c.85 0 1.7.11 2.5.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.61c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg></a>${member.linkedin ? `<a class="social-link" href="${member.linkedin}" target="_blank" rel="noopener" aria-label="${member.name}的 LinkedIn">${uiCopy("s582967534d0f90")}</a>` : ''}</div>`;
  }
  function teamCards() {
    return `<div class="team-grid">${TEAM_MEMBERS.map((m, i) => `<article class="member-card"><button class="member-open" data-member="${i}" aria-label="查看${m.name}的介绍"><div class="member-photo" data-person="${m.id}"><img src="${m.image}" alt="${m.name}" loading="eager"><span class="member-more" aria-hidden="true">${uiCopy("sca29edb4680a64")}</span></div><div class="member-name"><h3>${m.name}</h3></div><p class="member-role">${m.role}</p><p class="member-tag">${m.tag}</p></button><div class="member-bottom"><button class="member-bio-link" data-member="${i}">${uiCopy("s85faee1dd1c732")}<span class="arrow">${uiCopy("s161660030aa6c9")}</span></button>${teamSocial(m)}</div></article>`).join('')}</div>`;
  }
  const MILESTONES = [['2025.01', uiCopy("s9320fe615f2eff"), uiCopy("s695be6920c46a8")], ['2025.03', uiCopy("s6e879649a68ab9"), uiCopy("sf536b4b6b9eee2")], ['2026.01', uiCopy("s13db6e582ecc3a"), uiCopy("s4774f6e915c429")], ['2026.01', uiCopy("sc62d53d5dcce77"), uiCopy("s80b4cecd744dd1")], ['2026.03', uiCopy("s1baad2355319ba"), uiCopy("s99af3a0da0138f")], ['2026.05', uiCopy("s1bf2a6d097ac81"), uiCopy("s04154451360019")], ['2026.07', uiCopy("s2449bd335ef61f"), uiCopy("sf3edbf15342cab")]];
  function companyInterview() {
    return `<section class="company-interview section" id="infoq-interview" aria-labelledby="interview-title"><div class="wrap"><div class="interview-heading"><div><div class="eyebrow">${uiCopy('about.interview.eyebrow') || ''}</div><h2 id="interview-title">${uiCopy('about.interview.title') || ''}</h2></div><p>${uiCopy('about.interview.description') || ''}</p></div><a class="interview-window" href="https://weixin.qq.com/sph/ANYS6O8oz2" target="_blank" rel="noopener noreferrer" aria-label="${uiCopy('about.interview.watch') || ''}"><img src="/redesign/assets/infoq-interview-cover.jpg" width="1448" height="1086" loading="lazy" alt="${uiCopy('about.interview.alt') || ''}"><span class="interview-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10-6.5z"/></svg></span><span class="interview-window-action">${uiCopy('about.interview.watch') || ''}<span aria-hidden="true"> ↗</span></span></a><div class="interview-caption"><span>${uiCopy('about.interview.note') || ''}</span></div></div></section>`;
  }
  function aboutPage() {
    return `<section class="company-hero"><div class="wrap"><div class="breadcrumb"><a href="#/">${uiCopy("s203c08e0d44ac3")}</a><span>${uiCopy("s8a5edab2826324")}</span><span>${uiCopy("s10aa79dff19334")}</span></div><div class="company-intro"><div><div class="eyebrow">${uiCopy("s3a50087bab4109")}</div><h1>${uiCopy("saaad66144eabf8")}<br><span>${uiCopy("se63f33519bab25")}</span></h1><div class="en">${uiCopy("sfab6c7585f173e")}</div></div><div class="company-copy"><p>${context.overseasAbout?.first || uiCopy("s89431b424c5891")}</p><p>${context.overseasAbout?.second || uiCopy("s81047ca696ac88")}</p><div class="company-links">${context.overseasAbout ? '' : link(uiCopy("sf9710b40e942a2"), uiCopy("s25ac81014f75c3"))}${link(uiCopy("sf189633c38bb0f"), uiCopy("sc044f887b35d4c"))}</div></div></div>${cncfProof(true)}</div></section>` + (context.overseasAbout ? '' : companyInterview() + section(`<div class="team-heading"><div><div class="eyebrow">${uiCopy("s0bb074adc1c166")}</div><h2>${uiCopy("sa8aa9ed7672f85")}</h2></div><p>${uiCopy("sba1673030de9cf")}<br>${uiCopy("scd3cb1b9c40866")}</p></div>${teamCards()}`, uiCopy("s6027d9a1a7de9b"), uiCopy("sca8b22d0db83a2")) + section(`<div class="history-layout"><div class="history-intro"><div class="eyebrow">${uiCopy("sbf1dec327c1359")}</div><h2>${uiCopy("s134919cf944d85")}</h2><p>${uiCopy("s97e0f0e3f3cc1c")}</p></div><ol class="timeline">${MILESTONES.map(([d, h, p]) => `<li class="milestone"><time>${d}</time><div class="milestone-body"><h3>${h}</h3><p>${p}</p></div></li>`).join('')}</ol></div>`, uiCopy("sfc7e9fd528a670"), uiCopy("sfc7e9fd528a670")) ) + section(companyContactCards(), '', uiCopy("sa0888630faed7b"));
  }
  let activeMember = 0;
  function showMember(index) {
    activeMember = (index + TEAM_MEMBERS.length) % TEAM_MEMBERS.length;
    const m = TEAM_MEMBERS[activeMember];
    const dlg = document.querySelector(uiCopy("sca2868d0ca39dd"));
    dlg.innerHTML = normalizeHTML(`<button class="team-dialog-close" aria-label="关闭团队成员介绍" data-close-member>${uiCopy("s8db71ed28b0f2f")}</button><div class="team-dialog-grid"><div class="team-dialog-photo"><img data-person="${m.id}" src="${m.image}" alt="${m.name}">${teamSocial(m)}</div><div class="team-dialog-info"><div class="eyebrow">${uiCopy("s63a0bb73931833")}</div><h2 id="member-dialog-title">${m.name}</h2><div class="team-dialog-role">${m.role}</div><div class="team-dialog-tag"><span class="tag">${m.tag}</span></div><p class="team-dialog-bio">${m.bio}</p><div class="team-dialog-details">${m.details.map(([h, p]) => `<h3>${h}</h3><p>${p}</p>`).join('')}</div><div class="team-dialog-nav"><span>${String(activeMember + 1).padStart(2, '0')}${uiCopy("s005e1574a2b5c8")}${String(TEAM_MEMBERS.length).padStart(2, '0')}</span><div><button data-member-step="-1" aria-label="上一位成员">${uiCopy("s774f1d6b2910de")}</button><button data-member-step="1" aria-label="下一位成员">${uiCopy("s161660030aa6c9")}</button></div></div></div></div>`);
    if (!dlg.open) dlg.showModal();else dlg.querySelector(uiCopy("s09780ad0f448f7")).focus();
    dlg.scrollTop = 0;
  }
  document.addEventListener(uiCopy("se5c7ffac26fed6"), e => {
    const member = e.target.closest(uiCopy("sa9f4ea82c4548d"));
    if (member) showMember(Number(member.dataset.member));
    const step = e.target.closest(uiCopy("s9a722e6719135e"));
    if (step) showMember(activeMember + Number(step.dataset.memberStep));
    if (e.target.closest(uiCopy("s09780ad0f448f7"))) document.querySelector(uiCopy("sca2868d0ca39dd")).close();
  });
  document.querySelector(uiCopy("sca2868d0ca39dd")).addEventListener(uiCopy("se5c7ffac26fed6"), e => {
    if (e.target === e.currentTarget) {
      const r = e.currentTarget.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.currentTarget.close();
    }
  });
  const CONTENT_DATA = data.CONTENT_DATA;
  const CONTENT_IMAGES = {
    "10": uiCopy("s1ea669684dfdfa"),
    "11": uiCopy("sa1c0b690400f34"),
    "16": uiCopy("s5a6f786eebd165"),
    "28": uiCopy("sdf03fb6fa9ec38"),
    "36": uiCopy("sb0af2e2975c4da"),
    "40": uiCopy("sf5b45ccc2f5b2d"),
    "55": uiCopy("s88b3fc46fe2b64"),
    "56": uiCopy("sc4690271153e01"),
    "23": uiCopy("s972053253863ba")
  };
  const BLOG_CATEGORIES = [uiCopy("s5c55a67935af8f"), uiCopy("sd4ee9ab2117271"), uiCopy("se2d4efa59baa78"), uiCopy("sf719a03fbcbead"), uiCopy("se69a00b11c6ab0"), uiCopy("sfc25d6381faa1c"), uiCopy("sdfa967ceabbc55")];
  let blogCategory = uiCopy("s5c55a67935af8f"),
    blogQuery = '',
    blogPageNumber = 1,
    eventStatus = uiCopy("s5ef5ef0364b693"),
    eventKind = uiCopy("s5ef5ef0364b693");
  const DYNAMIA_LOGO = uiCopy("s2966d89adc31f2");
  function eventEditorialCover(p) {
    const image = CONTENT_IMAGES[p.image],
      category = p.category || uiCopy("sdfa967ceabbc55");
    return `<div class="content-cover ${image ? uiCopy("s9df907e2477589") : ''}" data-category="${safe(category)}">${image ? `<img src="${image}" alt="${safe(p.coverTitle || p.title)}" loading="lazy"><span class="cover-category photo-category">${safe(category)}</span>` : `<div class="text-cover"><div class="cover-topline"><img class="cover-mark" src="${DYNAMIA_LOGO}" alt="密瓜智能"><span class="cover-category">${safe(category)}</span></div><strong>${safe(p.coverTitle || p.title)}</strong><small>${uiCopy("sec7580fa3d47ab")}</small></div>`}</div>`;
  }
  const COVER_SUBTITLES = {
    '实践案例': uiCopy("sd680d0a2c5890f"),
    '技术博客': uiCopy("s537a018b54b536"),
    '产品解读': uiCopy("sbb6437a474c3f3"),
    '公司新闻': uiCopy("sb0b5369ff3b866"),
    '版本发布': uiCopy("s6dd32017b3dbd6"),
    '社区与动态': uiCopy("s5540f925c7f2d2")
  };
  function editorialCover(p) {
    if (p.kind) return eventEditorialCover(p);
    const category = p.category || uiCopy("sdfa967ceabbc55");
    return `<div class="content-cover editorial-cover" data-category="${safe(category)}"><div class="text-cover"><div class="cover-topline"><img class="cover-mark" src="${DYNAMIA_LOGO}" alt="密瓜智能"><span class="cover-category">${safe(category)}</span></div><div class="cover-title-block"><strong>${safe(p.coverTitle || p.title)}</strong><span class="cover-subtitle">${COVER_SUBTITLES[category] || ''}</span></div><small>${uiCopy("sec7580fa3d47ab")}</small></div></div>`;
  }
  function blogPage() {
    return `<section class="editorial-hero"><div class="wrap"><div class="breadcrumb"><a href="#/">${uiCopy("s203c08e0d44ac3")}</a><span>${uiCopy("s8a5edab2826324")}</span><span>${uiCopy("s7855e5e9727ea5")}</span></div><div class="blog-head"><div><h1>${uiCopy("s7855e5e9727ea5")}</h1><p>${uiCopy("sffc363ffad1512")}</p></div></div></div></section><section class="blog-content"><div class="wrap blog-layout"><aside class="blog-sidebar"><div class="category-heading">${uiCopy("sa68dbd81c80f1f")}</div><div class="blog-filterbar" aria-label="文章分类">${BLOG_CATEGORIES.map(c => `<button data-blog-category="${c}" class="${c === blogCategory ? uiCopy("s96879611650f80") : ''}" aria-pressed="${c === blogCategory}">${c}</button>`).join('')}</div></aside><div class="blog-main"><form class="blog-search" role="search" id="blog-search-form"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/></svg><input type="search" id="blog-search-input" aria-label="搜索文章" placeholder="搜索文章、作者或关键词" value="${safe(blogQuery)}"><button type="submit">${uiCopy("s44ce7ae909bbb2")}</button></form><div class="result-line"><span id="blog-result-count" role="status" aria-live="polite"></span><span>${uiCopy("s79b4c5ed54e19c")}</span></div><div class="blog-grid" id="blog-results"></div><div class="pagination" id="blog-pagination" aria-label="文章分页"></div></div></div></section>`;
  }
  const BLOG_AUTHORS = {
    song_jingchao: {
      name: uiCopy("s61fca22430aa22"),
      englishName: uiCopy("se773bb071fa791"),
      title: uiCopy("se7dc0652383065"),
      communityRole: uiCopy("s5c56a40ebbf570"),
      teamId: uiCopy("s930a68a51a2db9")
    }
  };
  function blogAuthor(p) {
    return p.category === uiCopy("se2d4efa59baa78") ? BLOG_AUTHORS[p.authorId] : null;
  }
  function blogAuthorSearch(p) {
    const a = blogAuthor(p);
    return a ? [a.name, a.englishName, a.title, a.communityRole].join(' ') : '';
  }
  function blogAuthorByline(p) {
    const a = blogAuthor(p);
    if (!a) return '';
    const member = TEAM_MEMBERS.find(m => m.id === a.teamId);
    return `<div class="blog-card-author" aria-label="文章作者"><img class="blog-author-avatar" src="${member.image}" alt="${safe(a.name)}" loading="lazy"><div class="blog-author-info"><span class="blog-author-name">${safe(a.name)} <small>${safe(a.englishName)}</small></span><span class="blog-author-title">${safe(a.title)}</span><span class="blog-author-community">${safe(a.communityRole)}</span></div></div>`;
  }
  function renderBlogResults() {
    const q = blogQuery.toLocaleLowerCase().trim();
    const rows = CONTENT_DATA.posts.filter(p => (blogCategory === uiCopy("s5c55a67935af8f") || p.category === blogCategory) && (!q || ([p.title,p.desc,p.category].map(translateText).join(' ') + ' ' + blogAuthorSearch(p)).toLocaleLowerCase().includes(q)));
    const pages = Math.max(1, Math.ceil(rows.length / 6));
    blogPageNumber = Math.min(blogPageNumber, pages);
    document.querySelector(uiCopy("sc8829c80049e52")).textContent = (q ? '“' + blogQuery + '” · ' : '') + rows.length + translateText(uiCopy("sdb3e04f445bf9d"));
    document.querySelector(uiCopy("s36c1a67e154eed")).innerHTML = normalizeHTML(rows.length ? rows.slice((blogPageNumber - 1) * 6, blogPageNumber * 6).map(p => `<a class="blog-card" href="#/blog/${postSlug(p)}">${editorialCover(p)}<div class="blog-card-body"><div class="article-meta"><span>${p.category}</span><time datetime="${p.date}">${p.date.replaceAll('-', '.')}</time></div><h2>${safe(p.title)}</h2><p>${safe(p.desc)}</p>${blogAuthorByline(p)}<span class="read-more">${uiCopy("s380cbe6da507af")}<span>${uiCopy("sca29edb4680a64")}</span></span></div></a>`).join('') : `<div class="content-empty"><h3>${uiCopy("sfd1b83dcd1eeef")}</h3><p>${uiCopy("s58c494dc2abac7")}</p><button class="empty-reset" data-reset-blog>${uiCopy("s657d9cbf45ec9e")}</button></div>`);
    let nums = [...new Set([1, blogPageNumber - 1, blogPageNumber, blogPageNumber + 1, pages].filter(n => n >= 1 && n <= pages))].sort((a, b) => a - b);
    document.querySelector(uiCopy("sd9d543cbf0c8f3")).innerHTML = normalizeHTML(pages > 1 ? `<button data-blog-page="${blogPageNumber - 1}" ${blogPageNumber === 1 ? uiCopy("s17eb3c0168d0d7") : ''} aria-label="上一页">${uiCopy("s774f1d6b2910de")}</button>${nums.map((n, i) => (i && n - nums[i - 1] > 1 ? `<span>${uiCopy("sb4935894c8ce16")}</span>` : '') + `<button data-blog-page="${n}" class="${n === blogPageNumber ? uiCopy("s96879611650f80") : ''}" ${n === blogPageNumber ? uiCopy("s5850635e9816d0") : ''}>${n}</button>`).join('')}<button data-blog-page="${blogPageNumber + 1}" ${blogPageNumber === pages ? uiCopy("s17eb3c0168d0d7") : ''} aria-label="下一页">${uiCopy("s161660030aa6c9")}</button>` : '');
  }
  function eventsPage() {
    return `<section class="events-hero"><div class="wrap"><div class="eyebrow">${uiCopy("s514be9676683c9")}</div><h1>${uiCopy("sbf300ed922c2e9")}</h1><p>${uiCopy("s60fcfc49f5d3d2")}<br>${uiCopy("s828a45cbd8d4e2")}</p><div class="event-tabs" aria-label="活动时间筛选">${[[uiCopy("s5ef5ef0364b693"), uiCopy("sf811fe0948eb20")], [uiCopy("sf1398274418635"), uiCopy("s939561e608db1a")], [uiCopy("s84ccdf8a849ffb"), uiCopy("s1950ed9895959a")]].map(([id, t]) => `<button data-event-status="${id}" class="${eventStatus === id ? uiCopy("s96879611650f80") : ''}" aria-pressed="${eventStatus === id}">${t}</button>`).join('')}</div></div></section><section class="event-content"><div class="wrap"><div class="event-toolbar"><label>${uiCopy("sd225a9062672af")}<select id="event-kind" aria-label="活动形式">${[[uiCopy("s5ef5ef0364b693"), uiCopy("sd51419c7314c38")], [uiCopy("s92068ac94ed92e"), uiCopy("s92068ac94ed92e")], [uiCopy("s3afb401d879214"), uiCopy("s3afb401d879214")], [uiCopy("s152ab158b83196"), uiCopy("s152ab158b83196")], [uiCopy("sb09fdd95d4e982"), uiCopy("sb09fdd95d4e982")]].map(([v, t]) => `<option value="${v}" ${v === eventKind ? uiCopy("sd7cbbb688b2e50") : ''}>${t}</option>`).join('')}</select></label></div><div id="event-results"></div><p class="event-note">${uiCopy("s163e1a8bf21b2b")}</p></div></section>`;
  }
  function renderEvents() {
    const today = new Intl.DateTimeFormat(uiCopy("sd9c143e5b3a247"), {
      timeZone: uiCopy("s95033d34e64e9c"),
      year: uiCopy("s15f450a59134f3"),
      month: uiCopy("s9ac002d62ae135"),
      day: uiCopy("s9ac002d62ae135")
    }).format(new Date());
    const rows = CONTENT_DATA.events.filter(e => (eventKind === uiCopy("s5ef5ef0364b693") || e.kind === eventKind) && (eventStatus === uiCopy("s5ef5ef0364b693") || (eventStatus === uiCopy("sf1398274418635") ? e.date >= today : e.date < today)));
    document.querySelector(uiCopy("s51aa18e3b8825a")).innerHTML = normalizeHTML(rows.length ? rows.map(e => `<article class="event-row"><div><span class="event-kind">${e.kind}</span><h2><a href="${e.url}" target="_blank" rel="noopener">${e.title}</a></h2><div class="event-meta"><span>${e.dateLabel}</span><span>${uiCopy("s6e01f78b9eb414")}${e.location}</span></div></div><div class="event-description"><p>${e.desc}</p><a class="textlink" href="${e.url}" target="_blank" rel="noopener">${e.action} <span>${uiCopy("sca29edb4680a64")}</span></a></div><figure class="event-photo-figure"><a class="event-cover event-photo ${e.id === 28 ? uiCopy("sc6b6dcd63f9c0b") : ''}" href="${e.url}" target="_blank" rel="noopener" aria-label="${safe(e.title)}"><img src="${CONTENT_IMAGES[e.image]}" alt="${safe(e.photoAlt || e.title + uiCopy("sa80e4d2e81db83"))}" loading="lazy" style="--photo-position:${e.photoPosition || uiCopy("sf179a509d32bd9")}"></a>${e.photoCaption ? `<figcaption>${safe(e.photoCaption)}</figcaption>` : ''}</figure></article>`).join('') : `<div class="content-empty"><h3>${eventStatus === uiCopy("sf1398274418635") ? uiCopy("s98720ff7ce320e") : uiCopy("s5d91c79d224637")}</h3><p>${eventStatus === uiCopy("sf1398274418635") ? uiCopy("sca6d4dda91af12") : uiCopy("s71f24c7882cace")}</p><button class="empty-reset" data-reset-events>${uiCopy("s6bfdf32397c95e")}</button></div>`);
  }
  function careersPage() {
    const jobs=[
      {id:'channel',department:'sales',duties:4,requirements:4},
      {id:'sales',department:'sales',duties:4,requirements:5},
      {id:'director',department:'engineering',duties:7,requirements:5,bonus:5}
    ];
    const applyLink=role=>`mailto:${uiCopy('careers.apply.email')}?subject=${encodeURIComponent(uiCopy('careers.apply.mailSubject').replace('{role}',role))}&body=${encodeURIComponent(uiCopy('careers.apply.mailBody').replace('{role}',role))}`;
    const group=(job,type,count)=>`<section class="career-detail-group"><h3>${uiCopy('careers.'+type)}</h3><ul>${Array.from({length:count},(_,j)=>`<li>${uiCopy('careers.'+job.id+'.'+type+'.'+(j+1))}</li>`).join('')}</ul></section>`;
    return `<section class="career-intro"><div class="wrap"><div class="career-page-label">${uiCopy('careers.hero.label')}</div><h1>${uiCopy('careers.hero.title')}</h1><p>${uiCopy('careers.hero.description')}</p></div></section>
    <section class="career-openings"><div class="wrap"><div class="career-openings-heading"><h2>${uiCopy('careers.openings.title')}</h2><p>${uiCopy('careers.openings.description')}</p></div>
    <div class="career-filters" role="group" aria-label="${uiCopy('careers.filter.label')}">${['all','sales','engineering'].map((category,i)=>`<button type="button" data-career-filter="${category}" aria-pressed="${i===0}">${uiCopy(category==='all'?'careers.filter.all':'careers.department.'+category)}</button>`).join('')}</div>
    <div class="career-role-grid">${jobs.map(job=>`<article class="career-role-card" data-career-category="${job.department}"><div class="career-role-heading"><span>${uiCopy('careers.department.'+job.department)}</span><h3>${uiCopy('careers.'+job.id+'.title')}</h3><p>${uiCopy('careers.'+job.id+'.experience')}</p></div><p class="career-role-description">${uiCopy('careers.'+job.id+'.cardDescription')}</p><div class="career-card-actions"><a class="btn primary" href="${applyLink(uiCopy('careers.'+job.id+'.title'))}">${uiCopy('careers.apply.now')}</a><button type="button" class="career-details-link" data-career-details="${job.id}" aria-haspopup="dialog" aria-controls="career-dialog-${job.id}">${uiCopy('careers.details.short')}</button></div></article>`).join('')}</div>
    <aside class="career-contact"><div><h2>${uiCopy('careers.contact.title')}</h2><p>${uiCopy('careers.contact.description')}</p><a class="career-contact-email" href="mailto:${uiCopy('careers.apply.email')}">${uiCopy('careers.apply.email')}</a></div><a class="btn primary" href="mailto:${uiCopy('careers.apply.email')}?subject=${encodeURIComponent(uiCopy('careers.contact.subject'))}">${uiCopy('careers.contact.button')}</a></aside>
    </div></section>
    ${jobs.map(job=>`<dialog class="career-job-dialog" id="career-dialog-${job.id}" aria-labelledby="career-dialog-title-${job.id}"><div class="career-dialog-heading"><span>${uiCopy('careers.department.'+job.department)}</span><h2 id="career-dialog-title-${job.id}">${uiCopy('careers.'+job.id+'.title')}</h2><p>${uiCopy('careers.'+job.id+'.experience')}</p><button type="button" class="career-dialog-close" data-close-career aria-label="${uiCopy('careers.details.close')}" autofocus>×</button></div><div class="career-dialog-body">${group(job,'duties',job.duties)}${group(job,'requirements',job.requirements)}${job.bonus?group(job,'bonus',job.bonus):''}</div><div class="career-dialog-footer"><a href="mailto:${uiCopy('careers.apply.email')}">${uiCopy('careers.apply.email')}</a><a class="btn primary" href="${applyLink(uiCopy('careers.'+job.id+'.title'))}">${uiCopy('careers.apply.now')}</a></div></dialog>`).join('')}`;
  }
  document.addEventListener('click',event=>{
    const filter=event.target.closest('[data-career-filter]');
    if(filter){
      const category=filter.dataset.careerFilter;
      document.querySelectorAll('[data-career-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button===filter)));
      document.querySelectorAll('[data-career-category]').forEach(card=>card.hidden=category!=='all'&&card.dataset.careerCategory!==category);
    }
    const details=event.target.closest('[data-career-details]');
    if(details)document.getElementById('career-dialog-'+details.dataset.careerDetails)?.showModal();
    const close=event.target.closest('[data-close-career]');
    if(close)close.closest('dialog')?.close();
  });
  document.addEventListener(uiCopy("s75490bd7b93e6f"), e => {
    if (e.target.id === uiCopy("sa13e7b8ab3b93b")) {
      e.preventDefault();
      blogQuery = document.querySelector(uiCopy("s763ce05ececed5")).value;
      blogPageNumber = 1;
      renderBlogResults();
    }
  });
  document.addEventListener(uiCopy("sc96c6d5be8d08a"), e => {
    if (e.target.id === uiCopy("sa5dbf5e6b21942")) {
      blogQuery = e.target.value;
      blogPageNumber = 1;
      renderBlogResults();
    }
  });
  document.addEventListener(uiCopy("s12ea12eace7d65"), e => {
    if (e.target.id === uiCopy("sf91cde3a688872")) {
      eventKind = e.target.value;
      renderEvents();
    }
  });
  document.addEventListener(uiCopy("se5c7ffac26fed6"), e => {
    const b = e.target.closest(uiCopy("sc3e2d78f3ff335"));
    if (!b) return;
    if (b.dataset.blogCategory) {
      blogCategory = b.dataset.blogCategory;
      blogPageNumber = 1;
      document.querySelectorAll(uiCopy("s5c7214af387953")).forEach(x => {
        x.classList.toggle(uiCopy("s96879611650f80"), x === b);
        x.setAttribute(uiCopy("scaf57005bfdd09"), x === b);
      });
      renderBlogResults();
    }
    if (b.dataset.blogPage) {
      blogPageNumber = Number(b.dataset.blogPage);
      renderBlogResults();
      document.querySelector(uiCopy("sf5d923a76d40c6")).scrollIntoView({
        behavior: uiCopy("s618dc58379dda3"),
        block: uiCopy("scced28c6dc3f99")
      });
    }
    if (b.hasAttribute(uiCopy("sc546f2a38cd0fa"))) {
      blogCategory = uiCopy("s5c55a67935af8f");
      blogQuery = '';
      blogPageNumber = 1;
      app.innerHTML = normalizeHTML(blogPage());
      renderBlogResults();
    }
    if (b.dataset.eventStatus) {
      eventStatus = b.dataset.eventStatus;
      document.querySelectorAll(uiCopy("s75e0988af16255")).forEach(x => {
        x.classList.toggle(uiCopy("s96879611650f80"), x === b);
        x.setAttribute(uiCopy("scaf57005bfdd09"), x === b);
      });
      renderEvents();
    }
    if (b.hasAttribute(uiCopy("s74e7554ca9185a"))) {
      eventStatus = uiCopy("s84ccdf8a849ffb");
      eventKind = uiCopy("s5ef5ef0364b693");
      app.innerHTML = normalizeHTML(eventsPage());
      renderEvents();
    }
  });
  function pricingPage() {
    return `<section class="sales-page"><div class="wrap sales-layout"><div class="sales-copy"><div class="eyebrow">${uiCopy("s76ffb61d71f3fa")}</div><h1>${uiCopy("s40ea1e7d19586c")}<br>${uiCopy("sc2c39f2767bcba")}</h1><p>${uiCopy("s6995cc5ef05420")}</p><div class="sales-points">${[uiCopy("s19a1183bf25750"), uiCopy("sdf6ef7f7cc3760"), uiCopy("s5fd7605ac3bf4e"), uiCopy("sd5204864d45471")].map((text, i) => `<div class="sales-point">${icon([uiCopy("se3b816898ca5ba"), uiCopy("sd7cea7305a333d"), uiCopy("sca8b22d0db83a2"), uiCopy("s5694d08a2e53ff")][i])}<div><h3>${text}</h3></div></div>`).join('')}</div><a class="textlink" href="#/products?section=product-matrix">${uiCopy("s8f32336ffcf667")}</a></div><div class="sales-form"><h2>${uiCopy("secb8ce518c91fb")}</h2><p>${uiCopy("s89f8bbf0efa1c2")}</p><form id="pricing-form"><div class="form-grid">
 <label class="field full">${uiCopy("s776478abe08e20")}<select name="gpu" required><option value="">${uiCopy("sa705595e5f3eb2")}</option><option>${uiCopy("sc12d5e79624b9f")}</option><option>${uiCopy("s02d94e658ec5f9")}</option><option>${uiCopy("s12330e848b30f1")}</option><option>${uiCopy("s26f586b67b876c")}</option></select></label>
 <label class="field">${uiCopy("s259f1121cdc994")}<input name="name" required maxlength="80" autocomplete="name" placeholder="你的姓名"></label>
 <label class="field">${uiCopy("s1224477f2e112f")}<input name="company" required maxlength="120" autocomplete="organization" placeholder="公司或组织名称"></label>
 <label class="field">${uiCopy("s0f725efa311b91")}<input name="role" required maxlength="100" autocomplete="organization-title" placeholder="你的职责"></label>
 <label class="field">${uiCopy("sae03451f7571dd")}<input name="phone" required maxlength="80" placeholder="便于沟通的联系方式"></label>
 <label class="field full">${uiCopy("s73075237fd0f05")}<input type="email" name="email" maxlength="254" autocomplete="email" placeholder="you@company.com"></label>
 <label class="field full">${uiCopy("sc5dd0431240a7b")}<textarea name="notes" maxlength="2000" placeholder="集群环境、业务场景，以及你希望了解的产品或服务。"></textarea></label>
 </div><label class="pricing-consent" style="display:flex;align-items:flex-start;gap:9px;font-size:12px;margin-top:18px"><input type="checkbox" name="consent" required style="margin-top:5px;flex-shrink:0"><span>${uiCopy("s9b3a9a53cd77ce")}<a href="https://dynamia.ai/zh/privacy-policy" target="_blank" rel="noopener" style="text-decoration:underline">${uiCopy("se464b41fd5c45b")}</a>${uiCopy("sceafb89516cea2")}</span></label><p class="form-footnote">${uiCopy("sfdfbd7c347586d")}</p><button class="btn primary" type="submit">${uiCopy("sd989b3240c9c17")}</button></form><div class="sales-result" id="pricing-result" role="status" tabindex="-1" hidden><h3>${uiCopy("s73aa101e52beda")}</h3><p>${uiCopy("sd3ca5cddcbc2b2")}<a href="mailto:info@dynamia.ai">${uiCopy("s0b077b5fcc72eb")}</a>${uiCopy("s60ab743988bb19")}<a href="tel:4000267800">${uiCopy("s10c31475d2a38f")}</a>${uiCopy("seb0d5884569b39")}</p><button class="btn" type="button" data-pricing-reset>${uiCopy("s3160fc9159f076")}</button></div></div></div></section>` + section(intro(uiCopy("sb5c1ae6bcc4a9a"), uiCopy("sda7ee8c001d7bb"), uiCopy("s49ef75a3ec3698")) + `<a class="btn" href="#/products">${uiCopy("sfa9642bf00e96b")}</a>`);
  }
  document.addEventListener(uiCopy("sc96c6d5be8d08a"), event => {
    if (event.target.form?.id === uiCopy("s384da9f1cd54c2")) event.target.setCustomValidity('');
  });
  document.addEventListener(uiCopy("s75490bd7b93e6f"), event => {
    if (event.target.id !== uiCopy("s384da9f1cd54c2")) return;
    event.preventDefault();
    const form = event.target;
    for (const name of [uiCopy("s82a3537ff0dbce"), uiCopy("sf168ccdd91548c"), uiCopy("s4b168d88dc872a"), uiCopy("s45569da57f4b7b")]) form.elements[name].setCustomValidity(form.elements[name].value.trim() ? '' : uiCopy("s41a0564d3d5d8c"));
    if (!form.reportValidity()) return;
    form.hidden = true;
    const result = document.getElementById(uiCopy("sa8eb7a8c76ad44"));
    result.hidden = false;
    result.focus();
  });
  document.addEventListener(uiCopy("se5c7ffac26fed6"), event => {
    if (event.target.closest(uiCopy("s3a3613e4768f57"))) {
      document.getElementById(uiCopy("s384da9f1cd54c2")).hidden = false;
      document.getElementById(uiCopy("sa8eb7a8c76ad44")).hidden = true;
      document.querySelector(uiCopy("s52e61fb2555958")).focus();
    }
  });
  function notFound() {
    return pageHero(uiCopy("s297b54190830e0"), uiCopy("sa8901e01c00300"), uiCopy("s86b022de2927d7"), `<a class="btn primary" href="#/">${uiCopy("s1ebacc542cffe2")}</a>`);
  }
  const starProof = () => `<a class="star-proof" href="https://github.com/Project-HAMi/HAMi" target="_blank" rel="noopener" title="${uiCopy('githubStars.loading') || ''}"><span aria-hidden="true">${uiCopy("s26c57b0854989f")}</span><b data-github-stars>—</b><span>${uiCopy("sfe76c779b1e6fa")}</span><span aria-hidden="true">↗</span></a>`;
  const vendors = [[uiCopy("s8d4321d9363208"), uiCopy("s0890f456684a70")], [uiCopy("s240389f4b730ba"), uiCopy("s0fd3e4e71b62f7")], [uiCopy("s7d1507284a5757"), uiCopy("seb3e097112115e")], [uiCopy("s2ea802eeb4485c"), uiCopy("sa5cd45a90a3cf2")], [uiCopy("sf9f662d20e9496"), uiCopy("sad66ffce66863f")], [uiCopy("sda6ed1e6ee3b04"), uiCopy("s9949d200257727")], [uiCopy("s25cdd04cf7fba6"), uiCopy("sab9c4f6ccbcb5a")], [uiCopy("scde3ace970510d"), uiCopy("saa7245d840048e")], [uiCopy("s80348a765e5b29"), uiCopy("s412b57e7120390")], [uiCopy("sdc2f18e9197888"), uiCopy("s2d8fce311f337e")], [uiCopy("sf2cf4184889d43"), uiCopy("sd8be295043bdda")], [uiCopy("s4dc3795c9f3278"), uiCopy("s721eb3fd31f8e1")], [uiCopy("s1ef78c7481c285"), uiCopy("s7611ee46d68c35")], [uiCopy("s685caad9945f35"), uiCopy("s77ab43c8c26bd8")]];
  const schedulers = [[uiCopy("s94abcb2d2773df"), uiCopy("sa37d07fe30048d")], [uiCopy("s06612c2832341c"), uiCopy("se36bc30435af85")], [uiCopy("s5798625f00adc7"), uiCopy("s3c620e6d65ab09")], [uiCopy("sd6484cf87ca4bb"), uiCopy("scb21e0d822ca4a")], [uiCopy("sf844ad6231ada5"), uiCopy("s8f6cf6b98bf163")]];
  const ECOSYSTEM_LINKS = {
  "nvidia": "https://github.com/Project-HAMi/HAMi-core",
  "amd": "https://github.com/Project-HAMi/amd-device-plugin",
  "aws": "https://github.com/Project-HAMi/HAMi/tree/master/pkg/device/awsneuron",
  "ascend": "https://github.com/Project-HAMi/ascend-device-plugin",
  "hygon": "https://github.com/Project-HAMi/dcu-vgpu-device-plugin",
  "cambricon": "https://github.com/Project-HAMi/HAMi/tree/master/pkg/device/cambricon",
  "metax": "https://github.com/Project-HAMi/HAMi/tree/master/pkg/device/metax",
  "iluvatar": "https://github.com/Project-HAMi/HAMi/tree/master/pkg/device/iluvatar",
  "moore": "https://github.com/Project-HAMi/HAMi/tree/master/pkg/device/mthreads",
  "kunlunxin": "https://github.com/Project-HAMi/HAMi/tree/master/pkg/device/kunlun",
  "enflame": "https://github.com/Project-HAMi/HAMi/tree/master/pkg/device/enflame",
  "biren": "https://github.com/Project-HAMi/biren-device-plugin",
  "vastai": "https://github.com/Project-HAMi/HAMi/tree/master/pkg/device/vastai",
  "kubernetes": "https://github.com/Project-HAMi/HAMi#quick-start",
  "volcano": "https://github.com/volcano-sh/volcano/blob/master/docs/user-guide/how_to_use_volcano_vgpu.md",
  "kueue": "https://kueue.sigs.k8s.io/docs/tasks/run/using_hami/",
  "koordinator": "https://koordinator.sh/docs/user-manuals/device-scheduling-gpu-share-with-hami",
  "kai": "https://github.com/kai-scheduler/KAI-Scheduler/blob/main/docs/gpu-sharing/hami/README.md"
};
  function ecosystemTile(id, name) {
    const url = ECOSYSTEM_LINKS[id];
    const label = uiCopy("ecosystem.details") || "";
    const mark = brandTile(id, name);
    const linkedMark = mark.replace(/<\/div>$/, `<span class="ecosystem-link-caption">${label}<span aria-hidden="true"> ↗</span></span></div>`);
    return url ? `<a class="ecosystem-link" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${name} · ${label}">${linkedMark}</a>` : `<div class="ecosystem-unlinked">${mark}</div>`;
  }
  function logoRow(items, title, id) {
    const vendor = items !== schedulers;
    return `<div class="logo-group"><div class="logo-group-title"><h3>${title}</h3>${vendor ? `<a class="textlink" href="#/gpu-compatibility">${uiCopy("catalog.link")} <span aria-hidden="true">↗</span></a>` : ''}</div><div class="ecosystem-logo-grid ${vendor ? 'vendor-logo-grid' : 'scheduler-logo-grid'}" id="${id}" role="group" aria-label="${title}">${items.map(x => vendor ? `<div class="ecosystem-unlinked">${brandTile(...x)}</div>` : ecosystemTile(...x)).join('')}</div></div>`;
  }
  function homepageEcosystem() {
    return `<div class="logo-wall-heading"><div class="eyebrow">${uiCopy("s4f4c27743dbc8e")}</div><h2>${uiCopy("s176e844e58a099")}</h2><p>${uiCopy("see891fd9006bf8")}</p></div>${logoRow(vendors, uiCopy("sab69f42da29312"), uiCopy("sb5c78a8cb14d04"))}${logoRow(schedulers, uiCopy("sb19acdafb0cacb"), uiCopy("s7c1eecb0a50566"), true)}`;
  }
  const whyItems = [[uiCopy("sf0381de64c1595"), uiCopy("sd4a642c0d22b9e"), uiCopy("s97114b475bc017"), uiCopy("s7f26bd2b4d3410"), uiCopy("seb7e1d753aa71f")], [uiCopy("sb3a012c9298aed"), uiCopy("s6bb477b42f66fa"), uiCopy("s7298eb1768dbe9"), uiCopy("s57341a582b8c85"), uiCopy("sc3bc45ac352fe4")], [uiCopy("saf02dfe964d3ae"), uiCopy("s70ff2ae41dfe7c"), uiCopy("s325748bbd3ae9b"), uiCopy("s7a17af77400827"), uiCopy("sc064fbca9d9de8")], [uiCopy("s80f08b7a536136"), uiCopy("s1d4315708f893b"), uiCopy("s71eddab21d3138"), uiCopy("saaddee40bea75b"), uiCopy("s986051385feae5")], [uiCopy("sf7ebd147a169cb"), uiCopy("s5c7af4a1e10e4b"), uiCopy("s8c6823a227dfb2"), uiCopy("s88550bf6747b7e"), uiCopy("s74e892c91130da")], [uiCopy("s758b7997f48f1d"), uiCopy("s3c1d530019753b"), uiCopy("s1531f76b6da608"), uiCopy("s9d3265aec3d5b8"), uiCopy("s5f72005e81c4ec")]];
  function whyChoose() {
    return intro(uiCopy("s0f7ea3ee3330db"), uiCopy("se03bb4f1cdf92c"), uiCopy("sb0259be593c2c7")) + `<div class="why-tabs" role="tablist" aria-label="为什么选择我们">${whyItems.map((x, i) => `<button role="tab" id="why-tab-${i}" aria-controls="why-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-why="${i}">${x[0]}</button>`).join('')}</div><div id="why-panel" role="tabpanel" tabindex="0" aria-labelledby="why-tab-0"></div>`;
  }
  function whyGraphic(key) {
    if (key === uiCopy("sc3bc45ac352fe4")) return `<div class="pool-top"><span class="label">${uiCopy("s0d653252147a31")}</span><div class="switch"><button data-pool="exclusive" aria-pressed="true">${uiCopy("s444663c431be9f")}</button><button data-pool="shared" aria-pressed="false">${uiCopy("sfc2d7d0b2fcd75")}</button></div></div><div id="pool-visual"></div>`;
    const data = {
      clusters: [[uiCopy("scfb2b6aab5aed1"), uiCopy("sea49523d744c40"), uiCopy("s43f1d765f8cc3b")], [uiCopy("s0aecdaa93a2cfc"), uiCopy("s6720ea68b33ac8"), uiCopy("sb28b78ea2c279c")], [uiCopy("s21c8215eb4d93e"), uiCopy("se7e4363713d781"), uiCopy("sfdd655cf571d9d")]],
      memory: [[uiCopy("s11af557d5507e7"), uiCopy("s338fea2c0d75b9"), uiCopy("s05fba9a770e23f")], [uiCopy("s11072a56b4b63e"), '↔', uiCopy("s5a59afeb7f6b0f")], [uiCopy("s4e44776b49e5c6"), uiCopy("sc7046fc3ff993f"), uiCopy("s43f743a671c70b")]],
      elastic: [[uiCopy("s5adc8642d693de"), uiCopy("s6e5c397c962581"), uiCopy("s082315a546c28e")], [uiCopy("s51e42cd174c869"), '→', uiCopy("s292587e042abfc")], [uiCopy("sb34bdfc386c031"), uiCopy("s32d471f4438a63"), uiCopy("s26db7646363374")]],
      observe: [[uiCopy("s88b14592f5a91d"), uiCopy("sc7d6c36fa0e670"), uiCopy("sa4089dcac9b050")], [uiCopy("s63c2b006b0bc9c"), uiCopy("se46b0272bd6410"), uiCopy("s69d253b3f05beb")], [uiCopy("s1bb33a9e63137b"), uiCopy("s3b7dee49b9e0c2"), uiCopy("s268cff2b97cdfc")]],
      schedule: [[uiCopy("sffe71c55d05a5d"), uiCopy("sa24f502c764c34"), uiCopy("sa18a3d39f5d352")], [uiCopy("sb11fb1f593a8c9"), uiCopy("se5c5028bcb3ff6"), uiCopy("sedf50e3b7859b0")], [uiCopy("s46a75281aa2d8d"), uiCopy("s128befdd46932c"), uiCopy("s1dce0ff1eb845d")]]
    };
    return `<div class="flow-cards">${data[key].map(x => `<div>${x[0]}<b>${x[1]}</b><small>${x[2]}</small></div>`).join('')}</div>`;
  }
  function whyMotionGraphic(key) {
    const label = id => uiCopy('motion.' + id) || '';
    const glyph = (name, extra = '') => `<span class="wm-glyph ${extra}">${icon(name)}</span>`;
    const logo = (name, alt) => `<span class="wm-logo"><img src="${name === 'hami' ? HAMI : ECO_ASSETS[name]}" alt="${alt}"></span>`;
    const flow = (count = 3) => `<div class="wm-flow" aria-hidden="true">${Array.from({length:count},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div>`;
    const core = text => `<div class="wm-core">${logo('hami','HAMi')}<span>${text}</span><i class="wm-live" aria-hidden="true"></i></div>`;
    const badge = (ico,text) => `<span class="wm-badge">${glyph(ico)}${text}</span>`;
    const task = (ico,text,i) => `<div class="wm-task" style="--i:${i}">${glyph(ico)}<span>${text}</span></div>`;
    let content = '';
    if (key === 'clusters') {
      content = `<div class="wm-topline"><span>${label('clusters')}</span>${badge('shield',label('quota'))}</div><div class="wm-cluster-list">${[['network','cloud'],['shield','private'],['layers','local']].map(([ico,txt],i)=>`<div class="wm-cluster" style="--i:${i}">${glyph(ico)}<strong>${label(txt)}</strong>${logo('kubernetes','Kubernetes')}<span class="wm-node-dots" aria-hidden="true"><i></i><i></i><i></i></span></div>`).join('')}</div>${flow()}${core(label('onePool'))}${flow()}<div class="wm-vendors">${logo('nvidia','NVIDIA')}${logo('amd','AMD')}${logo('ascend','Ascend')}</div><div class="wm-bottom">${badge('team',label('teams'))}<span>${label('unified')}</span></div>`;
    } else if (key === 'share') {
      content = `<div class="wm-topline"><span>${label('oneGpu')}</span><div class="wm-switch" role="group" aria-label="${label('allocation')}"><button data-wm-mode="exclusive" aria-pressed="false">${label('exclusive')}</button><button data-wm-mode="shared" aria-pressed="true">${label('shared')}</button></div></div><div class="wm-tasks">${task('code',label('inference'),0)}${task('chart',label('training'),1)}${task('book',label('notebook'),2)}</div>${flow()}${core(label('isolation'))}${flow()}<div class="wm-gpu"><div class="wm-device-heading">${glyph('chip')}<strong>GPU</strong>${logo('nvidia','NVIDIA')}</div><div class="wm-partitions"><div><span>${label('taskA')}</span></div><div><span>${label('taskB')}</span></div><div><span>${label('taskC')}</span></div></div></div><div class="wm-bottom">${badge('shield',label('separate'))}<span class="wm-share-caption">${label('shareResult')}</span><span class="wm-exclusive-caption">${label('exclusiveResult')}</span></div>`;
    } else if (key === 'memory') {
      content = `<div class="wm-topline"><span>${label('memory')}</span>${logo('nvidia','NVIDIA')}</div><div class="wm-memory-pair"><div class="wm-memory-card">${glyph('chip')}<strong>${label('deviceMemory')}</strong><small>${label('hot')}</small><div class="wm-memory-cells">${Array.from({length:8},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div></div><div class="wm-swap" aria-hidden="true"><span>→</span><i></i><span>←</span></div><div class="wm-memory-card wm-host">${glyph('layers')}<strong>Host RAM</strong><small>${label('host')}</small><div class="wm-memory-cells">${Array.from({length:12},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div></div></div>${flow(1)}${core(label('memoryManage'))}<div class="wm-bottom">${badge('layers',label('onDemand'))}<span>${label('memoryNote')}</span></div>`;
    } else if (key === 'elastic') {
      content = `<div class="wm-topline"><span>${label('elastic')}</span>${logo('nvidia','NVIDIA')}</div><div class="wm-demand"><span>${label('demand')}</span><svg viewBox="0 0 400 68" role="img" aria-label="${label('demand')}"><path class="wm-chart-grid" d="M0 15H400M0 40H400M0 65H400"/><path class="wm-demand-line" d="M0 54 45 50 80 45 120 49 165 32 200 28 245 12 280 20 320 35 360 42 400 38"/></svg></div><div class="wm-elastic-card"><div class="wm-device-heading">${glyph('chip')}<strong>${label('quotaMemory')}</strong><span class="wm-quota-values"><b>4 GiB</b><b>8 GiB</b></span></div><div class="wm-quota-track"><div><i></i><i></i><i></i><i></i></div></div><div class="wm-quota-labels"><span>${label('apply')}</span><span>${label('expand')}</span><span>${label('release')}</span></div></div>${flow(1)}<div class="wm-running">${glyph('layers')}<span>${label('container')}</span><i class="wm-live"></i><strong>${label('running')}</strong></div><div class="wm-bottom">${badge('check',label('noRecreate'))}<span>${label('quotaNote')}</span></div>`;
    } else if (key === 'observe') {
      content = `<div class="wm-topline"><span>${label('observe')}</span>${badge('chart',label('metrics'))}</div><div class="wm-sources">${logo('kubernetes','Kubernetes')}${logo('nvidia','NVIDIA')}${badge('layers',label('workload'))}</div>${flow()}<div class="wm-monitor"><div class="wm-monitor-head">${logo('prometheus','Prometheus')}<span>${label('deviceToTask')}</span><i class="wm-live"></i></div><div class="wm-monitor-body"><div class="wm-spark"><svg viewBox="0 0 400 90" aria-hidden="true"><path class="wm-chart-grid" d="M0 20H400M0 50H400M0 80H400"/><path class="wm-chart-line" d="M0 70 25 61 50 65 75 45 100 48 125 30 150 45 175 24 200 31 225 18 250 27 275 14 300 26 325 21 350 35 375 28 400 19"/><path class="wm-chart-line wm-chart-blue" d="M0 80 25 72 50 70 75 76 100 65 125 70 150 54 175 62 200 54 225 60 250 43 275 52 300 46 325 50 350 42 375 47 400 35"/></svg><div class="wm-scan"></div></div><div class="wm-chart-legend"><span>${label('compute')}</span><span>${label('deviceMemory')}</span></div><div class="wm-meter-row">${['cluster','device','task'].map((x,i)=>`<div><span>${label(x)}</span><i style="--i:${i}"><b></b></i></div>`).join('')}</div></div></div><div class="wm-bottom">${badge('chart',label('history'))}<span>${label('diagnose')}</span></div>`;
    } else {
      content = `<div class="wm-topline"><span>${label('schedule')}</span><div class="wm-switch" role="group" aria-label="${label('policy')}"><button data-wm-mode="binpack" aria-pressed="true">Binpack</button><button data-wm-mode="spread" aria-pressed="false">Spread</button></div></div><div class="wm-job-queue">${glyph('code')}<span>${label('queue')}</span>${Array.from({length:4},(_,i)=>`<i style="--i:${i}" aria-hidden="true"></i>`).join('')}</div>${flow(1)}${core(label('policyMatch'))}${flow()}<div class="wm-node-grid">${[0,1,2].map(n=>`<div class="wm-schedule-node"><div>${glyph('chip')}<strong>${label('node')} ${String.fromCharCode(65+n)}</strong></div><div class="wm-node-slots">${[0,1,2,3].map(j=>`<i class="${n===0?'wm-pack ':''}${(n===0&&j<2)||(n>0&&j===0)?'wm-spread ':''}" style="--i:${n+j}"></i>`).join('')}</div></div>`).join('')}</div><div class="wm-bottom">${badge('network',label('topology'))}<span class="wm-pack-caption">${label('pack')}</span><span class="wm-spread-caption">${label('spread')}</span></div>`;
    }
    return `<div class="why-motion wm-${key}" data-mode="${key === 'share' ? 'shared' : 'binpack'}">${content}</div>`;
  }
  document.addEventListener('click', event => {
    const button=event.target.closest('[data-wm-mode]');
    if(!button)return;
    const figure=button.closest('.why-motion');
    figure.dataset.mode=button.dataset.wmMode;
    figure.querySelectorAll('[data-wm-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  });

  function renderWhy(i = 0) {
    const x = whyItems[i],
      panel = document.querySelector(uiCopy("s4cc42838ca2101"));
    if (!panel) return;
    panel.setAttribute(uiCopy("sedde6c5d24e5a6"), uiCopy("s7b999f1e462b49") + i);
    panel.innerHTML = normalizeHTML(`<div class="why-panel"><div><span class="tag">${uiCopy("s5feceb66ffc86f")}${i + 1}${uiCopy("s005e1574a2b5c8")}${x[0]}</span><h3>${x[1]}</h3><p>${x[2]}</p><p class="why-scope">${x[3]}</p></div><div class="why-visual why-visual-motion">${whyMotionGraphic(x[4])}<p class="tiny" style="text-align:center;margin-top:12px">${uiCopy("s7493cf792c4b41")}</p></div></div>`);
    document.querySelectorAll(uiCopy("sb7b337edaa1d04")).forEach(b => {
      const active = Number(b.dataset.why) === i;
      b.setAttribute(uiCopy("s7a36887bd59142"), active);
      b.tabIndex = active ? 0 : -1;
    });

  }
  function salesBanner(type = '') {
    return `<div class="sales-closing"><div class="eyebrow">${uiCopy("se14552cf44e319")}</div><h2>${uiCopy("s714e4a928dde97")}</h2><p>${uiCopy("sfcf08d4dfcda95")}</p><div class="actions"><a class="btn primary" href="#/contact-sales${type ? uiCopy("s111c3e6356b3af") + type : ''}">${uiCopy("s2f832bbcf37573")}<span class="arrow">${uiCopy("s161660030aa6c9")}</span></a>${type ? `<a class="btn" href="#/products">${uiCopy("s3e7357d7508d68")}</a>` : ''}</div></div>`;
  }
  function productVisual(platform) {
    return `<div class="product-banner"><div class="product-banner-head"><b>${platform ? uiCopy("s916b11790c714e") : uiCopy("s1e82057d72d1c8")}</b><span>${uiCopy("s9796f6e9588fac")}</span></div><div class="product-layers">${platform ? `<div class="product-layer green"><strong>${uiCopy("s7951337b45fe03")}</strong><span>${uiCopy("sb0dd5dd2c9e218")}</span></div><div class="product-layer"><strong>${uiCopy("s604034d9537797")}</strong><span>${uiCopy("sa7133eecad4d0a")}</span></div>` : `<div class="product-layer"><strong>${uiCopy("s52014f8e467a43")}</strong><span>${uiCopy("sb602a653071b2b")}</span></div>`}<div class="product-layer core"><strong>${uiCopy("s32de1734115f47")}${platform ? uiCopy("s93db12206ee11a") : ''}</strong><span>${uiCopy("s7b9da6d0cc3512")}</span></div><div class="product-layer"><strong>${uiCopy("s404adc97babfa1")}</strong><span>${uiCopy("s6101806a0d191f")}</span></div></div></div>`;
  }
  function productPage(type) {
    const p = type === uiCopy("sd294fcce0cc885"),
      title = p ? uiCopy("s896fd762cb0eeb") : uiCopy("sd6aff76589ed73");
    const features = p ? [[uiCopy("s0f2a693e93e2ed"), uiCopy("s31504f96cc98d4"), uiCopy("sed4ec9172994ba"), uiCopy("sdacf946743edd0")], [uiCopy("sca8b22d0db83a2"), uiCopy("s145a89f497acba"), uiCopy("s97d55ba3a91f24"), uiCopy("sdf120946f9441c")], [uiCopy("se3b816898ca5ba"), uiCopy("s5613c7a0f98047"), uiCopy("s16a2263405b141"), uiCopy("s63c2b006b0bc9c")], [uiCopy("scc57fc1903e444"), uiCopy("s4c196a508df2e2"), uiCopy("sd8a808ff77d647"), uiCopy("sba1902c7c90460")], [uiCopy("s92719fe0cf8cd5"), uiCopy("s3b67ceb256bdb9"), uiCopy("sa194eb5c4470b1"), uiCopy("sa469b4bf356366")], [uiCopy("s5694d08a2e53ff"), uiCopy("s10e49656b6aef9"), uiCopy("sc8edb3b0175d28"), uiCopy("s2bc6f890600cd0")]] : [[uiCopy("sd7cea7305a333d"), uiCopy("s8b7921768cd501"), uiCopy("s960710f393fe36"), uiCopy("sbb00fe99a8db57")], [uiCopy("s3009be769fb8f9"), uiCopy("s63be290faa76c4"), uiCopy("s612382e84a84b4"), uiCopy("sdd6b84d1bfc943")], [uiCopy("se3b816898ca5ba"), uiCopy("s7b69d6cf6212c6"), uiCopy("sc3c081540bf641"), uiCopy("s5e0c41c0e70e5c")], [uiCopy("scc57fc1903e444"), uiCopy("s5be9a9744568bb"), uiCopy("s320e265bd282e5"), uiCopy("s5e0c41c0e70e5c")], [uiCopy("s072a626ed2d6cc"), uiCopy("sb7dbfee171cb9d"), uiCopy("s2d1621471ffcbb"), uiCopy("sa13dbd0144e379")], [uiCopy("sca8b22d0db83a2"), uiCopy("s419c1f75e8698b"), uiCopy("s379f4e7500f790"), uiCopy("s6dd68f893a11b4")]];
    return `<div class="product-switch"><div class="wrap"><a href="#/products">${uiCopy("s474fdad251a8e8")}</a><a href="#/enterprise" class="${p ? '' : uiCopy("s96879611650f80")}">${uiCopy("sd6aff76589ed73")}</a><a href="#/platform" class="${p ? uiCopy("s96879611650f80") : ''}">${uiCopy("s896fd762cb0eeb")}</a><a href="#/contact-sales">${uiCopy("s30bb3dacb4b3ba")}</a></div></div><section class="product-hero"><div class="wrap"><div class="eyebrow">${title}</div><h1>${p ? `${uiCopy("s320d6db683e319")}<br>${uiCopy("sd30db67b781df0")}` : `${uiCopy("s349e4ddf3bb4f9")}<br>${uiCopy("s66497d15fef99d")}`}</h1><p class="lead">${p ? uiCopy("s949909c9d87ec0") : uiCopy("s8678020efc627d")}</p><div class="actions"><a class="btn primary" href="#/contact-sales?product=${type}">${uiCopy("s2f832bbcf37573")}<span class="arrow">${uiCopy("s161660030aa6c9")}</span></a><a class="btn" href="https://docs.dynamia.ai" target="_blank" rel="noopener noreferrer">${uiCopy("docs.link")} ↗</a></div>${productVisual(p)}</div></section><div class="product-integrations"><span>${uiCopy("s943767b0b3f7d3")}</span>${[uiCopy("s94abcb2d2773df"), uiCopy("s1809f7cd0c75ac")].map(id => `<img src="${ECO_ASSETS[id]}" alt="${id}">`).join('')}<span>${uiCopy("s5341c78b85beec")}</span></div><div class="subnav"><div class="wrap"><a href="#/${type}?section=product-value">${uiCopy("sa53516700fef23")}</a><a href="#/${type}?section=product-workflow">${uiCopy("s3e5c3ba2c6a7c4")}</a><a href="#/${type}?section=delivery">${uiCopy("s8c8ec19d3ccd01")}</a><a href="#/${type}?section=product-faq">${uiCopy("s45a6d115fdfb29")}</a></div></div>` + section(intro(uiCopy("s5d99f4fd1933fd"), p ? uiCopy("sf5b4711f25a4d9") : uiCopy("scfb6b6b54d1768"), p ? uiCopy("sc0a9fcbeb49e1c") : uiCopy("se2351c6b126640")) + `<div class="product-benefits">${features.map(([i, h, d, tag]) => `<article class="product-feature">${icon(i)}<h3>${h}</h3><p>${d}</p><span class="tag">${tag}</span><div class="product-feature-action"><a class="btn" href="#/videos" aria-label="查看完整功能：${h}（视频）">${uiCopy("s2cd32b05265d6c")}<span aria-hidden="true">${uiCopy("sca29edb4680a64")}</span></a></div></article>`).join('')}</div>`, '', uiCopy("s004ffd7c7948b6")) + section(`<div class="product-story"><div><div class="eyebrow">${p ? uiCopy("s12edbf179d591b") : uiCopy("s44822e1b366ca5")}</div><h2>${p ? `${uiCopy("s2c88e61e6d6740")}<br>${uiCopy("s3cf3c3efbffb80")}<br>${uiCopy("sfa588ae998f1f7")}` : `${uiCopy("s7aafa688a87667")}<br>${uiCopy("s44f17674cfe4bf")}<br>${uiCopy("s71437f710bd970")}`}</h2><p>${p ? uiCopy("sf9b463ca5551d1") : uiCopy("sf3e1630e69a313")}</p><ul>${(p ? [uiCopy("s6167ee71f61622"), uiCopy("s4b779d4049f555"), uiCopy("s4daa53aef118eb")] : [uiCopy("s8a653f6570674e"), uiCopy("s143679fbe2b874"), uiCopy("s079c300ab2e7fd")]).map(x => `<li>${x}</li>`).join('')}</ul></div><div class="why-visual">${whyGraphic(p ? uiCopy("seb7e1d753aa71f") : uiCopy("s5f72005e81c4ec"))}<p class="tiny center">${uiCopy("se5e8e7460ebff3")}</p></div></div>`, uiCopy("s76ea797fbf44a4"), uiCopy("sa3d33ecff7ac90")) + section(intro(uiCopy("s4b114d60f3ec0e"), uiCopy("s5c57f17f5e9dff"), uiCopy("se0829078e6bac0")) + `<div class="process-steps">${[['01', uiCopy("sfacf570d1de013"), uiCopy("s1854e5d0ed80d3")], ['02', uiCopy("s18632ddc9089a1"), uiCopy("s314bc3af10d495")], ['03', uiCopy("s250428762fce1b"), uiCopy("sbf14d89ba39e26")]].map(x => `<div class="process-step"><b>${x[0]}</b><h3>${x[1]}</h3><p>${x[2]}</p></div>`).join('')}</div><div class="actions">${link(uiCopy("s6f96b2eeac5543"), uiCopy("s423d0740ee5c46"))}${link(uiCopy("sb1cc02be2b578d"), uiCopy("s9a6de67f4d1d13"))}</div>`, '', uiCopy("sb4af39d5b65a14")) + section(intro(uiCopy("s0e7f56b89a7f0c"), uiCopy("s45a6d115fdfb29")) + `<div class="faq">${(p ? [[uiCopy("sf8b310cff176a1"), uiCopy("s9d0e3b46987772")], [uiCopy("s85b3765c059ad0"), uiCopy("s001cb3a251b652")]] : [[uiCopy("se46be85b1dfcc2"), uiCopy("s4687fbcfd3122f")], [uiCopy("s91a0b0378048a2"), uiCopy("s07165e328f1e90")]]).map(x => `<details><summary>${x[0]}</summary><p>${x[1]}</p></details>`).join('')}</div>`, uiCopy("s76ea797fbf44a4"), uiCopy("s41887a6905b902")) + section(salesBanner(type));
  }
  const toolsList = [[uiCopy("scc57fc1903e444"), uiCopy("sa529addbba3a66"), uiCopy("se91ea3be21d337"), uiCopy("s9bde2817f5985b")], [uiCopy("sd7cea7305a333d"), uiCopy("s2364cdfd70fef5"), uiCopy("sa1c52bb7c14b74"), uiCopy("s9c37662ee9861f")]];
  function toolCards() {
    return `<div class="grid2 tool-cards">${toolsList.map(([i, h, d, u]) => `<a class="feature-card" href="${u}" target="_blank" rel="noopener">${icon(i)}<h3>${h}</h3><p>${d}</p><span class="textlink">${uiCopy("s680611e2125f3d")}</span></a>`).join('')}</div>`;
  }
  function toolsPage() {
    return pageHero(uiCopy("s5ca6730d441522"), `${uiCopy("sd384dbbd009d97")}<br>${uiCopy("sfe4ea6fdf0320d")}`, uiCopy("s571a94b2e28692")) + section(toolCards() + `<p class="case-disclaimer">${uiCopy("s85ac87d630dbc1")}</p>`);
  }
  function openSourcePage() {
    return communityPage();
  }
  function contactSalesPage() {
    const type = new URLSearchParams(location.hash.split('?')[1] || '').get(uiCopy("sa8792157cb4f27"));
    return `<section class="sales-page"><div class="wrap sales-layout"><div class="sales-copy"><div class="eyebrow">${uiCopy("s96504341230d3d")}</div><h1>${uiCopy("sbb5af3391248e9")}<br>${uiCopy("s4d01c77be06962")}</h1><p>${uiCopy("sfb5ace88a84b54")}</p><div class="sales-points">${[[uiCopy("s0f2a693e93e2ed"), uiCopy("s4a819857d98f9b"), uiCopy("s7e279445de24db")], [uiCopy("s3009be769fb8f9"), uiCopy("se6eacb8cd3cb10"), uiCopy("s99c6487e100d05")], [uiCopy("sca8b22d0db83a2"), uiCopy("s3c4c5c9b5797a4"), uiCopy("s565024883a46f9")]].map(([i, h, p]) => `<div class="sales-point">${icon(i)}<div><h3>${h}</h3><p>${p}</p></div></div>`).join('')}</div><p style="font-size:14px">${uiCopy("s6ffc9d145b2bf4")}<br><a class="textlink" href="mailto:info@dynamia.ai">${uiCopy("sb7384473608823")}</a><br><a href="tel:4000267800">${uiCopy("s10c31475d2a38f")}</a></p></div><div class="sales-form"><h2>${uiCopy("s6d6d92a2815bfd")}</h2><p>${uiCopy("s89f8bbf0efa1c2")}</p><form id="sales-form"><div class="form-grid"><label class="field">${uiCopy("s259f1121cdc994")}<input name="name" required maxlength="80" autocomplete="name" placeholder="你的姓名"></label><label class="field">${uiCopy("s53bc39739ae700")}<input name="company" required maxlength="120" autocomplete="organization" placeholder="公司或组织名称"></label><label class="field full">${uiCopy("s9b2f790207e15e")}<input type="email" name="email" required autocomplete="email" placeholder="you@company.com"></label><label class="field">${uiCopy("sbc3c0420e12ec7")}<input name="role" autocomplete="organization-title" placeholder="你的职责"></label><label class="field">${uiCopy("s40eb6057d6c413")}<input name="phone" placeholder="便于沟通的联系方式"></label><label class="field full">${uiCopy("s587e3ba37b2084")}<select name="product" required><option value="">${uiCopy("sda590a8fe3ce4d")}</option><option ${type === uiCopy("s9b97ac5e767e53") ? uiCopy("sd7cbbb688b2e50") : ''}>${uiCopy("sd6aff76589ed73")}</option><option ${type === uiCopy("sd294fcce0cc885") ? uiCopy("sd7cbbb688b2e50") : ''}>${uiCopy("s896fd762cb0eeb")}</option><option>${uiCopy("sf1f08eed2ea587")}</option></select></label><label class="field full">${uiCopy("s7feb2979fb5406")}<textarea name="notes" required minlength="5" maxlength="2000" placeholder="例如：现有设备型号、GPU 数量、集群环境，以及想解决的问题。"></textarea></label></div><p class="form-footnote">${uiCopy("s34d2b64e21f943")}</p><button type="submit" class="btn primary">${uiCopy("s24a1e12616640e")}</button></form><div id="sales-result" class="sales-result" role="status" tabindex="-1" hidden></div></div></div></section>`;
  }
  document.addEventListener(uiCopy("se5c7ffac26fed6"), e => {
    const b = e.target.closest(uiCopy("sc3e2d78f3ff335"));
    if (!b) return;
    if (b.hasAttribute(uiCopy("s4e6409dc660302"))) renderWhy(Number(b.dataset.why));
    if (b.hasAttribute(uiCopy("sb3fdc4db9e86e2")) || b.hasAttribute(uiCopy("sda7812548aab27"))) {
      const r = document.getElementById(b.dataset.row),
        t = document.querySelector(`${uiCopy("s7cb998edf52896")}${b.dataset.row}${uiCopy("s9980a615c2c256")}`);
      if (b.hasAttribute(uiCopy("sb3fdc4db9e86e2"))) r._paused = !r._paused;else {
        r._paused = true;
        const w = r.querySelector(uiCopy("sb1ac5a90c7b6fd")).getBoundingClientRect().width;
        let next = r.scrollLeft + Number(b.dataset.logoMove) * 221;
        if (next < 0) next += w;
        if (next >= 2 * w) next -= w;
        r.scrollLeft = next;
        r._x = next;
      }
      t.textContent = r._paused ? uiCopy("sc3396195e91ccd") : uiCopy("s8d12fc0d4eb260");
      t.setAttribute(uiCopy("scaf57005bfdd09"), r._paused);
    }
  });
  document.addEventListener(uiCopy("s03242d1760cedc"), e => {
    if (!e.target.matches(uiCopy("sb7b337edaa1d04"))) return;
    const keys = [uiCopy("s48e61e2dd0a223"), uiCopy("s8e2f7ffbbdb947"), uiCopy("s3a78695388b38b"), uiCopy("sf4db1e48476f60")];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    let i = Number(e.target.dataset.why);
    i = e.key === uiCopy("s3a78695388b38b") ? 0 : e.key === uiCopy("sf4db1e48476f60") ? 5 : (i + (e.key === uiCopy("s8e2f7ffbbdb947") ? 1 : 5)) % 6;
    renderWhy(i);
    document.querySelector(`${uiCopy("s382c4005d10ca7")}${i}${uiCopy("s9980a615c2c256")}`).focus();
  });
  document.addEventListener(uiCopy("s75490bd7b93e6f"), e => {
    if (e.target.id !== uiCopy("s222c5303b9d3ac")) return;
    e.preventDefault();
    const f = new FormData(e.target),
      r = document.querySelector(uiCopy("s0f6713d852071f"));
    r.hidden = false;
    r.innerHTML = normalizeHTML(`<h3>${uiCopy("s2a36e73f4fa734")}</h3><p>${safe(f.get(uiCopy("s82a3537ff0dbce")))}${uiCopy("s588da410532073")}${safe(f.get(uiCopy("sf168ccdd91548c")))}<br>${safe(f.get(uiCopy("sa8792157cb4f27")))}</p><p style="margin-top:15px">${uiCopy("s6e5218b6dc4016")}</p>`);
    r.focus();
  });
  function productsOverview() {
    return fullProductsOverview();
  }
  const ARTICLE_DETAILS = data.ARTICLE_DETAILS;
  function postSlug(p) {
    return p.url.split('/').filter(Boolean).pop();
  }
  function articleAuthorHeader(p, d) {
    if (blogAuthor(p)) return blogAuthorByline(p);
    const original = d.author || '';
    const name = [uiCopy("s234f1b97e70059"), uiCopy("sa94d28bda1b323"), uiCopy("s55f5b50b40d9bd"), uiCopy("sa94d28bda1b323"), uiCopy("sc6e4b855eea2d7")].includes(original) ? uiCopy("sc6e4b855eea2d7") : original;
    if (!name) return '';
    return `<div class="blog-card-author"><span class="author-initial" aria-hidden="true">${safe(name.slice(0, 1))}</span><div class="blog-author-info"><span class="blog-author-name">${safe(name)}</span><span class="blog-author-title">${name === uiCopy("sc6e4b855eea2d7") ? uiCopy("sc36f8a800aae26") : uiCopy("s7d4146ca082798")}</span></div></div>`;
  }
  function articleTocLinks(p, toc) {
    return toc.map((x, i) => `<a href="#/blog/${postSlug(p)}?section=${x.id}" data-article-section="${x.id}"><span aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${safe(x.text)}</a>`).join('');
  }
  function blogDetailPage(slug) {
    const p = CONTENT_DATA.posts.find(x => postSlug(x) === slug);
    if (!p) return notFound();
    const d = ARTICLE_DETAILS[p.id] || {},
      toc = d.tocCompact || d.toc || [];
    const related = CONTENT_DATA.posts.filter(x => x.category === p.category && x.id !== p.id).slice(0, 3);
    return `<article class="blog-detail"><div class="article-hero"><div class="article-shell"><nav class="breadcrumb" aria-label="面包屑"><a href="#/">${uiCopy("s203c08e0d44ac3")}</a><span>${uiCopy("s8a5edab2826324")}</span><a href="#/blog">${uiCopy("s7855e5e9727ea5")}</a><span>${uiCopy("s8a5edab2826324")}</span><span>${safe(p.category)}</span></nav><div class="article-kicker"><span class="tag">${safe(p.category)}</span><time datetime="${p.date}">${p.date.replaceAll('-', '.')}</time></div><h1>${safe(p.title)}</h1><div class="article-author-row">${articleAuthorHeader(p, d)}<div class="article-share"><button type="button" data-copy-article="${safe(p.url)}" aria-label="复制原文链接"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/></svg>${uiCopy("s2e312abf3b5bec")}</button><span class="article-share-status" role="status" aria-live="polite"></span></div></div><div class="article-cover">${editorialCover(p)}</div><p class="article-deck">${safe(p.desc)}</p></div></div><div class="article-reading"><div class="article-shell"><div class="article-reading-grid"><div>${toc.length ? `<details class="article-toc-mobile"><summary>${uiCopy("s4c21faca26d12b")}${toc.length}${uiCopy("s23f4f0e21d6130")}</summary><nav aria-label="文章目录">${articleTocLinks(p, toc)}</nav></details>` : ''}<div class="article-prose">${d.body || `<p>${uiCopy("sa71a1207acc979")}</p><p><a href="${safe(p.url)}" target="_blank" rel="noopener">${uiCopy("s3cf078e6b9bbf1")}</a></p>`}</div><div class="article-end"><div><strong>${uiCopy("s2bebe26c9fc5d2")}</strong><p>${uiCopy("sc2f794ad7de9a9")}</p></div><a class="textlink" href="${safe(p.url)}" target="_blank" rel="noopener">${uiCopy("s28a9b82be369f5")}</a><a class="textlink" href="#/blog">${uiCopy("sd0e1d306fe7cf8")}</a></div></div>${toc.length ? `<aside class="article-toc" aria-label="文章目录"><strong>${uiCopy("s421185c97f13fb")}</strong>${articleTocLinks(p, toc)}</aside>` : ''}</div></div></div></article>${related.length ? `<section class="article-related"><div class="wrap">${intro(uiCopy("scadf9eb6ac5351"), uiCopy("s4ec2a77b1ae3ba"), '', link(uiCopy("s91e9c2609a5392"), uiCopy("s1ab08ebf532419")))}<div class="grid3">${related.map(x => `<a class="blog-card" href="#/blog/${postSlug(x)}">${editorialCover(x)}<div class="blog-card-body"><div class="article-meta"><span>${safe(x.category)}</span><time datetime="${x.date}">${x.date.replaceAll('-', '.')}</time></div><h2>${safe(x.title)}</h2>${blogAuthorByline(x)}<span class="read-more">${uiCopy("s380cbe6da507af")}<span>${uiCopy("s161660030aa6c9")}</span></span></div></a>`).join('')}</div></div></section>` : ''}`;
  }
  document.addEventListener(uiCopy("se5c7ffac26fed6"), async e => {
    const target = e.target.closest(uiCopy("s9e146c7c146ca0"));
    if (target) {
      e.preventDefault();
      document.getElementById(target.dataset.articleSection)?.scrollIntoView({
        behavior: uiCopy("s618dc58379dda3"),
        block: uiCopy("scced28c6dc3f99")
      });
      document.querySelectorAll(uiCopy("s9e146c7c146ca0")).forEach(a => a.toggleAttribute(uiCopy("s4f7b26910a2cdc"), a.dataset.articleSection === target.dataset.articleSection));
      return;
    }
    const btn = e.target.closest(uiCopy("s0c8ecc56129d9b"));
    if (!btn) return;
    const status = btn.parentElement.querySelector(uiCopy("sae07e5b1af632e"));
    status.textContent = translateText(uiCopy("s2b2ad5e6aba9e6"));
    try {
      await Promise.race([navigator.clipboard.writeText(btn.dataset.copyArticle), new Promise((_, reject) => setTimeout(() => reject(new Error(uiCopy("s8f3c31b098f914"))), 1500))]);
      status.textContent = translateText(uiCopy("sb7f80f4c0873d9"));
    } catch {
      status.textContent = translateText(uiCopy("s550638d2af2ca9"));
      let input = btn.parentElement.querySelector(uiCopy("sc96c6d5be8d08a"));
      if (!input) {
        input = document.createElement(uiCopy("sc96c6d5be8d08a"));
        input.className = uiCopy("sbe1ba7c1a029ee");
        input.readOnly = true;
        input.setAttribute(uiCopy("s66ba2129a90d4a"), uiCopy("se3e8e974ffdc45"));
        btn.parentElement.append(input);
      }
      input.value = btn.dataset.copyArticle;
      input.focus();
      input.select();
    }
  });
  const OVERVIEW_DATA = data.OVERVIEW_DATA;
  const COMMUNITY_ASSETS = {
    "bilibili": uiCopy("s5f9bb20e824500"),
    "slack": uiCopy("s535081b6b3cdef"),
    "discord": uiCopy("sb19a2532bf1833"),
    "reddit": uiCopy("sbdde4642aa1126"),
    "wechat": uiCopy("sa505c21972e23d")
  };
  function heroUsers() {
    const caseBySlug = slug => CASE_LIBRARY.find(c => c.slug === slug);
    const users = [
      {...caseBySlug('sf-technology'),logo:'/logos/company8.svg'},
      {name:uiCopy('heroUser4paradigm'),logo:'/logos/company6.png'},
      {...caseBySlug('daocloud'),logo:'/logos/company7.png'},
      {name:uiCopy('heroUserCloudpilot'),logo:'/logos/company9.svg'},
      {name:uiCopy('heroUserOpencsg'),logo:'/logos/opencsg.svg'},
      {name:uiCopy('heroUserIntsig'),logo:'/logos/intsig-zh.png'},
      ...['snow-corp','china-merchants-bank-2','ke-holdings-inc','nio'].map(caseBySlug)
    ].filter(Boolean);
    const marks = users.map(c => {
      const image = '<img src="'+c.logo+'" alt="'+safe(c.name)+'" loading="eager">';
      return c.slug ? '<a class="hero-user-mark" href="#/cases/'+c.slug+'" title="'+safe(c.name)+'">'+image+'</a>' : '<span class="hero-user-mark" title="'+safe(c.name)+'">'+image+'</span>';
    }).join('');
    return '<div class="wrap hero-users"><div class="hero-users-label">'+uiCopy("seaa26433478117")+'</div><div class="hero-users-viewport" role="region" aria-label="'+uiCopy("seaa26433478117")+'"><div class="hero-users-track"><div class="hero-users-set">'+marks+'</div><div class="hero-users-set" aria-hidden="true" inert>'+marks+'</div><div class="hero-users-set" aria-hidden="true" inert>'+marks+'</div></div></div></div>';
  }
  function socialCards() {
    const channels = [[uiCopy("s5acb7efa8ac5b6"), uiCopy("sf78bebf2440692"), uiCopy("sa847060256d01c"), uiCopy("s443fe0596f8c9c")], [uiCopy("s877c3aec832cd4"), uiCopy("sb27fb38ba32374"), uiCopy("sa070ec1a0a4601"), uiCopy("sc3be863cc60d67")], [uiCopy("se1ba4807a15d85"), uiCopy("s053bc65874ad60"), uiCopy("sa070ec1a0a4601"), uiCopy("se5079f3004ac2b")], [uiCopy("s2e183f2a7a70de"), uiCopy("seb0050f72303bc"), uiCopy("sb127b483b51883"), uiCopy("s2f741da88dfe3f")]];
    return `<div class="social-cards">${channels.map(([id, name, action, url]) => `<a class="social-card" href="${url}" target="_blank" rel="noopener"><img src="${COMMUNITY_ASSETS[id]}" alt="" loading="lazy"><strong>${name}</strong><span>${action}${uiCopy("s7d0da37bafe18c")}</span></a>`).join('')}<button class="social-card" type="button" data-community-wechat><img src="${COMMUNITY_ASSETS.wechat}" alt=""><strong>${uiCopy("s81b430b6964351")}</strong><span>${uiCopy("s2bd907dadc5f37")}</span></button></div>`;
  }
  function communityPage() {
    return `<section class="community-page-hero"><div class="wrap"><div class="eyebrow">${uiCopy("s7928371f730382")}</div><h1>${uiCopy("sce5a85e364c965")}<br>${uiCopy("sf103fda5e7bde7")}</h1><p>${uiCopy("s13afeb42a12cb8")}</p></div></section><div class="wrap community-questions">
  <section class="community-question" id="what-is-hami"><div class="question-title"><small>${uiCopy("sc2f2c9a90d2ef4")}</small><h2>${uiCopy("see19ee75e2a0fa")}</h2></div><div class="question-answer"><div class="community-hami-mark"><img src="${HAMI}" alt="HAMi"><a href="https://www.cncf.io/projects/hami/" target="_blank" rel="noopener">${uiCopy("s4a9a59e92d43df")}</a></div><p>${uiCopy("s6699ee7ef2c364")}</p><p>${uiCopy("s82f7dc4aa85a50")}</p><div class="actions"><a class="textlink" href="https://github.com/Project-HAMi/HAMi" target="_blank" rel="noopener">${uiCopy("s927ad718291c78")}</a><a class="textlink" href="https://project-hami.io/" target="_blank" rel="noopener">${uiCopy("s0606b669088911")}</a></div></div></section>
  <section class="community-question" id="dynamia-and-hami"><div class="question-title"><small>${uiCopy("sd2ab1f3ae09bd9")}</small><h2>${uiCopy("s6a4849054151f9")}</h2></div><div class="question-answer"><p>${uiCopy("s10a98d411d4b60")}</p><p>${uiCopy("s81047ca696ac88")}</p><a class="textlink" href="#/about">${uiCopy("s7221d6b280671f")}</a></div></section>
  <section class="community-question" id="follow-us"><div class="question-title"><small>${uiCopy("s3d0bb20e2d53f7")}</small><h2>${uiCopy("s8ae1c7a1e921bb")}</h2></div><div class="question-answer"><p>${uiCopy("s013f806eba959e")}</p>${socialCards()}</div></section>
  </div>`;
  }
  function productMatrix() {
    return `<div class="matrix-scroll" tabindex="0" role="region" aria-label="完整产品能力对比，可横向滚动"><table class="full-product-matrix"><thead><tr><th scope="col">${uiCopy("saceac63a9bc4b1")}</th><th scope="col">${uiCopy("s2a23e4a64787c7")}</th><th scope="col">${uiCopy("sd6aff76589ed73")}</th><th scope="col">${uiCopy("s896fd762cb0eeb")}</th></tr></thead>${OVERVIEW_DATA.groups.map(g => `<tbody><tr class="matrix-group"><th colspan="4" scope="colgroup">${safe(g.title)}<small>${safe(g.desc)}</small></th></tr>${g.rows.map(r => `<tr class="matrix-feature"><th scope="row">${safe(r.feature)}</th>${r.support.map(v => `<td><span class="${v ? uiCopy("s95708e1cf01d3b") : uiCopy("sab8c4c231635af")}" aria-label="${v ? uiCopy("sd93373f81363e3") : uiCopy("s7c537860657002")}">${v ? '✓' : '—'}</span></td>`).join('')}</tr>`).join('')}</tbody>`).join('')}</table></div><p class="matrix-note">${uiCopy("sf06026c9468b6c")}</p>`;
  }
  function fullProductsOverview() {
    const routes = [uiCopy("s0b7e7750df02b5"), uiCopy("s929cc1cbe8a04c")];
    const names = [uiCopy("sd6aff76589ed73"), uiCopy("s896fd762cb0eeb")];
    const trust = [uiCopy("s74406e0fa5d4ae"), uiCopy("s62a950a424193f"), uiCopy("s6617d4aedbc459")].map(slug => CASE_LIBRARY.find(c => c.slug === slug));
    return `<section class="product-overview-hero"><div class="wrap"><div class="eyebrow">${uiCopy("s9a7532a8223e99")}</div><h1>${uiCopy("sc6e4b855eea2d7")}<br><em>${uiCopy("sb5c1ae6bcc4a9a")}</em></h1><p class="lead">${uiCopy("s619e3b48e9fc10")}<br>${uiCopy("s5a4b230a5012b1")}</p><div class="actions"><a class="btn primary" href="#/contact-sales">${uiCopy("s1ceecf1b714dbe")}</a><a class="btn" href="#/products?section=product-matrix">${uiCopy("s0827dab573b910")}</a></div></div></section>` + section(`<div class="overview-origin"><div class="origin-marks"><img src="${DYNAMIA_LOGO}" alt="密瓜智能"><span aria-hidden="true">${uiCopy("s161660030aa6c9")}</span><img src="${HAMI}" alt="HAMi"></div><div><h2>${uiCopy("sc5d4a6107a7da6")}</h2><p>${uiCopy("s8ac6b4992310a6")}</p><a class="textlink" href="#/community" style="margin-top:18px">${uiCopy("s02435fb3f38f30")}</a></div></div>` + intro(uiCopy("sd1eb095ecbf6d0"), uiCopy("s10e43733b8bfa2"), uiCopy("s085151cfac013b")) + `<div class="overview-lineup">${OVERVIEW_DATA.products.map((p, i) => `<article class="overview-product"><div class="eyebrow">${i ? uiCopy("s8b963659da6f5f") : uiCopy("s87ca5cd944a84b")}</div><h3>${names[i]}</h3><p>${i ? uiCopy("se1eb71a18eae39") : uiCopy("s7596bec735a855")}</p><div class="release-meta"><span>${uiCopy("s9c2295ce648a08")}${safe(p.version)}</span><span>${uiCopy("sf0a81d80ddaa15")}${safe(p.date)}</span><span>${p.artifactCount}${uiCopy("s3c69c67e6a6de3")}</span></div><div class="actions"><a class="btn primary small" href="${routes[i]}">${uiCopy("s1a11db67a92f29")}</a><a class="textlink" href="https://dynamia.ai/zh/products/${p.id}" target="_blank" rel="noopener">${uiCopy("s86dea4512fff1e")}</a></div></article>`).join('')}</div>`) + section(intro(uiCopy("s4a2b591f1e43c6"), uiCopy("sc783dcdb72c6ea"), uiCopy("sdd30a92949a98e")) + `<div class="selection-guide">${OVERVIEW_DATA.decisions.map((d, i) => `<a href="${i === 0 ? uiCopy("saa785ed7b9e196") : i === 1 ? uiCopy("s0b7e7750df02b5") : uiCopy("s929cc1cbe8a04c")}" ${i === 0 ? uiCopy("s60ec3733aad9be") : ''}><span>${safe(d.scenario)}</span><strong>${safe(d.choice)}${uiCopy("s1273c66ca1ec02")}</strong></a>`).join('')}</div>` + productMatrix(), uiCopy("s76ea797fbf44a4"), uiCopy("sd56b621b727c7c")) + section(intro(uiCopy("s20bc94082015af"), uiCopy("sd542d3f48dbc65"), uiCopy("saeee5fa147e58e"), link(uiCopy("sc5c79e892622f2"), uiCopy("s2e85eeb445f6af"))) + `<div class="overview-cases">${trust.map(c => `<a class="overview-case" href="#/cases/${c.slug}">${caseLogo(c)}<h3>${safe(c.title)}</h3><span class="textlink">${uiCopy("s055a07ba20b349")}</span></a>`).join('')}</div>`) + section(salesBanner());
  }
  document.addEventListener(uiCopy("se5c7ffac26fed6"), e => {
    if (e.target.closest(uiCopy("s6e0fd4b6f2ce54"))) document.querySelector(uiCopy("se766a0c52e1920")).showModal();
    if (e.target.closest(uiCopy("s863a6208987cf8"))) document.querySelector(uiCopy("se766a0c52e1920")).close();
  });
  const COMPANY_CONTACT_ICONS = {
    "email": `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>`,
    "linkedin": `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>`,
    "x": `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
                    </svg>`,
    "wechat": `<svg aria-hidden="true" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M199.836 135.671C199.836 106.419 171.913 82.7169 137.478 82.7169C103.024 82.7169 75.1018 106.425 75.1018 135.671C75.1018 164.918 103.024 188.626 137.478 188.626C148.299 188.626 158.483 186.266 167.368 182.139L191.95 192.778L189.103 165.355C195.89 156.888 199.842 146.661 199.842 135.671H199.836ZM116.455 121.323C111.547 121.323 107.583 117.352 107.583 112.45C107.583 107.549 111.547 103.578 116.455 103.578C121.357 103.578 125.321 107.555 125.321 112.45C125.321 117.346 121.344 121.323 116.455 121.323ZM158.483 121.323C153.594 121.323 149.616 117.352 149.616 112.45C149.616 107.549 153.594 103.578 158.483 103.578C163.397 103.578 167.368 107.555 167.368 112.45C167.368 117.346 163.397 121.323 158.483 121.323ZM137.478 75.705C147.113 75.705 156.291 77.4221 164.652 80.5128C164.714 79.3951 164.845 78.3212 164.845 77.1973C164.845 38.5475 127.938 7.22186 82.4196 7.22186C36.914 7.22186 0.00634766 38.5413 0.00634766 77.1973C0.00634766 91.7331 5.23874 105.251 14.1925 116.44L10.4337 152.667L42.9082 138.6C50.9503 142.346 59.8417 144.875 69.2262 146.167C68.5207 142.752 68.0899 139.255 68.0899 135.671C68.0961 102.61 99.222 75.7112 137.478 75.7112V75.705ZM110.199 34.8074C116.674 34.8074 121.906 40.0523 121.906 46.5147C121.906 52.9897 116.674 58.2345 110.199 58.2345C103.724 58.2345 98.4852 52.9897 98.4852 46.5147C98.4852 40.0461 103.73 34.8074 110.199 34.8074ZM54.6405 58.2345C48.1656 58.2345 42.9332 52.9897 42.9332 46.5147C42.9332 40.0461 48.1718 34.8074 54.6405 34.8074C61.1154 34.8074 66.354 40.0523 66.354 46.5147C66.354 52.9772 61.1092 58.2345 54.6405 58.2345Z" fill="currentColor"/>
                    </svg>`
  };
  function companyContactCards() {
    return `<div class="eyebrow">${uiCopy("s00484dda9f7e56")}</div><h2>${uiCopy("sc044f887b35d4c")}</h2><div class="company-contact-grid">
  <a class="company-contact-card" href="mailto:info@dynamia.ai">${COMPANY_CONTACT_ICONS.email}<strong>${uiCopy("s3d708e8e8b1f92")}</strong><span>${uiCopy("s0b077b5fcc72eb")}</span></a>
  <a class="company-contact-card" href="https://www.linkedin.com/company/dynamia-ai/" target="_blank" rel="noopener">${COMPANY_CONTACT_ICONS.linkedin}<strong>${uiCopy("sdd84425b72da12")}</strong><span>${uiCopy("s6f40ed58a56f52")}</span></a>
  <a class="company-contact-card" href="https://x.com/dynamia_ai" target="_blank" rel="noopener">${COMPANY_CONTACT_ICONS.x}<strong>${uiCopy("s89c9b65356e34a")}</strong><span>${uiCopy("s6f40ed58a56f52")}</span></a>
  <button class="company-contact-card" type="button" data-company-wechat>${COMPANY_CONTACT_ICONS.wechat}<strong>${uiCopy("s81b430b6964351")}</strong><span>${uiCopy("sfc86b80387f23d")}</span></button></div>`;
  }
  function syncThemeButton() {
    const dark = document.documentElement.dataset.theme === uiCopy("se6bb5689beec52");
    const button = document.querySelector(uiCopy("s9f2e48e02e8c5f"));
    button.setAttribute(uiCopy("scaf57005bfdd09"), String(dark));
    button.setAttribute(uiCopy("s66ba2129a90d4a"), translateText(dark ? uiCopy("sa2122435e95c3b") : uiCopy("sabf62b7d33d3af")));
    button.title = translateText(dark ? uiCopy("sa2122435e95c3b") : uiCopy("sabf62b7d33d3af"));
  }
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    syncThemeButton();
  }
  document.querySelector(uiCopy("s9f2e48e02e8c5f")).addEventListener(uiCopy("se5c7ffac26fed6"), () => {
    const theme = document.documentElement.dataset.theme === uiCopy("se6bb5689beec52") ? uiCopy("s99a7026172d427") : uiCopy("se6bb5689beec52");
    applyTheme(theme);
    try {
      localStorage.setItem(uiCopy("s6090b8d6b8100d"), theme);
    } catch (_) {}
  });
  window.matchMedia(uiCopy("sa085a59f1538c1")).addEventListener(uiCopy("s12ea12eace7d65"), event => {
    let saved;
    try {
      saved = localStorage.getItem(uiCopy("s6090b8d6b8100d"));
    } catch (_) {}
    if (saved !== uiCopy("s99a7026172d427") && saved !== uiCopy("se6bb5689beec52")) applyTheme(event.matches ? uiCopy("se6bb5689beec52") : uiCopy("s99a7026172d427"));
  });
  window.addEventListener(uiCopy("s49a25f9feefaff"), event => {
    if (event.key === uiCopy("s6090b8d6b8100d")) applyTheme(event.newValue === uiCopy("se6bb5689beec52") ? uiCopy("se6bb5689beec52") : event.newValue === uiCopy("s99a7026172d427") ? uiCopy("s99a7026172d427") : matchMedia(uiCopy("sa085a59f1538c1")).matches ? uiCopy("se6bb5689beec52") : uiCopy("s99a7026172d427"));
  });
  document.addEventListener(uiCopy("se5c7ffac26fed6"), event => {
    if (event.target.closest(uiCopy("s30a68c14b66010"))) document.querySelector(uiCopy("s621035c292172e")).showModal();
    if (event.target.closest(uiCopy("se81dff632dd860"))) document.querySelector(uiCopy("s621035c292172e")).close();
  });
  syncThemeButton();
  function render() {
    if (context.nativeShell) return;
    const raw = location.hash.slice(1) || document.body.dataset.start || '/';
    const [path, query] = raw.split('?');
    closeMenus();
    document.querySelector(uiCopy("s5e33fcdf3c947c")).classList.remove(uiCopy("s2348f998744212"));
    document.querySelector(uiCopy("scb4b0046aa32e1")).setAttribute(uiCopy("s3e9cf9b3cf3ee2"), uiCopy("sfcbcf165908dd1"));
    const pages = {
      '/': homepage,
      '/products': productsOverview,
      '/enterprise': () => productPage(uiCopy("s9b97ac5e767e53")),
      '/platform': () => productPage(uiCopy("sd294fcce0cc885")),
      '/compare': productsOverview,
      '/cases': casePage,
      '/get-practices': practiceFormPage,
      '/resources': resourcePage,
      '/videos': videosPage,
      '/tools': toolsPage,
      '/contact-sales': contactSalesPage,
      '/what-is-hami': openSourcePage,
      '/poc': resourcePage,
      '/compatibility': compatibilityPage,
      '/opensource': openSourcePage,
      '/community': communityPage,
      '/about': aboutPage,
      '/careers': careersPage,
      '/events': eventsPage,
      '/blog': blogPage,
      '/pricing': pricingPage
    };
    document.querySelector(uiCopy("sca2868d0ca39dd")).close();
    document.querySelector(uiCopy("s621035c292172e")).close();
    document.querySelector(uiCopy("se766a0c52e1920")).close();
    practiceAccess = false;
    app.innerHTML = normalizeHTML(path.startsWith(uiCopy("s861e45ba68155e")) ? videoDetailPage(path.slice(uiCopy("s861e45ba68155e").length)) : path.startsWith(uiCopy("s4de05a93c7154e")) ? caseDetailPage(path.slice(uiCopy("s4de05a93c7154e").length)) : path.startsWith(uiCopy("s68a120ac7e20ad")) ? blogDetailPage(path.slice(uiCopy("s68a120ac7e20ad").length)) : (pages[path] || notFound)());
    if (path === '/') {
      renderWhy();
      syncMotionButtons();
      queueCommunityNumbers();
    }
    if (path === uiCopy("s8caafe4386f958")) renderBlogResults();
    if (path === uiCopy("s417baafa3f2581")) renderEvents();
    document.title = (app.querySelector(uiCopy("s33112ee14ee469"))?.innerText?.replace(/\n/g,' ') || app.querySelector(uiCopy("s33112ee14ee469"))?.textContent || uiCopy("saa388f544acdc3")) + translateText(uiCopy("s1668918850201a"));
    const target = new URLSearchParams(query || '').get(uiCopy("s3fb45623cb3075"));
    requestAnimationFrame(() => {
      if (target) document.getElementById(target)?.scrollIntoView({
        behavior: uiCopy("s618dc58379dda3")
      });else window.scrollTo({
        top: 0,
        behavior: uiCopy("s618dc58379dda3")
      });
      updateProgress();
    });
  }
  function closeMenus() {
    document.querySelectorAll(uiCopy("s367574c30282f9")).forEach(m => m.classList.remove(uiCopy("s2348f998744212")));
    document.querySelectorAll(uiCopy("sacfa3340f137e1")).forEach(b => b.setAttribute(uiCopy("s3e9cf9b3cf3ee2"), uiCopy("sfcbcf165908dd1")));
  }
  function setMenu(name) {
    closeMenus();
    document.querySelector(uiCopy("s128ca7d8d38f34") + name)?.classList.add(uiCopy("s2348f998744212"));
    document.querySelector(`${uiCopy("s5c2a5d232dee1c")}${name}${uiCopy("s9980a615c2c256")}`)?.setAttribute(uiCopy("s3e9cf9b3cf3ee2"), uiCopy("sb5bea41b6c623f"));
  }
  let menuTimer;
  document.querySelectorAll(uiCopy("sacfa3340f137e1")).forEach(b => {
    b.addEventListener(uiCopy("se5c7ffac26fed6"), e => {
      const open = b.getAttribute(uiCopy("s3e9cf9b3cf3ee2")) === uiCopy("sb5bea41b6c623f");
      if (e.detail === 0 && open) closeMenus();else setMenu(b.dataset.menu);
    });
    b.addEventListener(uiCopy("s27ff41c924cc93"), () => {
      clearTimeout(menuTimer);
      setMenu(b.dataset.menu);
    });
  });
  document.querySelector(uiCopy("s1e0584a25d9f43")).addEventListener(uiCopy("s40edf666a7ce5c"), () => {
    menuTimer = setTimeout(closeMenus, 180);
  });
  document.querySelector(uiCopy("s1e0584a25d9f43")).addEventListener(uiCopy("s27ff41c924cc93"), () => clearTimeout(menuTimer));
  document.addEventListener(uiCopy("se5c7ffac26fed6"), e => {
    if (!e.target.closest(uiCopy("s1e0584a25d9f43"))) closeMenus();
  });
  document.addEventListener(uiCopy("s03242d1760cedc"), e => {
    if (e.key === uiCopy("s037c968467aa3f")) closeMenus();
  });
  document.querySelector(uiCopy("scb4b0046aa32e1")).onclick = e => {
    const b = e.currentTarget;
    const opened = document.querySelector(uiCopy("s5e33fcdf3c947c")).classList.toggle(uiCopy("s2348f998744212"));
    b.setAttribute(uiCopy("s3e9cf9b3cf3ee2"), opened);
    b.setAttribute(uiCopy("s66ba2129a90d4a"), opened ? uiCopy("s95ddfcc9901d93") : uiCopy("s87fe6f60803653"));
  };
  function showContact() {
    document.querySelector(uiCopy("sb75c28b0ea65ed")).innerHTML = normalizeHTML(`<form id="contact-form"><div class="form-grid"><label class="field">${uiCopy("s50b5b1d2abefbc")}<input name="person" required autocomplete="name" placeholder="如何称呼你"></label><label class="field">${uiCopy("s77ecb99a3da3eb")}<input name="company" required autocomplete="organization" placeholder="公司或组织名称"></label><label class="field full">${uiCopy("sd5e32f82b0036e")}<input type="email" name="email" required autocomplete="email" placeholder="you@company.com"></label><label class="field full">${uiCopy("s0da3b1f7eb5518")}<select name="interest"><option>${uiCopy("sd721ad5052c8c5")}</option><option>${uiCopy("s130b3cc11e2b2f")}</option><option>${uiCopy("s69bb200f75d5f1")}</option><option>${uiCopy("s42c825829c4caa")}</option></select></label><label class="field full">${uiCopy("s51fe2d5c1c69c1")}<textarea name="notes" placeholder="设备型号、集群规模、正在解决的问题……"></textarea></label></div><div class="modal-note">${uiCopy("sdfe97ac8052784")}</div><div class="actions"><button type="submit" class="btn primary">${uiCopy("s7f9c309ed07512")}</button></div></form>`);
    document.querySelector(uiCopy("sf4522aa17fb33e")).showModal();
  }
  document.querySelector(uiCopy("sdf489c85eca7ba")).onclick = () => document.querySelector(uiCopy("sf4522aa17fb33e")).close();
  document.querySelector(uiCopy("sf4522aa17fb33e")).addEventListener(uiCopy("se5c7ffac26fed6"), e => {
    if (e.target === e.currentTarget) {
      const r = e.currentTarget.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.currentTarget.close();
    }
  });
  function safe(t) {
    const d = document.createElement(uiCopy("scd35a2426062b7"));
    d.textContent = t;
    return d.innerHTML;
  }
  document.addEventListener(uiCopy("s75490bd7b93e6f"), e => {
    if (e.target.id !== uiCopy("s8d9be2fa671612")) return;
    e.preventDefault();
    const f = new FormData(e.target);
    document.querySelector(uiCopy("sb75c28b0ea65ed")).innerHTML = normalizeHTML(`<div class="form-result"><div class="tag">${uiCopy("s1ef76780201ddd")}</div><h3 style="margin-top:18px">${uiCopy("s8f310a83e30ae4")}</h3><p>${safe(f.get(uiCopy("s38a81e87e79631")))}${uiCopy("s588da410532073")}${safe(f.get(uiCopy("sf168ccdd91548c")))}<br>${safe(f.get(uiCopy("s828408e40d4fe6")))}</p><p style="font-size:12px">${uiCopy("s1d985bf65862ef")}</p></div><div class="actions"><button class="btn" data-close-dialog>${uiCopy("s76ff82a26e5d78")}</button></div>`);
  });
  document.addEventListener(uiCopy("se5c7ffac26fed6"), e => {
    const b = e.target.closest(uiCopy("sc3e2d78f3ff335"));
    if (!b) return;
    if (b.hasAttribute(uiCopy("s20b273e78fd107"))) location.hash = uiCopy("s3bcd3f014803aa");
    if (b.hasAttribute(uiCopy("sd18203aa47a2f9"))) document.querySelector(uiCopy("sf4522aa17fb33e")).close();
    if (b.dataset.pool) renderPool(b.dataset.pool);
    if (b.dataset.cap) renderCap(b.dataset.cap);
    if (b.hasAttribute(uiCopy("sc2fdbaf86da38d"))) {
      const lines = [...document.querySelectorAll(uiCopy("sb509036d82e813"))].map(l => (l.querySelector(uiCopy("sc96c6d5be8d08a")).checked ? uiCopy("s9fe8e1fad25516") : uiCopy("sbbad69d62269e8")) + l.querySelector(uiCopy("s37a0025aa1f2e2")).textContent);
      const blob = new Blob([uiCopy("sa4990b7b4d6cf0") + lines.join('\n') + uiCopy("sff0ff403a6d019")], {
        type: uiCopy("sf9210f333a3c51")
      });
      const a = document.createElement(uiCopy("sca978112ca1bbd"));
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = uiCopy("s210b78c1291c66");
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  });
  document.addEventListener(uiCopy("s12ea12eace7d65"), e => {
    if (e.target.matches(uiCopy("s73897a5b18f191"))) document.querySelector(uiCopy("s347c6edd2f5375")).textContent = uiCopy("s581fe0d0fa68e5") + document.querySelectorAll(uiCopy("se8b1c142d9be65")).length + uiCopy("s742eb25737bc72");
  });
  document.addEventListener(uiCopy("s03242d1760cedc"), e => {
    if (!e.target.matches(uiCopy("sb4088bfb65ad25"))) return;
    const tabs = [...document.querySelectorAll(uiCopy("sb4088bfb65ad25"))];
    let i = tabs.indexOf(e.target);
    if ([uiCopy("s8e2f7ffbbdb947"), uiCopy("s9660fb862202c3"), uiCopy("s48e61e2dd0a223"), uiCopy("s12204d1d8ab89f"), uiCopy("s3a78695388b38b"), uiCopy("sf4db1e48476f60")].includes(e.key)) {
      e.preventDefault();
      if (e.key === uiCopy("s3a78695388b38b")) i = 0;else if (e.key === uiCopy("sf4db1e48476f60")) i = tabs.length - 1;else i = (i + ([uiCopy("s8e2f7ffbbdb947"), uiCopy("s9660fb862202c3")].includes(e.key) ? 1 : -1) + tabs.length) % tabs.length;
      renderCap(tabs[i].dataset.cap);
      tabs[i].focus();
    }
  });
  function updateProgress() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    document.querySelector(uiCopy("s10aec9e1b5dcb3")).style.width = (total > 0 ? window.scrollY / total * 100 : 0) + '%';
  }
  window.addEventListener(uiCopy("se16a9d4d1cf9ea"), updateProgress, {
    passive: true
  });
  window.addEventListener(uiCopy("sf0eb2d020ad9f8"), render);
  render();
  return {
    render
  };
}
