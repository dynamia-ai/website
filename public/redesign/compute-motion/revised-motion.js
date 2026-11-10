const cycleMs = 6500;
const params = new URLSearchParams(location.search);
const files = ['02', '06', '01', '04', '03', '05'];
const file = files[Number(params.get('scene'))] || files[0];
const lang = (params.get('lang') || parent.document.documentElement.lang || 'zh').split('-')[0];
document.documentElement.lang = lang;

const rect = (x,y,w,h,fill,extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const delay = seconds => `style="--delay:${seconds}s"`;
const trace = (path, seconds, color = '#d1fa6a', width = 5) =>
  `<path d="${path}" pathLength="1" class="trace" style="--delay:${seconds}s;stroke:${color};stroke-width:${width}"/>`;
const ring = (x,y,r,seconds,color = '#76b900') =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="3" class="signal" ${delay(seconds)}/>`;
const cover = (x,y,w,h,fill,seconds) =>
  rect(x,y,w,h,fill,`class="cover" ${delay(seconds)}`);
const wipe = (x,y,w,h,fill,seconds,axis = 'wipe') =>
  rect(x,y,w,h,fill,`class="${axis}" ${delay(seconds)}`);

const art = () => `<image href="${source}" width="1250" height="921"/>`;
const fan = (x,y,index) => `<defs><clipPath id="fan-${index}">
  <circle cx="${x}" cy="${y}" r="62"/>
  </clipPath></defs><circle cx="${x}" cy="${y}" r="63.5" fill="white"/>
  <g clip-path="url(#fan-${index})">
  <g class="fan" style="transform-origin:${x}px ${y}px">${art()}</g></g>`;
const bar = (y, width, seconds) => [
  rect(695,y-2,416,22,'white'),
  rect(697,y,411,17,'#dde9f2','rx="8.5"'),
  rect(697,y,width,17,'#76b900',`rx="8.5" class="bar-fill" ${delay(seconds)}`),
].join('');

// Cut at the task/arrow boundary so the card moves independently of the arrow.
const blockedTasks = [
  { y: 438, width: 246, height: 123, start: .12, travel: 19 },
  { y: 626, width: 248, height: 126, start: 1.02, travel: 21 },
];
const movingTask = ({y,width,height,start,travel}, i) => `<defs>
  <clipPath id="blocked-task-${i}">${rect(0,y,width,height,'white')}</clipPath></defs>
  <g class="blocked-task" style="--delay:${start}s;--travel:${travel}px">
    <use href="#sharing-art" clip-path="url(#blocked-task-${i})"/>
  </g>`;

const motions = {
  '02': () => [
    trace('M236 304 V360 H625 V403', .15),
    trace('M625 304 V403', .50),
    trace('M1015 304 V360 H625 V403', .85),
    trace('M625 540 V602 H236 V631', 1.75),
    trace('M625 540 V631', 1.95),
    trace('M625 540 V602 H1015 V631', 2.15),
    trace('M391 843 H464', 3.15, '#76b900'),
    trace('M860 843 H786', 3.15, '#76b900'),
  ],
  '06': () => [
    ring(265,500,17,.17,'#cf5525'),
    ring(269,682,17,1.07,'#cf5525'),
    trace('M642 534 H722', 2.05),
    cover(797,413,251,118,'white',2.75),
    cover(797,541,251,118,'white',3.25),
    cover(797,669,251,118,'white',3.75),
    fan(460.4,312.8,0),
    fan(922.3,312.8,1),
    `<circle cx="1101" cy="281" r="73" fill="white" class="cover" ${delay(4.2)}/>`,
  ],
  '01': () => [
    trace('M257 267 V328 H626 V373', .10),
    trace('M626 267 V373', .65),
    trace('M963 267 V328 H626 V373', 1.20),
    trace('M625 630 V687', 2.00, '#74bbeb'),
    trace('M1057 393 V484', 2.00, '#74bbeb'),
    trace('M1057 539 V624', 2.55, '#74bbeb'),
    trace('M625 687 V630', 3.65),
    trace('M1105 647 V539', 3.65),
    trace('M1105 484 V414', 4.20),
    ring(625,630,14,4.45),
  ],
  '04': () => [
    trace('M391 295 H437', .8),
    trace('M622 505 V557', 2.15, '#74bbeb'),
    trace('M798 301 H850', 2.8),
    rect(894,376,246,87,'none',`rx="14" stroke="#d1fa6a" stroke-width="4" class="signal" ${delay(3.65)}`),
  ],
  '03': () => [
    wipe(219,156,224,136,'white',.15,'rise'),
    trace('M696 345 L732 264 L753 311 L794 330 L843 232 L890 284', .7, '#a9e332'),
    trace('M505 488 L641 433', 1.85, '#76b900'),
    ...[[483,74],[568,132],[654,173],[739,354]].map(([y,w],i) =>
      bar(y,w,2.5+i*.25)),
  ],
  '05': () => [
    trace('M526 134 V172', .05),
    trace('M526 172 H381 V184', .30),
    trace('M526 172 H685 V184', .30),
    trace('M379 264 V295 H200 V319', .95),
    trace('M379 264 V295 H463 V319', 1.05),
    trace('M688 264 V295 H726 V319', .95),
    trace('M688 264 V295 H463 V319', 1.05),
    ...[198,461,724].map(x => trace(`M${x} 395 V437`, 1.70)),
    trace('M972 151 V139 H1105 V153', .55, '#008a78', 1.6),
    // Follow the printed wires and stop at the edge of each node.
    ...['M967.5 174 V184', 'M977 174 V184', 'M1100 174 V184', 'M1109.5 174 V184']
      .map(path => trace(path, 1.15, '#008a78', 1.6)),
    ...[
      'M954 193 H916.5 V278 H938',
      'M1124 193 H1162 V278 H1140',
      'M972 205 V214.5 H949 V227',
      'M1104.5 205 V214.5 H1129.5 V228',
      'M997 228 V219 H1082 V228',
    ].map(path => trace(path, 1.60, '#008a78', 1.6)),
    ...['M959 247 L986.5 270', 'M1091.5 247 L1119 270']
      .map(path => trace(path, 2.30, '#008a78', 1.6)),
    trace('M950 500 H986', 1.75, '#008a78', 2.5),
    trace('M1084 500 H1119', 1.75, '#008a78', 2.5),
    // Keep each highlight inside its original number block.
    ...[[363,761,2.65],[405,761,2.65],[363,838,4.15],[557,839,4.15]].map(([x,y,t]) =>
      rect(x,y,27,27,'none',`rx="2" stroke="white" stroke-width="2" class="signal" ${delay(t)}`)),
  ],
};

function localizedLabels() {
  if (lang !== 'en' && lang !== 'de') return '';
  const context = document.createElement('canvas').getContext('2d');
  return (window.revisedLabels[file] || []).map(([x,y,w,h,bg,fg,en,de]) => {
    const label = lang === 'de' ? de : en;
    let size = Math.floor(h * .72);
    context.font = `700 ${size}px Arial`;
    while (context.measureText(label).width > w - 6 && size > 10) {
      size--;
      context.font = `700 ${size}px Arial`;
    }
    const escaped = label.replaceAll('&','&amp;').replaceAll('<','&lt;');
    return rect(x,y,w,h,bg) + `<text x="${x+w/2}" y="${y+h/2}" dominant-baseline="central" text-anchor="middle" fill="${fg}" font-family="Arial,sans-serif" font-weight="700" font-size="${size}">${escaped}</text>`;
  }).join('');
}

const source = `assets/revised/${file}.png`;
const preload = new Image();
preload.onload = () => {
  const base = art() + localizedLabels();
  const phases = file === '04' ? [
    [385,265,65,65,.75],
    [449,154,346,621,1.2],[794,265,66,70,2.8],[860,154,354,621,3.25],
  ] : [];
  const sharing = file === '06';
  const taskLayers = sharing ? blockedTasks.map(movingTask).join('') : '';
  const animation = (motions[file]?.() || []).join('');
  // Elasticity reveals whole cards and connectors through a mask, keeping their artwork intact.
  const mask = phases.length ? `<defs><mask id="phases" maskUnits="userSpaceOnUse" x="0" y="0" width="1250" height="921">
    ${rect(0,0,1250,921,'white')}
    ${phases.map(([x,y,w,h,t]) => cover(x,y,w,h,'black',t)).join('')}
    </mask></defs>` : '';
  const sharingLayers = sharing ? `<defs>
    <g id="sharing-art">${base}</g>
    <mask id="sharing-base" maskUnits="userSpaceOnUse" x="0" y="0" width="1250" height="921">
      ${rect(0,0,1250,921,'white')}
      ${blockedTasks.map(({y,width,height}) => rect(0,y,width,height,'black')).join('')}
    </mask></defs><use href="#sharing-art" mask="url(#sharing-base)"/>` : '';
  document.body.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1250 921" aria-hidden="true">
    ${sharing ? sharingLayers : `${mask}<g ${mask ? 'mask="url(#phases)"' : ''}>${base}</g>`}${taskLayers}${animation}</svg>`;

  // Reset the timed layers together without repainting the artwork or interrupting the fans.
  setInterval(() => {
    for (const animation of document.getAnimations()) {
      if (animation.effect.target.classList.contains('fan')) continue;
      animation.currentTime = 0;
      animation.play();
    }
  }, cycleMs);
};
preload.src = source;
