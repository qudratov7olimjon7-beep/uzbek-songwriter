// Uzbek Songwriter qoʻshiq generatori. Yagona kirish nuqtasi: generateSong(prompt).
// Keyinchalik AI API bilan almashtirish uchun faqat shu funksiyani qayta yozing.

const CYR = {а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"j",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"x",ц:"ts",ч:"ch",ш:"sh",щ:"sh",ъ:"ʼ",ы:"i",ь:"",э:"e",ю:"yu",я:"ya",ў:"oʻ",қ:"q",ғ:"gʻ",ҳ:"h"};

// Yangi alifbodagi (ö, ğ, ş, ç) va oddiy apostrofli (o', g') yozuvni
// joriy lotin alifbosiga keltiradi: oʻ, gʻ, sh, ch, ʼ.
export function toStandardLatin(text) {
  return String(text)
    .replace(/Ö/g, "Oʻ").replace(/ö/g, "oʻ").replace(/Ğ/g, "Gʻ").replace(/ğ/g, "gʻ")
    .replace(/Ş/g, "Sh").replace(/ş/g, "sh").replace(/Ç/g, "Ch").replace(/ç/g, "ch")
    .replace(/([oOgG])[‘’`']/g, "$1ʻ");
}

export function cyrToLatin(text) {
  return [...text].map((ch, i, a) => {
    const low = ch.toLowerCase();
    let r = CYR[low];
    if (r === undefined) return ch;
    if (low === "е" && (i === 0 || /[\s.,!?аоуэияюёўе]/i.test(a[i - 1]))) r = "ye";
    return ch === low ? r : r.charAt(0).toUpperCase() + r.slice(1);
  }).join("");
}

// Mavzular: hayvon, ovqat, oila, maktab, ish, mashina, telefon, havo, sevgi, futbol, toy, bozor
// Format: "uzbekcha|mavzu|soʻz1 soʻz2 ..." (inglizcha, ruscha, oʻzbekcha shakllar)
const DICT_SRC = `
mushuk|hayvon|cat cats kitten кот кошка котик котенок mushuk mushugim mushukcha
it|hayvon|dog dogs puppy собака пёс пес щенок it itim kuchuk
eshak|hayvon|donkey осёл осел ишак eshak eshagim
xoʻroz|hayvon|rooster cock петух xoʻroz xoroz
tovuq|hayvon|chicken hen курица tovuq
sigir|hayvon|cow корова sigir
qoʻy|hayvon|sheep lamb овца баран qoʻy qoy
echki|hayvon|goat коза козёл echki
ot|hayvon|horse лошадь конь ot
tuya|hayvon|camel верблюд tuya
sichqon|hayvon|mouse мышь sichqon
toʻti|hayvon|parrot попугай toʻti toti
baliq|hayvon|fish рыба baliq
ayiq|hayvon|bear медведь ayiq
quyon|hayvon|rabbit bunny кролик заяц quyon
maymun|hayvon|monkey обезьяна maymun
fil|hayvon|elephant слон fil
sher|hayvon|lion лев sher
boʻri|hayvon|wolf волк boʻri bori
tulki|hayvon|fox лиса tulki
qurbaqa|hayvon|frog лягушка qurbaqa
kaptar|hayvon|pigeon dove голубь kaptar
ilon|hayvon|snake змея ilon
pingvin|hayvon|penguin пингвин pingvin
hamster|hayvon|hamster хомяк hamster
palov|ovqat|pilaf plov pilau плов palov osh
somsa|ovqat|samosa samsa самса somsa
manti|ovqat|manti dumplings манты manti
lagʻmon|ovqat|lagman noodles лагман лапша lagʻmon lagmon
shashlik|ovqat|kebab barbecue шашлык shashlik
non|ovqat|bread хлеб лепешка non
choy|ovqat|tea чай choy
qovun|ovqat|melon дыня qovun
tarvuz|ovqat|watermelon арбуз tarvuz
olma|ovqat|apple яблоко olma
pizza|ovqat|pizza пицца pitsa
burger|ovqat|burger hamburger бургер гамбургер burger
kartoshka|ovqat|potato fries картошка картофель kartoshka
shokolad|ovqat|chocolate шоколад shokolad
muzqaymoq|ovqat|ice icecream мороженое muzqaymoq
tort|ovqat|cake торт tort
kofe|ovqat|coffee кофе kofe
sut|ovqat|milk молоко sut
tuxum|ovqat|egg eggs яйцо яйца tuxum
goʻsht|ovqat|meat мясо goʻsht gosht
shoʻrva|ovqat|soup суп шурпа shoʻrva shorva
qatiq|ovqat|yogurt kefir кефир катык qatiq
asal|ovqat|honey мёд мед asal
banan|ovqat|banana банан banan
sabzi|ovqat|carrot морковь sabzi
piyoz|ovqat|onion лук piyoz
ovqat|ovqat|food eat dinner lunch breakfast еда есть ужин обед завтрак ovqat yeydi
qaynona|oila|mother-in-law motherinlaw свекровь тёща теща qaynona
ona|oila|mother mom mum mama мама мать ona oyi oyijon
ota|oila|father dad papa папа отец ota dada
buvi|oila|grandma grandmother бабушка buvi buvijon
bobo|oila|grandpa grandfather дедушка дед bobo
aka|oila|brother брат aka uka
opa|oila|sister сестра opa singil
xotin|oila|wife жена xotin ayol
er|oila|husband муж er
bola|oila|child kid baby ребёнок ребенок дети малыш bola
qoʻshni|oila|neighbor neighbour сосед соседка qoʻshni qoshni
oila|oila|family семья oila
amaki|oila|uncle дядя amaki togʻa
xola|oila|aunt тётя тетя xola amma
doʻst|oila|friend friends друг подруга друзья doʻst dost oʻrtoq
maktab|maktab|school школа maktab
oʻqituvchi|maktab|teacher учитель учительница oʻqituvchi ustoz
imtihon|maktab|exam test exams экзамен контрольная imtihon
uy vazifasi|maktab|homework домашка домашнее uyvazifa
matematika|maktab|math maths mathematics математика matematika
kitob|maktab|book книга kitob
talaba|maktab|student студент ученик talaba oʻquvchi
universitet|maktab|university college университет институт universitet
direktor|maktab|principal director директор direktor
baho|maktab|grade mark оценка двойка пятерка baho
ish|ish|work job office работа офис ish
boshliq|ish|boss начальник шеф boshliq
maosh|ish|salary money зарплата деньги maosh pul
dasturchi|ish|programmer developer coder программист dasturchi
shifokor|ish|doctor врач доктор shifokor vrach
oshpaz|ish|cook chef повар oshpaz
haydovchi|ish|driver водитель haydovchi
kompyuter|ish|computer laptop компьютер ноутбук kompyuter
dushanba|ish|monday понедельник dushanba
taksi|mashina|taxi cab такси taksi
mashina|mashina|car cars auto машина авто автомобиль mashina
Damas|mashina|damas дамас damas
Neksiya|mashina|nexia нексия neksiya
Kobalt|mashina|cobalt кобальт kobalt
avtobus|mashina|bus автобус avtobus
velosiped|mashina|bike bicycle велосипед velosiped
probka|mashina|traffic jam пробка probka
benzin|mashina|gas petrol fuel бензин benzin
samolyot|mashina|plane airplane самолёт самолет samolyot
poyezd|mashina|train поезд poyezd
metro|mashina|metro subway метро metro
telefon|telefon|phone smartphone iphone телефон смартфон айфон telefon
Telegram|telefon|telegram телеграм telegram
internet|telefon|internet wifi интернет вайфай internet
selfi|telefon|selfie селфи selfi
TikTok|telefon|tiktok тикток tiktok
Instagram|telefon|instagram инстаграм instagram
zaryadka|telefon|charger battery зарядка батарея zaryadka
oʻyin|telefon|game games игра игры oʻyin oyin
televizor|telefon|tv television телевизор televizor
yomgʻir|havo|rain rainy дождь yomgʻir yomgir
qor|havo|snow снег qor
issiq|havo|hot heat summer жара лето жарко issiq yoz
sovuq|havo|cold winter холод зима холодно sovuq qish
shamol|havo|wind ветер shamol
quyosh|havo|sun sunny солнце quyosh
ob-havo|havo|weather погода obhavo
bahor|havo|spring весна bahor
kuz|havo|autumn fall осень kuz
sevgi|sevgi|love любовь люблю sevgi muhabbat sevaman
yor|sevgi|darling sweetheart girlfriend boyfriend любимая любимый девушка парень yor
kelin|sevgi|bride невеста kelin
kuyov|sevgi|groom жених kuyov
sovchi|sevgi|matchmaker сваха sovchi
gul|sevgi|flower flowers rose цветы роза gul
uchrashuv|sevgi|date свидание uchrashuv
futbol|futbol|football soccer футбол futbol
toʻp|futbol|ball мяч toʻp top
gol|futbol|goal гол gol
darvozabon|futbol|goalkeeper вратарь darvozabon
hakam|futbol|referee судья hakam
Paxtakor|futbol|pakhtakor пахтакор paxtakor
sport|futbol|sport gym спорт качалка sport
toy|toy|wedding party свадьба вечеринка той toy
karnay|toy|trumpet карнай karnay
doira|toy|drum бубен дойра doira
raqs|toy|dance dancing танец танцы raqs oʻyin
tugʻilgan kun|toy|birthday день рождения tugilgankun
bozor|bozor|market bazaar рынок базар bozor
Chorsu|bozor|chorsu чорсу chorsu
savdo|bozor|shopping sale покупки скидка savdo
doʻkon|bozor|shop store магазин doʻkon dokon
narx|bozor|price expensive cheap цена дорого дешево narx qimmat arzon
choyxona|toy|teahouse чайхана choyxona
uyqu|oila|sleep sleeping спать сон uyqu uxlaydi
`;

const DICT = new Map();
for (const line of DICT_SRC.trim().split("\n")) {
  const [uz, theme, words] = line.split("|");
  for (const w of words.split(" ")) DICT.set(toStandardLatin(w.toLowerCase()), { uz, theme });
}

const THEMES = ["hayvon","ovqat","oila","maktab","ish","mashina","telefon","havo","sevgi","futbol","toy","bozor"];

// Har bir band: 4 qator, {X} — asosiy soʻz.
const VERSES = {
  hayvon: [
    ["Bizning {X} juda aqlli, maktabni bitirgan,","Qoʻshnining tovugʻiga ingliz tili oʻrgatgan.","Ertalab turib choy soʻrar, «shakarsiz» deydi,","Kechqurun serialni koʻrib, yigʻlab ham yeydi."],
    ["{X} bozorga borib, savdolashdi rosa,","«Arzonroq ber, aka», dedi, qilmay hech pisanda.","Sotuvchi hayron qoldi, kalkulyator tushdi,","{X} esa chegirma olib, uyiga uchdi."],
    ["Toʻyda {X} chiqib raqsga tushdi zoʻr,","Karnaychilar toʻxtab qoldi, doira ham koʻr.","Kuyov hayron, kelin hayron, mehmonlar qarsak,","Endi har toʻyga {X}ni chaqirsak!"],
  ],
  ovqat: [
    ["Oyim {X} qildi, xushboʻy hidi taraldi,","Butun mahalla eshik oldida navbat saraldi.","Qoʻshni «tuz soʻrab» keldi, qoʻlida lagan,","Ketganda {X}dan qolmadi bir qoshiq ham, inon!"],
    ["Choyxonada oʻtirib {X} haqida bahs,","Kim koʻp yeydi, kim kam yeydi — hammasi qasd.","Ahmad aka oʻn tarelka, Bahrom aka oʻn bir,","Ofitsiant qochib ketdi — qolmadi unda sabr."],
    ["Dietaga oʻtdim deb, ertalab qasam ichdim,","Tushda {X} koʻrib qoldim, qasamni unutdim.","Kechqurun tarozi «yordam!» deb baqirdi,","Ertaga dieta, deyman — bu oʻninchi gal edi."],
  ],
  oila: [
    ["Qaynonam keldi bugun, qoʻlida {X},","«Kelinim, choy damla» dedi, «achchiq, ammo shirin!»","Choy damlasam — sovuq, isitsam — kuyib ketdi,","Qaynonam kulib qoʻydi: «Mendan oʻrgan, ketdik!»"],
    ["Bobom aytar: «Bizning davrda {X} boshqa edi,","Oʻn chaqirim piyoda yurib, maktabga yetardi».","Nevaralar soʻradi: «Bobo, taksi yoʻqmidi?»","Bobom jim qoldi-da, sekin choyini ichdi."],
    ["Qoʻshnimiz {X} haqida mahallaga gap tarqatdi,","Ertalab bir bilardi, kechqurun yuz bilardi.","Gap aylanib qaytib keldi, tanimay qoldik,","Oxiri oʻzimiz ham ishonib, hayron boʻldik."],
  ],
  maktab: [
    ["Imtihon kuni ertalab {X} esimga tushdi,","Kitobni ochsam — boʻsh, faqat yurak tushdi.","Ustoz soʻradi: «Javob?» — men dedim: «Ikki!»","Ustoz kuldi: «Toʻgʻri, bahoyingiz ham ikki»."],
    ["Uy vazifasini {X} yeb qoʻydi, ustoz,","Ishonmasangiz — soʻrang, u gapirmas, ammo soz.","Ustoz qoshini koʻtardi, jurnalni ochdi,","Mening ham bahoyim oʻsha zahot qochdi."],
    ["Matematika darsida {X} haqida masala:","«Ikkita {X} bor edi, bittasi ketdi Toshkentga, qarang-a!»","Butun sinf oʻylandi, doskaga qaradi,","Javobni hech kim bilmadi — {X} qaytib keldi-da!"],
  ],
  ish: [
    ["Dushanba ertalab budilnik chalindi,","Men «besh daqiqa» dedim — soat oʻn boʻldi.","Boshliq qoʻngʻiroq qildi: «{X} qayerda?»","Men dedim: «Probkada, ishonavering, axir!»"],
    ["Ishxonada {X} haqida majlis boʻldi uch soat,","Hamma bosh irgʻitdi, hech kim tushunmadi, rost.","Oxirida boshliq soʻradi: «Savol bormi, qani?»","Hamma bir ovozda: «Tushlik qachon, shuni!»"],
    ["Maosh kelgan kuni {X} sotib oldim,","Ertasiga qarasam — kartada hech pul qolmadi.","Xotinim soʻradi: «Pul qani, dadasi?»","Men dedim: «Investitsiya — kelajak boylik asosi!»"],
  ],
  mashina: [
    ["Taksichi aka aytdi: «{X} — mening jonim»,","Radioda qoʻshiq baland, yoʻlga qaramas hech qachon.","Chorsuga ketyapmiz desam, Yunusobodga bordik,","Yoʻl haqini soʻraganda, ikkalamiz ham kuldik."],
    ["Damasga oʻn besh kishi, yana {X} ham mindi,","Haydovchi «surilinglar» deb, oʻzi ham sigʻdi.","Har bekatda bittasi «toʻxtang!» deb qichqirar,","Damas esa kuylab ketar, hech qachon charchamas."],
    ["Probkada uch soat turdik, {X} bilan birga,","Choy damladik, palov qildik, qoʻshiq aytdik bir-bir.","Svetofor yashil boʻldi, hamma joyidan jildi,","Biz esa uxlab qolibmiz — orqadan signal bildi."],
  ],
  telefon: [
    ["Telefonim zaryadi bir foiz qoldi,","Men {X} haqida post yozdim — u oʻchib qoldi.","Butun dunyo bilmay qoldi bu buyuk xabarni,","Ertaga yana yozaman, kutinglar, mehribonlar!"],
    ["Buvim Telegram oʻrnatdi, oʻzi kanal ochdi,","{X} haqida stiker yuborib, guruhni bosdi.","Kuniga yuz «xayrli tong», gullar va kuchuklar,","Endi buvim — bloger, obunachilar quchoqlar!"],
    ["Selfi olay deb {X} bilan suratga tushdim,","Oʻttiz marta urinib, oxiri ariqqa tushdim.","Surat chiqdi zoʻr — hamma «layk» bosdi,","Ariqdagi qurbaqa ham men bilan oʻsdi."],
  ],
  havo: [
    ["Ob-havo dedi: «Bugun quyosh, iliq, soz»,","Men {X} bilan chiqdim — yogʻdi doʻl, qor, muz.","Sinoptik aka, sizga bir savolim bor:","Derazangiz qayoqqa qaragan, oʻzi bormi, yor?"],
    ["Saraton issigʻida {X} ham erib ketdi,","Asfaltda tuxum qovurdik, mahalla yeb ketdi.","Konditsioner soʻradi: «Meni ham bir sovut»,","Biz esa ariq boʻyida — tarvuz bilan umid."],
  ],
  sevgi: [
    ["Sovchilar keldi uyga, qoʻlida {X},","Oyim dedi: «Kuyovning ishi bormi, bilsin!»","Kuyov dedi: «Bloger man, obunachim oʻn ikki»,","Dadam sekin turib ketdi, eshik yopildi tiq-tiq."],
    ["Yorim uchun {X} olib, deraza ostiga bordim,","Qoʻshiq aytdim baland — itlar bilan birga hordim.","Deraza ochildi-yu, chiqdi uning dadasi,","Men qochdim, {X} qoldi — bu sevgi xatosi!"],
  ],
  futbol: [
    ["Mahalla futbolida {X} darvozabon boʻldi,","Toʻp kelsa — choy ichar, gol kirsa — kulib qoldi.","Hisob oʻn-nol boʻlganda u dedi: «Hali erta!»","Biz ham ishondik unga — oʻyin tugadi kech-da."],
    ["Televizor oldida {X} bilan ikkimiz,","Gol kirsa baqiramiz, qoʻshnilar keldi — hammamiz.","Hakamga maslahat berdik, murabbiyga ham reja,","Oʻzimiz-chi, divandan turmay qoldik kecha."],
  ],
  toy: [
    ["Toʻyda karnay chalindi, doira gumburladi,","{X} oʻrtaga chiqib, «lazgi»ga tushib ketdi.","Toʻy egasi hayron: «Bu kim, kim chaqirdi?»","Hech kim bilmas, ammo hamma oshini yeb ketdi."],
    ["Choyxonada osh tortildi, {X} ham keldi,","«Men faqat bir qoshiq» dedi, uch lagan yedi.","Oshpaz aka kulib dedi: «Ana, mehmon zoʻr!»","Ertasiga {X} uchun alohida qozon bor."],
  ],
  bozor: [
    ["Chorsu bozorida {X} narxini soʻradim,","Sotuvchi «yuz ming» dedi, men «oʻn ming» deb turdim.","Bir soat savdolashdik, choy ichdik, doʻst boʻldik,","Oxiri bepul berdi-yu, «yana kel» deb qoʻydi."],
    ["Bozorga ketdim deb, ertalab chiqdim uydan,","{X} topay deb kezdim, oyogʻim qoldi oʻtdan.","Qaytganda qoʻlimda: uch qovun, bir gilam, xoʻroz,","{X}ni-chi? Unutibman — yana ertaga, soz!"],
  ],
};

const CHORUS = [
  ["Voy, {X}, voy, {X}, sen mahalla yulduzi,","Senga qoʻshiq aytamiz kechasi-yu kunduzi!","Doira chal, karnay chal, hamma tursin raqsga,","{X} bilan baxtlimiz — kulgu kerak har kasga!"],
  ["Hey-hey, {X}, yalla-yalla, yor-yor,","Sensiz bu dunyoda yoʻqdir hech qanday zavq, yor.","Choyxonadan bozorgacha — hamma seni sogʻinar,","{X}! {X}! — butun Toshkent chorlar!"],
  ["La-la-lay, {X}, sening-chun bu qoʻshiq,","Kulib-kulib yigʻlaymiz, qorinlar ogʻriydi, oʻrtoq.","Bir kuy, ikki kuy, uch kuy — hammasi senga,","{X} boʻlsa yonimda, gʻam kelmaydi menga!"],
  ["Oh, {X}, ey, {X}, sendan zoʻri yoʻq,","Och boʻlsang ham, toʻq boʻlsang ham — sen bilan dil toʻq.","Qarsak chal, sakra, bir oz ham qiliq qil,","{X} uchun bu kecha — butun mahalla bir dil!"],
];

const TITLES = ["{X} haqida ballada","Voy, {X}!","{X} va mahalla","{X}ning sarguzashtlari","{X} — yulduz","{X} uchun qoʻshiq"];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
const cap = (s) => s.replace(/^([«"]?)(\p{L})/u, (_, q, c) => q + c.toUpperCase());
// Gap boshidagi harfni katta qiladi ("Qaynona! qaynona!" → "Qaynona! Qaynona!").
const capLine = (s) => cap(s).replace(/([.!?]\s+[«"]?)(\p{Ll})/gu, (_, p, c) => p + c.toUpperCase());

// Soʻzni lugʻatdan qidiradi: toʻliq shakl, keyin oʻzak (qoʻshimchalarni kesib).
function lookup(word) {
  for (let len = word.length; len >= 3; len--) {
    const hit = DICT.get(word.slice(0, len));
    if (hit) return hit;
  }
  return null;
}

export function analyzePrompt(prompt) {
  const latin = toStandardLatin(cyrToLatin(prompt.trim()));
  const words = latin.toLowerCase().split(/[^\p{L}'-]+/u).filter(Boolean);
  const raw = prompt.toLowerCase().split(/[^\p{L}-]+/u).filter(Boolean);
  const hits = [];
  for (const w of [...raw, ...words]) {
    const h = lookup(w);
    if (h && !hits.some((x) => x.uz === h.uz)) hits.push(h);
  }
  return { latin, hits };
}

export function generateSong(prompt) {
  const clean = String(prompt || "").trim() || "mushugim palov yeydi";
  const { latin, hits } = analyzePrompt(clean);
  const names = hits.length ? hits.map((h) => h.uz) : [`«${latin.length > 30 ? latin.slice(0, 30) + "…" : latin}»`];
  const themes = [...new Set(hits.map((h) => h.theme))];
  // Avval topilgan mavzular, keyin tasodifiy kulgili mavzular.
  const order = [...shuffle(themes), ...shuffle(THEMES.filter((t) => !themes.includes(t)))];
  const count = 2 + Math.floor(Math.random() * 2);
  const main = names[0];
  const used = new Set();
  const verses = [];
  for (let i = 0; verses.length < count; i++) {
    const v = pick(VERSES[order[i % order.length]]);
    if (used.has(v)) continue;
    used.add(v);
    const name = names[verses.length % names.length];
    verses.push(v.map((l) => capLine(l.replaceAll("{X}", name))));
  }
  const chorus = pick(CHORUS).map((l) => capLine(l.replaceAll("{X}", main)));
  const title = capLine(pick(TITLES).replaceAll("{X}", main));
  return { title, prompt: clean, verses, chorus };
}

export function songToText(song) {
  const parts = [song.title.toUpperCase(), ""];
  song.verses.forEach((v, i) => parts.push(`${i + 1}-band:`, ...v, "", "Naqarot:", ...song.chorus, ""));
  return parts.join("\n").trim();
}
