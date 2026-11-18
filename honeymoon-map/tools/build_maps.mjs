// 장소(P)와 날짜별 일정(cz/at/hu)의 단일 소스.
// 실행: node tools/build_maps.mjs
//  - index.html 의 <!-- DAYS --> ~ <!-- /DAYS --> 구간을 다시 생성
//  - data/honeymoon_places.csv (구글 내 지도 가져오기용) 를 다시 씀
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// key: [표시 이름, 구글맵 검색어/주소, 날짜, 종류, 메모]
const P = {
  // Prague
  prg_air:   ['프라하 공항', 'Václav Havel Airport Prague', '12/21', '교통', '도착 후 한인 기사 픽업'],
  adria:     ['Hotel Adria (프라하 숙소)', 'Hotel Adria Prague, Václavské náměstí 26, 110 00 Praha 1', '12/21–24', '숙소', '예상 호텔, 바우처로 최종 확인'],
  oldtown:   ['구시가지 광장 크리스마스 마켓', 'Staroměstské náměstí, Praha', '12/21', '명소', '첫날 저녁 가볍게'],
  clock:     ['천문시계탑 전망대', 'Prague Astronomical Clock, Staroměstské nám. 1, Praha', '12/22–23', '명소', '입장권 포함, 일몰 시간 추천'],
  castle:    ['프라하성', 'Prague Castle, Hradčany, Praha', '12/22', '명소', '시내투어 포함'],
  strahov:   ['스트라호프 수도원', 'Strahov Monastery, Strahovské nádvoří 1, Praha', '12/22', '명소', '시내투어 포함'],
  charles:   ['까를교', 'Charles Bridge, Praha', '12/22', '명소', '시내투어 포함'],
  powder:    ['화약탑', 'Powder Tower, náměstí Republiky 5, Praha', '12/22', '명소', '시내투어 포함'],
  wenceslas: ['바츨라프 광장', 'Wenceslas Square, Praha', '12/22', '명소', '호텔 바로 앞'],
  vysehrad:  ['비셰흐라드', 'Vyšehrad, V Pevnosti, Praha 2', '12/23', '명소', '자유일정 오전 산책'],
  louvre:    ['카페 루브르', 'Café Louvre, Národní 22, Praha 1', '12/23', '식당', '1902년 클래식 카페, 점심'],
  theatre:   ['국민극장', 'National Theatre, Národní 2, Praha', '12/23', '명소', '레기교 건너 캄파 섬으로'],
  kampa:     ['캄파 섬', 'Kampa Island, Praha', '12/23', '명소', '강변 산책'],
  terasa:    ['테라사 우 즐라테 스투드녜', 'Terasa U Zlaté studně, U Zlaté studně 4, Praha 1', '12/23', '식당', '전망 디너, 예약 필수'],
  lokal:     ['Lokál Dlouhá', 'Lokál Dlouhá, Dlouhá 33, Praha 1', '12/23', '식당', '부담 없는 체코 맥주집 (대안)'],
  // Cesky Krumlov
  oldinn:    ['Hotel Oldinn (체스키 숙소)', 'Hotel Oldinn, náměstí Svornosti 12, 381 01 Český Krumlov', '12/24', '숙소', '이브 저녁 호텔 레스토랑 예약'],
  shuttle:   ['셔틀 탑승장 (관광안내소 앞)', 'náměstí Svornosti 2, 381 01 Český Krumlov', '12/25', '교통', '09:20 출발, 잘츠부르크 중앙역 하차'],
  ckcastle:  ['체스키크룸로프 성', 'Český Krumlov Castle, Zámek 59, Český Krumlov', '12/24', '명소', '차량투어 포함'],
  seminar:   ['세미나르니 정원 전망대', 'Seminární zahrada, Český Krumlov', '12/24', '명소', '마을 전경 뷰포인트'],
  barber:    ['이발사의 다리', 'Lazebnický most, Český Krumlov', '12/24', '명소', '저녁·아침 산책'],
  // Salzburg
  szghbf:    ['잘츠부르크 중앙역', 'Salzburg Hauptbahnhof, Südtiroler Platz 1, 5020 Salzburg', '12/25', '교통', '셔틀 하차, 락커 보관, 비엔나행 열차'],
  mirabell:  ['미라벨 정원', 'Mirabellgarten, Mirabellplatz, 5020 Salzburg', '12/25', '명소', '성과 대성당이 한 화면에'],
  makartsteg:['마카르트 다리', 'Makartsteg, Salzburg', '12/25', '명소', '사랑의 자물쇠'],
  domplatz:  ['돔 광장 크리스마스 마켓', 'Domplatz, 5020 Salzburg', '12/25', '식당', '25일 11~18시, 점심'],
  mozart:    ['모차르트 생가', 'Mozarts Geburtshaus, Getreidegasse 9, 5020 Salzburg', '12/25', '명소', '€13, 성탄절 운영 확인'],
  dom:       ['잘츠부르크 대성당', 'Salzburger Dom, Domplatz 1a, 5020 Salzburg', '12/25', '명소', '무료, 예배 시간 피하기'],
  stpeter:   ['장크트 페터 수도원 · 슈티프츠쿨리나리움', 'St. Peter Stiftskulinarium, St.-Peter-Bezirk 1, 5020 Salzburg', '12/25', '식당', '오래된 레스토랑, 예약'],
  festungsbahn:['성 푸니쿨라 승강장', 'FestungsBahn, Festungsgasse 4, 5020 Salzburg', '12/25', '교통', '성까지 푸니쿨라'],
  festung:   ['호헨잘츠부르크성', 'Festung Hohensalzburg, Mönchsberg 34, 5020 Salzburg', '12/25', '명소', '€16.5 (푸니쿨라 포함), 일몰 전망'],
  nonnberg:  ['논베르크 수도원', 'Stift Nonnberg, Nonnberggasse 2, 5020 Salzburg', '12/25', '명소', '무료, 성에서 걸어 내려가는 길'],
  tomaselli: ['카페 토마셀리', 'Café Tomaselli, Alter Markt 9, 5020 Salzburg', '12/25', '식당', '오래된 카페, 열차 전 휴식'],
  moench:    ['묀히스베르크 엘리베이터', 'Mönchsberg Aufzug, Gstättengasse 13, 5020 Salzburg', '12/25', '명소', '성 휴관 시 대안 전망'],
  // Vienna
  westbf:    ['비엔나 서역', 'Wien Westbahnhof', '12/25', '교통', '서역 도착편이면 호텔까지 도보 2분'],
  leonardo:  ['Leonardo Hotel Westbahnhof (비엔나 숙소)', 'Leonardo Hotel Vienna Westbahnhof, Wien', '12/25–28', '숙소', '지정 확정'],
  wienhbf:   ['비엔나 중앙역', 'Wien Hauptbahnhof', '12/28', '교통', '부다페스트행 열차 출발역 (티켓으로 확인)'],
  stephans:  ['슈테판 대성당', 'Stephansdom, Stephansplatz 3, 1010 Wien', '12/26–27', '명소', '시내투어 + 연말 조명'],
  oper:      ['비엔나 국립오페라하우스', 'Wiener Staatsoper, Opernring 2, 1010 Wien', '12/26', '명소', '시내투어 포함'],
  schoen:    ['쇤부른 궁전 · 크리스마스 마켓', 'Schloss Schönbrunn, Schönbrunner Schloßstraße 47, 1130 Wien', '12/26', '명소', '투어 종료 지점, 마켓 1/6까지'],
  sperl:     ['카페 슈페를', 'Café Sperl, Gumpendorfer Straße 11, 1060 Wien', '12/27', '식당', '비엔나식 아침, 일요일은 10시 오픈'],
  belvedere: ['벨베데레 궁전', 'Oberes Belvedere, Prinz-Eugen-Straße 27, 1030 Wien', '12/27', '명소', '클림트 「키스」, 마켓 12/31까지'],
  figl:      ['피글뮐러', 'Figlmüller Wollzeile, Wollzeile 5, 1010 Wien', '12/27', '식당', '슈니첼, 예약'],
  plachutta: ['플라후타', 'Plachutta Wollzeile, Wollzeile 38, 1010 Wien', '12/27', '식당', '타펠슈피츠, 예약 (대안)'],
  naschmarkt:['나슈마르크트', 'Naschmarkt, 1060 Wien', '12/28', '명소', '월요일 영업'],
  riesenrad: ['프라터 대관람차', 'Wiener Riesenrad, Riesenradplatz 1, 1020 Wien', '12/28', '명소', '윈터마켓 1/6까지'],
  // Budapest
  keleti:    ['부다페스트 켈레티역', 'Budapest-Keleti pályaudvar, Kerepesi út 2-6, 1087 Budapest', '12/28', '교통', '도착역 (티켓으로 확인)'],
  nemzeti:   ['Hotel Nemzeti MGallery (부다 숙소)', 'Hotel Nemzeti Budapest MGallery, József krt. 4, 1088 Budapest', '12/28–31', '숙소', '예상 호텔, 바우처로 최종 확인'],
  chain:     ['세체니 다리', 'Széchenyi Lánchíd, Budapest', '12/29', '명소', '야경 스냅 포인트'],
  batthyany: ['바차니 광장 (국회의사당 맞은편)', 'Batthyány tér, Budapest', '12/29', '명소', '야경 스냅 포인트'],
  bastion:   ['어부의 요새', 'Halászbástya, Szentháromság tér, 1014 Budapest', '12/29–30', '명소', '야경 스냅 + 낮 풍경'],
  funicular: ['부다성 푸니쿨라', 'Budavári Sikló, Clark Ádám tér, Budapest', '12/30', '교통', '언덕은 푸니쿨라로'],
  rosenstein:['로젠슈타인', 'Rosenstein Vendéglő, Mosonyi u. 3, 1087 Budapest', '12/30', '식당', '추천 · 헝가리 전통 요리, 호텔 근처라 저녁 대안'],
  vorosmarty:['뵈뢰스마르티 광장 마켓', 'Vörösmarty tér, Budapest', '12/30', '명소', '11~21시'],
  basilica:  ['성 이슈트반 대성당', 'Szent István-bazilika, Szent István tér 1, 1051 Budapest', '12/30', '명소', '17:30부터 조명 쇼'],
  newyork:   ['뉴욕 카페', 'New York Café, Erzsébet krt. 9-11, 1073 Budapest', '12/30', '식당', '예약 추천'],
  szechenyi: ['세체니 온천', 'Széchenyi gyógyfürdő, Állatkerti krt. 9-11, 1146 Budapest', '12/31', '명소', '입장권 포함, 연말 운영시간 확인'],
  bud_air:   ['부다페스트 공항', 'Budapest Liszt Ferenc International Airport', '12/31', '교통', '출발 3시간 30분 전 도착'],
  // 자유일정 추천 (선택) — 메모 앞에 '추천'
  slavia:    ['카바르나 슬라비아', 'Kavárna Slavia, Smetanovo nábřeží 1012/2, Praha 1', '12/23', '식당', '추천 · 국민극장 맞은편 강변 클래식 카페'],
  savoy:     ['카페 사보이', 'Café Savoy, Vítězná 124/5, Praha 5', '12/23', '식당', '추천 · 레기교 건너 바로, 아침·브런치'],
  dancing:   ['댄싱 하우스', 'Tančící dům, Jiráskovo náměstí 1981/6, Praha 2', '12/23', '명소', '추천 · 국민극장에서 강변 따라 10분'],
  klementinum:['클레멘티눔 바로크 도서관', 'Klementinum, Praha 1', '12/23', '명소', '추천 · 가이드투어로만 입장, 연말 운영 확인'],
  ufleku:    ['우 플레쿠', 'U Fleků, Křemencova 11, Praha 1', '12/23', '식당', '추천 · 오래된 양조 맥주홀, 흑맥주'],
  letna:     ['레트나 공원 전망', 'Letenské sady, Praha 7', '12/23', '명소', '추천 · 블타바강 다리들이 한눈에'],
  central:   ['카페 첸트랄', 'Café Central, Herrengasse 14, 1010 Wien', '12/27', '식당', '추천 · 대표 카페, 아침 일찍 가면 줄 짧음'],
  khm:       ['빈 미술사 박물관', 'Kunsthistorisches Museum, Maria-Theresien-Platz, 1010 Wien', '12/27', '명소', '추천 · 브뤼헐 방, 돔 아래 카페 · 월요일 휴관 확인'],
  albertina: ['알베르티나', 'Albertina, Albertinaplatz 1, 1010 Wien', '12/27', '명소', '추천 · 모네~피카소, 오페라하우스 옆'],
  sisi:      ['호프부르크 시시 박물관', 'Sisi Museum, Hofburg, Michaelerkuppel, 1010 Wien', '12/27', '명소', '추천 · 황실 아파트, 일요일에도 운영'],
  demel:     ['데멜', 'Demel, Kohlmarkt 14, 1010 Wien', '12/27', '식당', '추천 · 황실 납품 제과점, 케이크'],
  sacher:    ['카페 자허', 'Café Sacher Wien, Philharmoniker Straße 4, 1010 Wien', '12/27–28', '식당', '추천 · 원조 자허토르테'],
  karlskirche:['카를 성당', 'Karlskirche, Karlsplatz, 1040 Wien', '12/28', '명소', '추천 · 나슈마르크트에서 도보 5분'],
  parliament:['국회의사당 가이드투어', 'Hungarian Parliament Building, Kossuth Lajos tér 1-3, 1055 Budapest', '12/29', '명소', '추천 · 온라인 예매 필수, 연말 운영 확인'],
  market:    ['중앙시장', 'Great Market Hall, Vámház krt. 1-3, 1093 Budapest', '12/29', '식당', '추천 · 2층 랑고시 점심, 일요일 휴무'],
  shoes:     ['다뉴브 강변 신발 기념비', 'Shoes on the Danube Bank, Budapest', '12/29', '명소', '추천 · 국회의사당 남쪽 강변'],
  gerbeaud:  ['제르보', 'Gerbeaud, Vörösmarty tér 7-8, 1051 Budapest', '12/30', '식당', '1858년 카페, 마켓 바로 앞 · 점심'],
  matthias:  ['마차시 성당', 'Matthias Church, Szentháromság tér 2, 1014 Budapest', '12/30', '명소', '추천 · 어부의 요새 바로 옆'],
  synagogue: ['도하니 거리 시나고그', 'Dohány Street Synagogue, Dohány u. 2, 1074 Budapest', '12/30', '명소', '추천 · 토요일 휴관, 호텔에서 걸어갈 거리'],
  szimpla:   ['심플라 케르트', 'Szimpla Kert, Kazinczy u. 14, 1075 Budapest', '12/30', '식당', '추천 · 폐허 바, 저녁 한 잔'],
};

const MODE = { walking: '도보', transit: '대중교통', driving: '차량', train: '열차' };

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[c]));
const q = s => encodeURIComponent(s);
const need = k => { if (!P[k]) throw new Error('unknown place: ' + k); return P[k]; };

const searchUrl = k => 'https://www.google.com/maps/search/?api=1&query=' + q(need(k)[1]);
function dirUrl(o, d, mode, via = []) {
  const gm = mode === 'train' ? 'transit' : mode;
  let u = 'https://www.google.com/maps/dir/?api=1&origin=' + q(need(o)[1]) +
          '&destination=' + q(need(d)[1]) + '&travelmode=' + gm;
  if (via.length) u += '&waypoints=' + q(via.map(v => need(v)[1]).join('|'));
  return u;
}
const short = k => need(k)[0].replace(/\s*\(.*?\)/g, '');
// 출발지를 비우면 구글맵이 '내 위치'에서 출발
function hereUrl(d, mode, via = []) {
  const gm = mode === 'train' ? 'transit' : mode;
  let u = 'https://www.google.com/maps/dir/?api=1&destination=' + q(need(d)[1]) + '&travelmode=' + gm;
  if (via.length) u += '&waypoints=' + q(via.map(v => need(v)[1]).join('|'));
  return u;
}
const PIN = '<svg class="pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="11" r="2.2" fill="currentColor"/></svg>';
const ext = (href, text, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${esc(href)}" target="_blank" rel="noopener">${text}</a>`;

// here: '여기서' 버튼 목적지 (기본: 열차는 출발역, 그 외는 도착지) / hereMode: 그때 이동수단
function route(o, d, mode, { via = [], label, here, hereMode } = {}) {
  let lab = label || (short(o) + ' → ' + short(d));
  if (via.length && !label) lab = [o, ...via, d].map(short).join(' → ');
  // '오전 · 호텔 → …' 처럼 앞에 때가 붙어 있으면 따로 작게 보여줌
  const m = /^([^·→]{1,14}) · (.+)$/.exec(lab);
  const text = m ? `<span class="rt-when">${esc(m[1])}</span>${esc(m[2])}` : esc(lab);
  const target = here || (mode === 'train' ? o : d);
  const hm = hereMode || (mode === 'train' ? 'transit' : mode);
  const hereLink = `<a class="rt-here" href="${esc(hereUrl(target, hm, target === d ? via : []))}" target="_blank" rel="noopener" aria-label="내 위치에서 ${esc(short(target))}까지 길찾기">${PIN}<span aria-hidden="true">여기서</span></a>`;
  return `<li>${ext(dirUrl(o, d, mode, via), `<span class="rl">${text}</span><span class="rm ${mode}">${MODE[mode]}</span><span class="ra" aria-hidden="true">↗</span>`, 'rt')}${hereLink}</li>`;
}
const blk = (title, inner) => `<section class="blk"><h4>${title}</h4>${inner}</section>`;
const routes = (...rs) => blk('동선 · 길찾기', `<ol class="routes">${rs.join('')}</ol>`);
const spots = keys => `<ul class="spots" aria-label="장소 검색">` +
  keys.map(k => `<li>${ext(searchUrl(k), esc(short(k)))}</li>`).join('') + '</ul>';

const INC = ' <span class="tag">포함</span>';
const NEW = '';  // '변경' 이력 태그는 표시하지 않음
const note = (kind, t) => `<p class="note ${kind}">${t}</p>`;
const flow = (...xs) => '<ol class="flow" aria-label="투어 순서">' + xs.map(x => `<li>${x}</li>`).join('') + '</ol>';
// [시간, 내용, 'opt'(선택)]
const sched = rows => blk('시간표', '<ol class="sched">' +
  rows.map(([a, b, opt]) => `<li${opt ? ' class="opt"' : ''}><span class="mono">${a}</span><span>${b}${opt ? ' <span class="tag opt">선택</span>' : ''}</span></li>`).join('') + '</ol>');
// 식사: '포함'이 들어가면 강조, '예약'이 들어가면 예약 색
const meals = list => `<ul class="meals" aria-label="식사">` +
  list.map(m => `<li class="${/포함/.test(m) ? 'inc' : /예약/.test(m) ? 'bk' : ''}">${esc(m)}</li>`).join('') + '</ul>';

// ---------- 꼭 지킬 것 (고정 일정) ----------
// status: ok 확정 · tbd 미정(바우처·답변 대기) · book 예약 필요(체크박스)
const STATUS = { ok: '확정', tbd: '미정', book: '예약 필요' };
const KIND = { stay: '숙소', move: '교통', tour: '투어', book: '예약', ticket: '입장' };
const fx = (time, kind, label, o = {}) => ({ time, kind, label, status: 'ok', ...o });
const allFixed = [];   // 모아보기용

function fixedItem(f, iso) {
  const hm = /^\d{2}:\d{2}/.exec(f.time);
  const at = hm ? ` data-at="${iso}T${hm[0]}"` : '';
  let map = '';
  if (f.dir) map = ext(dirUrl(...f.dir), '길찾기 <span aria-hidden="true">↗</span>', 'fx-map');
  else if (f.place) map = ext(searchUrl(f.place), '지도 <span aria-hidden="true">↗</span>', 'fx-map');
  const hereTo = f.here === null ? null : (f.here || (f.dir ? f.dir[1] : f.place));
  const hereMode = f.hereMode || (f.dir && f.dir[2] === 'walking' ? 'walking' : 'transit');
  const here = hereTo ? `<a class="fx-here" href="${esc(hereUrl(hereTo, hereMode))}" target="_blank" rel="noopener" aria-label="내 위치에서 ${esc(short(hereTo))}까지 길찾기">${PIN}여기서 가기</a>` : '';
  const check = f.status === 'book'
    ? `<label class="fx-check"><input type="checkbox" data-check="${f.id}"><span>예약함</span></label>` : '';
  return `<li class="fx s-${f.status}"${at}>` +
    `<span class="fx-time${hm ? ' mono' : ''}">${esc(f.time === '미정' ? '시간 미정' : f.time)}</span>` +
    `<div class="fx-main"><p class="fx-label"><span class="fx-kind k-${f.kind}">${KIND[f.kind]}</span>${esc(f.label)}</p>` +
    (f.note ? `<p class="fx-note">${esc(f.note)}</p>` : '') + `</div>` +
    `<div class="fx-side"><span class="pill ${f.status}">${STATUS[f.status]}</span>${map}${here}${check}</div></li>`;
}
const fixedList = (items, iso) => `<ul class="fixed" aria-label="꼭 지킬 것">${items.map(f => fixedItem(f, iso)).join('')}</ul>`;

// 날짜 → ISO (12월은 2026, 1월은 2027)
const isoOf = d => { const [m, dd] = d.split('/').map(Number); return `${m === 12 ? 2026 : 2027}-${String(m).padStart(2, '0')}-${String(dd).padStart(2, '0')}`; };
const seenIds = new Set();

// ---------- 일몰 시간 (NOAA 근사식, 오차 1~2분, 중부유럽 겨울 UTC+1) ----------
const rad = x => x * Math.PI / 180, deg = r => r * 180 / Math.PI;
function sunTime(iso, lat, lng, zenith) {
  const [y, m, dd] = iso.split('-').map(Number);
  const N = Math.round((Date.UTC(y, m - 1, dd) - Date.UTC(y, 0, 0)) / 864e5);
  const lngHour = lng / 15, t = N + (18 - lngHour) / 24;
  const M = 0.9856 * t - 3.289;
  let L = (M + 1.916 * Math.sin(rad(M)) + 0.020 * Math.sin(rad(2 * M)) + 282.634) % 360; if (L < 0) L += 360;
  let RA = deg(Math.atan(0.91764 * Math.tan(rad(L)))) % 360; if (RA < 0) RA += 360;
  RA = (RA + (Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90)) / 15;
  const sinDec = 0.39782 * Math.sin(rad(L)), cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(rad(zenith)) - sinDec * Math.sin(rad(lat))) / (cosDec * Math.cos(rad(lat)));
  const T = deg(Math.acos(cosH)) / 15 + RA - 0.06571 * t - 6.622;
  let local = (T - lngHour + 1) % 24; if (local < 0) local += 24;
  const mins = Math.round(local * 60);
  return String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0');
}
const SUN_CITY = {
  prague:   { ko: '프라하', lat: 50.0875, lng: 14.4214 },
  krumlov:  { ko: '체스키크룸로프', lat: 48.8109, lng: 14.3152 },
  salzburg: { ko: '잘츠부르크', lat: 47.8095, lng: 13.0550 },
  vienna:   { ko: '비엔나', lat: 48.2082, lng: 16.3738 },
  budapest: { ko: '부다페스트', lat: 47.4979, lng: 19.0402 },
};
// 그날 해 질 무렵 있을 도시
const SUN_AT = { '12/21': 'prague', '12/22': 'prague', '12/23': 'prague', '12/24': 'krumlov', '12/25': 'salzburg',
  '12/26': 'vienna', '12/27': 'vienna', '12/28': 'vienna', '12/29': 'budapest', '12/30': 'budapest', '12/31': 'budapest' };
const SUN_ICON = '<svg class="sun-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 6.5V9M5.4 9.9l1.7 1.7M18.6 9.9l-1.7 1.7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
function sunInfo(d) {
  const c = SUN_CITY[SUN_AT[d]]; if (!c) return null;
  const iso = isoOf(d);
  return { set: sunTime(iso, c.lat, c.lng, 90.833), dusk: sunTime(iso, c.lat, c.lng, 96), city: c.ko };
}

// fixed: 꼭 지킬 것 / body: 항상 보이는 내용 / notes·places: '더보기' / recs: '추천 더보기' / stay: 그날 밤 숙소
// where: 그날 도시 / meal: 식사 목록
function day(c, n, d, w, title, { where = '', meal = [], tags = '', fixed = [], body = '', notes = '', places = [], recs = [], stay = null } = {}) {
  let id = 'd' + d.replace('/', '');
  while (seenIds.has(id)) id += 'b';
  seenIds.add(id);
  const iso = isoOf(d);
  if (fixed.length) allFixed.push({ id, iso, n, d, w: w.split(' · ')[0], c, items: fixed });
  let stayHtml = '';
  const TAXI_KEYS = ['adria', 'oldinn', 'leonardo', 'nemzeti'];
  if (stay) stayHtml = `<p class="stay"><svg class="stay-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18V7M3 14h18v4M21 14v-2.5A2.5 2.5 0 0 0 18.5 9H11v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="11" r="1.8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg><span class="sl">오늘 밤</span>${P[stay] ? ext(searchUrl(stay), esc(short(stay))) : esc(stay)}` +
    (P[stay] ? `<a class="stay-here" href="${esc(hereUrl(stay, 'transit'))}" target="_blank" rel="noopener" aria-label="내 위치에서 ${esc(short(stay))}까지 길찾기">${PIN}호텔로</a>` : '') +
    (TAXI_KEYS.includes(stay) ? `<button type="button" class="taxi-btn" data-taxi="${stay}">택시에 보여주기</button>` : '') + `</p>`;
  let more = '';
  if (notes) {
    more += `<details class="more"><summary>메모</summary><div class="more-body">${notes}</div></details>`;
  }
  if (recs.length) {
    more += `<details class="more recs"><summary>추천 더보기 ${recs.length}곳</summary><ul class="rec-list">` +
      recs.map(k => `<li><span class="rec-type">${esc(P[k][3])}</span><div>${ext(searchUrl(k), esc(short(k)))}<small>${esc(P[k][4].replace(/^추천 · /, ''))}</small></div></li>`).join('') +
      `</ul></details>`;
  }
  const metaBits = [];
  const timed = fixed.filter(x => /^\d{2}:\d{2}/.test(x.time));
  timed.forEach(x => metaBits.push(`${x.time.slice(0, 5)} ${x.tag || KIND[x.kind]}`));
  const books = fixed.filter(x => x.status === 'book').length;
  if (books) metaBits.push(`예약 ${books}`);
  fixed.filter(x => x.kind === 'tour' && x.status === 'tbd' && !/^\d{2}:\d{2}/.test(x.time))
    .forEach(x => metaBits.push(`${x.tag || '투어'} 시간 미정`));
  // 일몰: 밤에 도착하는 카드(부다페스트 12/28)는 빼고
  const sun = (c === 'hu' && d === '12/28') ? null : sunInfo(d);
  if (sun) metaBits.push(`일몰 ${sun.set}`);
  const sunHtml = sun ? `<p class="sun">${SUN_ICON}<span>일몰 <b class="mono">${sun.set}</b>` +
    `<span class="sun-dusk"> · <span class="mono">${sun.dusk}</span>까지 하늘이 밝아요</span></span><span class="sun-city">${sun.city}</span></p>` : '';

  const hasBody = fixed.length || body || meal.length || stay || more;
  const sum = `<span class="date" aria-hidden="true"><span class="n">${n}</span><span class="d">${d}</span><span class="w">${w}</span></span>` +
    `<span class="day-where">${esc(where)}</span>` +
    `<h3 class="title"><span class="sr-only">${n} ${d} ${w}, </span>${title}${tags}</h3>` +
    (metaBits.length ? `<span class="day-meta">${metaBits.join(' · ')}</span>` : '');
  const inner = sunHtml + (meal.length ? meals(meal) : '') +
    (fixed.length ? blk('꼭 지킬 것', fixedList(fixed, iso)) : '') + `${body}${stayHtml}${more}`;
  return `<li><article class="day ${c}" id="${id}" data-date="${iso}">` +
    (hasBody
      ? `<details class="day-d"><summary class="day-sum">${sum}<span class="chev" aria-hidden="true"></span></summary><div class="body">${inner}</div></details>`
      : `<div class="day-sum static">${sum}</div>`) +
    `</article></li>`;
}
const cz = (...a) => day('cz', ...a), at = (...a) => day('at', ...a), hu = (...a) => day('hu', ...a);

const CZ = [
  cz('DAY 1', '12/21', '월', '인천 출발, 프라하 도착', { where: '프라하', meal: ['석식 자유'],
    fixed: [fx('미정', 'move', '프라하 공항 도착', { here: null, status: 'tbd', place: 'prg_air', note: '편명·도착 시간을 바우처 후 추가' }),
            fx('도착 후', 'tour', '공항 픽업 (한인 기사)', { here: null, tag: '픽업', status: 'tbd', dir: ['prg_air', 'adria', 'driving'], note: '입국 지연 시 기사 대기 여부 확인 중' }),
            fx('체크인', 'stay', 'Hotel Adria', { status: 'tbd', place: 'adria', note: '예상 호텔, 바우처로 확정' })],
    body: note('warn', '<b>EES 첫 등록:</b> 입국 때 지문·얼굴 등록으로 줄이 길 수 있어요. 기사님께 늦어질 수 있다고 미리 알려두세요.') +
      routes(route('adria', 'oldtown', 'walking', { label: '호텔 → 구시가지 광장 크리스마스 마켓' })),
    places: ['adria', 'oldtown'], stay: 'adria' }),
  cz('DAY 2', '12/22', '화', '프라하 전일 시내투어', { tags: INC, where: '프라하', meal: ['조식 호텔', '중식 포함 · 체코식 (음료 1잔)', '석식 자유'],
    fixed: [fx('미정', 'tour', '프라하 전일 시내투어', { status: 'tbd', note: '미팅 시간·장소를 바우처로 확인 · 늦으면 환불 안 돼요' })],
    body: flow('프라하성 내부·성비투스·구왕궁', '황금소로', '스트라호프 수도원', '체코식 중식', '까를교', '구시가지 광장', '천문시계탑 전망대', '시민회관·화약탑', '바츨라프 광장') +
      routes(route('castle', 'wenceslas', 'walking', { via: ['charles', 'clock', 'powder'], label: '프라하성 → 까를교 → 천문시계 → 화약탑 → 바츨라프 광장' })),
    notes: note('tip', '투어 동선은 가이드가 안내해요. 위 경로는 위치 감 잡기용이에요.') + note('tip', '<b>천문시계탑 전망대 입장권은 원하는 시간에 자유 입장</b>이에요. 해 지는 오후 4시 전후가 가장 예뻐요. 23일 일몰 때 써도 돼요.'),
    places: ['castle', 'strahov', 'charles', 'clock', 'powder', 'wenceslas'], stay: 'adria' }),
  cz('DAY 3', '12/23', '수', '프라하 자유일정', { where: '프라하', meal: ['조식 호텔', "중식 자유 ('현지식' 표기 확인 중)", '석식 예약 · 테라사'],
    fixed: [fx('저녁', 'book', '테라사 우 즐라테 스투드녜 디너', { status: 'book', id: 'r-terasa', place: 'terasa', note: '전망 디너, 예약 필수 · 안 되면 Lokál Dlouhá' })],
    body: routes(route('adria', 'vysehrad', 'transit', { label: '오전 · 호텔 → 비셰흐라드 (지하철 C선)' }),
                 route('vysehrad', 'louvre', 'transit', { label: '점심 · 비셰흐라드 → 카페 루브르' }),
                 route('louvre', 'kampa', 'walking', { via: ['theatre'], label: '오후 · 카페 루브르 → 국민극장 → 레기교 → 캄파 섬' }),
                 route('kampa', 'clock', 'walking', { label: '일몰 · 캄파 섬 → 천문시계탑 전망대' }),
                 route('clock', 'terasa', 'walking', { label: '저녁 · 천문시계 → 테라사 우 즐라테 스투드녜' }),
                 route('terasa', 'adria', 'transit', { label: '귀가 · 레스토랑 → 호텔' })),
    notes: note('warn', "일정표 중식 '현지식' 표기는 오기로 보여요. 포함 여부 확인이 필요해요."),
    places: ['vysehrad', 'louvre', 'kampa', 'clock', 'terasa', 'lokal'],
    recs: ['savoy', 'slavia', 'dancing', 'klementinum', 'ufleku', 'letna'], stay: 'adria' }),
  cz('DAY 4', '12/24', '목 · 이브', '체스키크룸로프 차량투어, 체스키 1박', { tags: INC + NEW, where: '프라하 → 체스키크룸로프', meal: ['조식 호텔', '중식 포함 · 중세식 (음료 1잔)', '석식 예약 · Oldinn'],
    fixed: [fx('미정', 'tour', '체스키크룸로프 차량투어 (프라하 출발)', { here: null, status: 'tbd', dir: ['adria', 'oldinn', 'driving'], note: '미팅 시간 · 짐을 Oldinn까지 옮겨주는지 확인 · 늦으면 환불 안 돼요' }),
            fx('체크인', 'stay', 'Hotel Oldinn', { status: 'tbd', place: 'oldinn', note: '픽스 요청, 바우처로 확정' }),
            fx('저녁', 'book', 'Oldinn 레스토랑 이브 디너', { status: 'book', id: 'r-oldinn', place: 'oldinn', note: '이브라 다른 식당은 일찍 닫아요' })],
    body: flow('체스키크룸로프 성', '이발사의 다리', '에곤 쉴레 갤러리 (외관)', '망토다리', '스보르노스티 광장', '세미나르니 정원', '중세식 중식') +
      routes(route('oldinn', 'oldinn', 'walking', { via: ['ckcastle', 'seminar', 'barber'], label: '저녁 산책 · 호텔 → 성 → 세미나르니 정원 → 이발사의 다리 → 호텔' })),
    notes: note('warn', '<b>성 내부·성탑은 12/24·25 휴관일 가능성이 높아요</b> (작년 기준). 투어는 성 외관·정원 위주일 수 있으니 여행사에 확인하세요.') +
      note('tip', '<b>관광객이 빠진 저녁 마을</b>을 둘이서 걸어보세요. 조명 켜진 성과 강변이 이번 여행에서 가장 조용한 밤이 될 거예요.'),
    places: ['oldinn', 'ckcastle', 'seminar', 'barber'], stay: 'oldinn' }),
];

const AT = [
  at('DAY 5', '12/25', '금 · 성탄', '체스키 → 잘츠부르크 반나절 → 비엔나', { tags: NEW, where: '체스키 → 잘츠부르크 → 비엔나', meal: ['조식 호텔', '점심 돔 광장 마켓', '저녁 잘츠부르크에서'],
    fixed: [fx('09:20', 'move', '셔틀 체스키 → 잘츠부르크 중앙역', { tag: '셔틀', status: 'tbd', dir: ['oldinn', 'shuttle', 'walking'], note: '탑승: 관광안내소 앞 (같은 광장) · 성탄절 운행 확정 대기' }),
            fx('18:00~19:30', 'move', '잘츠부르크 → 비엔나 열차', { here: 'szghbf', tag: '비엔나행 열차', status: 'tbd', dir: ['szghbf', 'westbf', 'train'], note: '정확한 시간은 티켓으로 · 서역 도착편 요청 중' }),
            fx('도착 후', 'stay', 'Leonardo Westbahnhof', { place: 'leonardo', note: '서역에서 도보 2분' })],
    body: note('warn', '<b>성탄절이라 비엔나 도착(21~22시) 후엔 문 연 식당이 거의 없어요.</b> 저녁은 잘츠부르크에서 해결하거나 마켓·역에서 사 가세요.') +
      sched([
      ['08:30', '체스키 아침 산책', 'opt'],
      ['09:20', '셔틀 탑승: 관광안내소 앞 (nám. Svornosti 2)'],
      ['12:20', '잘츠부르크 중앙역 하차, 락커 보관'],
      ['12:40', '미라벨 정원 → 마카르트 다리'],
      ['13:10', '돔 광장 크리스마스 마켓 점심 (25일 11~18시)'],
      ['14:00', '게트라이데 거리 → 대성당'],
      ['14:00', '모차르트 생가 내부 (성탄 운영 미확인)', 'opt'],
      ['14:30', '장크트 페터 수도원·묘지', 'opt'],
      ['15:00', `푸니쿨라로 호헨잘츠부르크성, 일몰 ${sunInfo('12/25').set}경`],
      ['16:30', '마켓에서 간식·이른 저녁 / 논베르크 수도원은 선택', 'opt'],
      ['17:15', '역 도착, 짐 찾기 (열차 45분 전)'],
      ['18:00', '비엔나행 열차 (18:00~19:30 사이, 발권 후 확정)']]) +
      routes(route('shuttle', 'szghbf', 'driving', { here: 'shuttle', hereMode: 'walking', label: '09:20 · 셔틀 체스키 → 잘츠부르크 중앙역 (도로 경로 참고)' }),
             route('szghbf', 'domplatz', 'walking', { via: ['mirabell', 'makartsteg'], label: '12:40 · 중앙역 → 미라벨 → 마카르트 다리 → 돔 광장' }),
             route('domplatz', 'festungsbahn', 'walking', { via: ['mozart', 'dom'], label: '14:00 · 돔 광장 → 게트라이데 거리 → 대성당 → 성 푸니쿨라' }),
             route('festung', 'szghbf', 'transit', { label: '16:30 · 성 → 중앙역 (버스 · 추우면 택시)' }),
             route('szghbf', 'westbf', 'train', { label: '18:00 · 잘츠부르크 → 비엔나 열차' }),
             route('westbf', 'leonardo', 'walking', { label: '도착 · 서역 → 호텔' })),
    notes: note('tip', '<b>빠듯하면 줄일 순서:</b> 논베르크 → 장크트 페터 → 모차르트 생가 내부. 미라벨·구시가지·성 일몰 세 가지만 지켜도 충분해요.') +
      note('tip', '<b>셔틀이 13시 넘어 도착하면</b> 미라벨을 건너뛰고 바로 구시가지로 가세요. <b>열차가 19:30이면</b> 1시간 여유가 생기니 장크트 페터 슈티프츠쿨리나리움에서 이른 저녁(예약)도 가능해요.') +
      note('tip', '시티패스 없이 성(€16.5, 푸니쿨라 포함)과 모차르트 생가(€13, 선택)만 현장 구매. 성이 휴관이면 묀히스베르크 엘리베이터로 바꾸세요.'),
    places: ['shuttle', 'szghbf', 'mirabell', 'domplatz', 'mozart', 'dom', 'stpeter', 'festung', 'nonnberg', 'tomaselli', 'moench'], stay: 'leonardo' }),
  at('DAY 6', '12/26', '토 · 공휴일', '비엔나 시내 가이드투어', { tags: INC, where: '비엔나', meal: ['조식 호텔', '소시지·비엔나 커피 시음 포함', '석식 자유'],
    fixed: [fx('미정', 'tour', '비엔나 시내 가이드투어 (쇤부른 포함)', { status: 'tbd', place: 'stephans', note: '미팅 시간·장소를 바우처로 확인 · 늦으면 환불 안 돼요' })],
    body: flow('슈테판 대성당', '그라벤·성 페터 성당', '미카엘 광장·콜마르크트', '호프부르크 왕궁·영웅광장', '국립오페라하우스', '소시지·커피 시음', '쇤부른 궁전 (40개 방, 패스트트랙)', '글로리에떼 전망') +
      routes(route('leonardo', 'stephans', 'transit', { label: '호텔 → 슈테판 대성당 (미팅 장소에 따라 변경)' }),
             route('schoen', 'leonardo', 'transit', { label: '투어 후 · 쇤부른 → 호텔' })),
    notes: note('tip', '투어가 쇤부른에서 끝나고 <b>오후는 자유시간</b>이에요. 궁전 앞 크리스마스 마켓(1/6까지)을 바로 구경하세요.'),
    places: ['stephans', 'oper', 'schoen'], stay: 'leonardo' }),
  at('DAY 7', '12/27', '일', '비엔나 자유일정', { where: '비엔나', meal: ['조식 호텔', '석식 예약 · 피글뮐러'],
    fixed: [fx('저녁', 'book', '피글뮐러 슈니첼 디너', { status: 'book', id: 'r-figl', place: 'figl', note: '안 되면 플라후타 (타펠슈피츠)' })],
    body: note('warn', '일요일이라 상점 대부분이 쉬어요. 미술관·카페 위주로 다니세요.') +
      routes(route('leonardo', 'sperl', 'transit', { label: '10:00 · 호텔 → 카페 슈페를 (일요일 10시 오픈)' }),
             route('sperl', 'belvedere', 'transit', { label: '오전 · 카페 슈페를 → 벨베데레 궁전' }),
             route('belvedere', 'stephans', 'transit', { label: '오후 · 벨베데레 → 슈테판 대성당' }),
             route('stephans', 'figl', 'walking', { label: '저녁 · 슈테판 대성당 → 피글뮐러' }),
             route('figl', 'leonardo', 'transit', { label: '귀가 · 피글뮐러 → 호텔' })),
    places: ['sperl', 'belvedere', 'stephans', 'figl', 'plachutta'],
    recs: ['khm', 'albertina', 'sisi', 'central', 'demel', 'sacher'], stay: 'leonardo' }),
  at('DAY 8', '12/28', '월', '비엔나 자유시간 → 부다페스트', { where: '비엔나 → 부다페스트', meal: ['조식 호텔', '저녁은 열차 타기 전에'],
    fixed: [fx('체크아웃', 'stay', 'Leonardo 체크아웃, 짐 맡기기', { place: 'leonardo', note: '레이트 체크아웃 30유로 · 짐 보관 가능 여부 확인' }),
            fx('19:40~20:40', 'move', '비엔나 → 부다페스트 열차', { here: 'wienhbf', tag: '부다행 열차', status: 'tbd', dir: ['wienhbf', 'keleti', 'train'], note: '출발역·시간은 티켓으로 (중앙역 예상)' })],
    body: routes(route('leonardo', 'naschmarkt', 'transit', { label: '오전 · 호텔 → 나슈마르크트' }),
                 route('naschmarkt', 'riesenrad', 'transit', { label: '오후 · 나슈마르크트 → 프라터 대관람차' }),
                 route('riesenrad', 'leonardo', 'transit', { label: '짐 찾으러 · 프라터 → 호텔' }),
                 route('leonardo', 'wienhbf', 'driving', { label: '저녁 · 호텔 → 비엔나 중앙역 (택시 추천)' })),
    places: ['naschmarkt', 'riesenrad', 'wienhbf'], recs: ['karlskirche', 'sacher'] }),
];

const HU = [
  hu('DAY 8', '12/28', '밤 도착', '부다페스트 도착', { where: '부다페스트',
    fixed: [fx('22:20~23:20', 'stay', 'Hotel Nemzeti 체크인', { hereMode: 'driving', tag: '호텔 도착', status: 'tbd', dir: ['keleti', 'nemzeti', 'driving'], note: '예상 호텔 · 늦은 도착 미리 알리기' })],
    body: routes(route('keleti', 'nemzeti', 'driving', { label: '켈레티역 → 호텔 (택시·Bolt, 또는 M2 한 정거장)' })),
    places: ['keleti', 'nemzeti'], stay: 'nemzeti' }),
  hu('DAY 9', '12/29', '화', '낮엔 페스트 강변, 저녁 야경 스냅', { tags: INC, where: '부다페스트', meal: ['조식 호텔', '점심 중앙시장 (추천)', '석식 자유'],
    fixed: [fx('일몰 무렵', 'tour', '야경 투어 스냅 (2시간)', { tag: '스냅', status: 'tbd', place: 'chain', note: '미팅 장소·시간은 일몰 기준, 바우처 확인 · 스냅용 옷 · 늦으면 환불 안 돼요' })],
    body: flow('세체니 다리 (부다성 배경)', '국회의사당 맞은편', '어부의 요새') +
      note('tip', '전날 밤늦게 도착하니 오전은 느긋하게. 낮 코스는 <b>추천</b>이라 컨디션 따라 빼도 돼요.') +
      routes(route('nemzeti', 'market', 'transit', { label: '추천 · 점심 · 호텔 → 중앙시장 (랑고시)' }),
             route('market', 'parliament', 'transit', { label: '추천 · 오후 · 중앙시장 → 국회의사당 (2번 트램 강변)' }),
             route('parliament', 'shoes', 'walking', { label: '추천 · 국회의사당 → 신발 기념비' }),
             route('nemzeti', 'chain', 'transit', { label: '스냅 · 호텔 → 세체니 다리 (미팅 장소에 따라 변경)' }),
             route('bastion', 'nemzeti', 'transit', { label: '스냅 후 · 어부의 요새 → 호텔' })),
    notes: note('tip', '스냅은 <b>1차 보정 원본 200장 + 정밀 보정 2장</b>을 받아요. 음료·대중교통·입장료는 따로예요.'),
    places: ['chain', 'batthyany', 'bastion'], recs: ['market', 'parliament', 'shoes'], stay: 'nemzeti' }),
  // 동선: 부다 언덕(오전) → 강 건너 시내 중심(점심·마켓·대성당) → 호텔 쪽(저녁). 한 방향으로만 이동
  hu('DAY 10', '12/30', '수', '부다페스트 자유일정', { where: '부다페스트', meal: ['조식 호텔', '점심 제르보 (마켓 바로 앞)', '석식 예약 · 뉴욕 카페'],
    fixed: [fx('저녁', 'book', '뉴욕 카페', { status: 'book', id: 'r-newyork', place: 'newyork', note: '예약하면 줄 안 서요' })],
    body: routes(route('nemzeti', 'funicular', 'transit', { label: '오전 · 호텔 → 부다성 푸니쿨라' }),
                 route('funicular', 'bastion', 'walking', { via: ['matthias'], label: '부다성 → 마차시 성당 → 어부의 요새 (낮)' }),
                 route('bastion', 'gerbeaud', 'transit', { label: '점심 · 어부의 요새 → 제르보 (강 건너 시내)' }),
                 route('gerbeaud', 'vorosmarty', 'walking', { label: '오후 · 제르보 → 뵈뢰스마르티 마켓 (바로 앞 광장)' }),
                 route('vorosmarty', 'basilica', 'walking', { label: '17:30 · 마켓 → 성 이슈트반 대성당 조명 쇼' }),
                 route('basilica', 'newyork', 'transit', { label: '저녁 · 대성당 → 뉴욕 카페' }),
                 route('newyork', 'nemzeti', 'walking', { label: '귀가 · 뉴욕 카페 → 호텔' })),
    notes: note('tip', '점심을 시내 중심(제르보)으로 옮겨서 부다 언덕 → 시내 → 호텔 쪽으로 한 방향으로만 움직여요. 헝가리 전통 요리가 먹고 싶으면 호텔 근처 로젠슈타인을 다른 날 저녁 대안으로 두세요.'),
    places: ['funicular', 'bastion', 'gerbeaud', 'vorosmarty', 'basilica', 'newyork'],
    recs: ['rosenstein', 'synagogue', 'szimpla'], stay: 'nemzeti' }),
  hu('DAY 11', '12/31', '목', '세체니 온천 → 공항', { tags: INC, where: '부다페스트 → 인천', meal: ['조식 호텔'],
    fixed: [fx('오전', 'ticket', '세체니 온천 (패스트트랙 · 전용 탈의실)', { place: 'szechenyi', note: '연말 운영시간 확인 · 수영복·슬리퍼' }),
            fx('출발 3:30 전', 'book', '호텔 → 공항 이동', { hereMode: 'driving', status: 'book', id: 'r-airport', dir: ['nemzeti', 'bud_air', 'driving'], note: '패키지 미포함 · 연말이라 미리 예약' }),
            fx('미정', 'move', '부다페스트 → 인천 항공', { here: null, status: 'tbd', place: 'bud_air', note: '편명·출발 시간 바우처 후 추가' })],
    body: note('warn', '<b>출국에도 EES 등록</b>이 있고 연말이라 붐벼요. 항공 출발 <b>3시간 30분 전</b> 공항 도착을 목표로 온천 시간을 거꾸로 계산하세요.') +
      routes(route('nemzeti', 'szechenyi', 'transit', { label: '오전 · 호텔 → 세체니 온천' }),
             route('szechenyi', 'nemzeti', 'transit', { label: '짐 찾으러 · 온천 → 호텔' })),
    places: ['szechenyi', 'bud_air'], stay: '기내 1박' }),
  hu('DAY 12', '1/1', '금', '인천 도착', { where: '인천' }),
];

const section = (cls, title, nights, days) =>
  `<section class="city ${cls}" aria-labelledby="city-${cls}"><div class="city-head"><h2 id="city-${cls}">${title}</h2><span class="nights">${nights}</span></div>` +
  `<ol class="days">${days.join('')}</ol></section>\n`;


// 꼭 지킬 일정 모아보기
const flat = allFixed.flatMap(g => g.items);
const cnt = s => flat.filter(f => f.status === s).length;
const fixedAll = `<section class="sec fixed-all" aria-labelledby="fixedAllTitle"><details class="card">` +
  `<summary><span class="fa-head"><h2 id="fixedAllTitle">꼭 지킬 일정</h2>` +
  `<span class="fa-count"><span class="pill ok">확정 ${cnt('ok')}</span><span class="pill tbd">미정 ${cnt('tbd')}</span><span class="pill book">예약 필요 <span data-book-count>${cnt('book')}</span></span></span></span></summary>` +
  `<p class="hint">숙소·교통·투어·예약처럼 시간을 꼭 지켜야 하는 것만 모았어요. 투어는 늦으면 환불이 안 되니 미팅 10분 전에 도착하세요.</p>` +
  `<ol class="fa-days">` + allFixed.map(g =>
    `<li class="fa-day ${g.c}"><h3><a href="#${g.id}"><span class="mono">${g.d}</span> ${g.w} <span class="fa-n">${g.n}</span></a></h3>${fixedList(g.items, g.iso)}</li>`).join('') +
  `</ol></details></section>\n`;

const generated = '<!-- DAYS -->\n' + fixedAll +
  section('cz', '프라하 · 체스키크룸로프', '12/21 – 12/25 · 3박 + 1박 · 체코', CZ) +
  section('at', '잘츠부르크 · 비엔나', '12/25 – 12/28 · 반나절 + 3박 · 오스트리아', AT) +
  section('hu', '부다페스트', '12/28 – 12/31 · 3박 · 헝가리', HU) +
  '<!-- /DAYS -->';

const file = path.join(ROOT, 'index.html');
let src = fs.readFileSync(file, 'utf8');
const a = src.indexOf('<!-- DAYS -->'), b = src.indexOf('<!-- /DAYS -->');
if (a < 0 || b < 0) throw new Error('index.html 에 <!-- DAYS --> / <!-- /DAYS --> 표시가 없어요');
src = src.slice(0, a) + generated + src.slice(b + '<!-- /DAYS -->'.length);
fs.writeFileSync(file, src, 'utf8');

const cell = v => /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
const rows = [['이름', '주소', '날짜', '종류', '메모', '구글맵'],
  ...Object.keys(P).map(k => [...P[k], searchUrl(k)])];
fs.writeFileSync(path.join(ROOT, 'data/honeymoon_places.csv'), rows.map(r => r.map(cell).join(',')).join('\r\n') + '\r\n', 'utf8');

console.log('places', Object.keys(P).length, 'routes', (generated.match(/class="rt"/g) || []).length, 'days', seenIds.size, 'fixed', flat.length, `(ok ${cnt('ok')} / tbd ${cnt('tbd')} / book ${cnt('book')})`);
