// Uzbek Songwriter qöşiq generatori. Yagona kirish nuqtasi: generateSong(prompt).
// Keyinchalik AI API bilan almashtirish uchun faqat shu funksiyani qayta yozing.

const CYR = {а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"j",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"x",ц:"ts",ч:"ç",ш:"ş",щ:"ş",ъ:"'",ы:"i",ь:"",э:"e",ю:"yu",я:"ya",ў:"ö",қ:"q",ғ:"ğ",ҳ:"h"};

// Eski lotin yozuvini yangi alifboga ögiradi: oʻ→ö, gʻ→ğ, sh→ş, ch→ç, ʼ→'.
// "s'h" / "c'h" (masalan, Is'hoq) — bu digraf emas, "sh" bölib qoladi.
export function toNewAlphabet(text) {
  return String(text)
    .replace(/([oOgG])[ʻ‘’`']/g, (_, c) => ({ o: "ö", O: "Ö", g: "ğ", G: "Ğ" })[c])
    .replace(/([sScC])[ʼ'’](h)/g, "$1\u0000$2")
    .replace(/S[Hh]/g, "Ş").replace(/sh/g, "ş")
    .replace(/C[Hh]/g, "Ç").replace(/ch/g, "ç")
    .replace(/\u0000/g, "")
    .replace(/[ʼʻ’]/g, "'");
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
// Format: "uzbekcha|mavzu|so'z1 so'z2 ..." (inglizça, rusça, özbekça şakllar)
const DICT_SRC = `
muşuk|hayvon|cat cats kitten кот кошка котик котенок mushuk mushugim mushukcha
it|hayvon|dog dogs puppy собака пёс пес щенок it itim kuchuk
eşak|hayvon|donkey осёл осел ишак eshak eshagim
xöroz|hayvon|rooster cock петух xoʻroz xoroz
tovuq|hayvon|chicken hen курица tovuq
sigir|hayvon|cow корова sigir
qöy|hayvon|sheep lamb овца баран qoʻy qoy
eçki|hayvon|goat коза козёл echki
ot|hayvon|horse лошадь конь ot
tuya|hayvon|camel верблюд tuya
siçqon|hayvon|mouse мышь sichqon
töti|hayvon|parrot попугай toʻti toti
baliq|hayvon|fish рыба baliq
ayiq|hayvon|bear медведь ayiq
quyon|hayvon|rabbit bunny кролик заяц quyon
maymun|hayvon|monkey обезьяна maymun
fil|hayvon|elephant слон fil
şer|hayvon|lion лев sher
böri|hayvon|wolf волк boʻri bori
tulki|hayvon|fox лиса tulki
qurbaqa|hayvon|frog лягушка qurbaqa
kaptar|hayvon|pigeon dove голубь kaptar
ilon|hayvon|snake змея ilon
pingvin|hayvon|penguin пингвин pingvin
hamster|hayvon|hamster хомяк hamster
palov|ovqat|pilaf plov pilau плов palov osh
somsa|ovqat|samosa samsa самса somsa
manti|ovqat|manti dumplings манты manti
lağmon|ovqat|lagman noodles лагман лапша lagʻmon lagmon
şaşlik|ovqat|kebab barbecue шашлык shashlik
non|ovqat|bread хлеб лепешка non
çoy|ovqat|tea чай choy
qovun|ovqat|melon дыня qovun
tarvuz|ovqat|watermelon арбуз tarvuz
olma|ovqat|apple яблоко olma
pizza|ovqat|pizza пицца pitsa
burger|ovqat|burger hamburger бургер гамбургер burger
kartoşka|ovqat|potato fries картошка картофель kartoshka
şokolad|ovqat|chocolate шоколад shokolad
muzqaymoq|ovqat|ice icecream мороженое muzqaymoq
tort|ovqat|cake торт tort
kofe|ovqat|coffee кофе kofe
sut|ovqat|milk молоко sut
tuxum|ovqat|egg eggs яйцо яйца tuxum
göşt|ovqat|meat мясо goʻsht gosht
şörva|ovqat|soup суп шурпа shoʻrva shorva
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
qöşni|oila|neighbor neighbour сосед соседка qoʻshni qoshni
oila|oila|family семья oila
amaki|oila|uncle дядя amaki togʻa
xola|oila|aunt тётя тетя xola amma
döst|oila|friend friends друг подруга друзья doʻst dost oʻrtoq
maktab|maktab|school школа maktab
öqituvçi|maktab|teacher учитель учительница oʻqituvchi ustoz
imtihon|maktab|exam test exams экзамен контрольная imtihon
uy vazifasi|maktab|homework домашка домашнее uyvazifa
matematika|maktab|math maths mathematics математика matematika
kitob|maktab|book книга kitob
talaba|maktab|student студент ученик talaba oʻquvchi
universitet|maktab|university college университет институт universitet
direktor|maktab|principal director директор direktor
baho|maktab|grade mark оценка двойка пятерка baho
iş|ish|work job office работа офис ish
boşliq|ish|boss начальник шеф boshliq
maoş|ish|salary money зарплата деньги maosh pul
dasturçi|ish|programmer developer coder программист dasturchi
şifokor|ish|doctor врач доктор shifokor vrach
oşpaz|ish|cook chef повар oshpaz
haydovçi|ish|driver водитель haydovchi
kompyuter|ish|computer laptop компьютер ноутбук kompyuter
duşanba|ish|monday понедельник dushanba
taksi|mashina|taxi cab такси taksi
maşina|mashina|car cars auto машина авто автомобиль mashina
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
öyin|telefon|game games игра игры oʻyin oyin
televizor|telefon|tv television телевизор televizor
yomğir|havo|rain rainy дождь yomgʻir yomgir
qor|havo|snow снег qor
issiq|havo|hot heat summer жара лето жарко issiq yoz
sovuq|havo|cold winter холод зима холодно sovuq qish
şamol|havo|wind ветер shamol
quyoş|havo|sun sunny солнце quyosh
ob-havo|havo|weather погода obhavo
bahor|havo|spring весна bahor
kuz|havo|autumn fall осень kuz
sevgi|sevgi|love любовь люблю sevgi muhabbat sevaman
yor|sevgi|darling sweetheart girlfriend boyfriend любимая любимый девушка парень yor
kelin|sevgi|bride невеста kelin
kuyov|sevgi|groom жених kuyov
sovçi|sevgi|matchmaker сваха sovchi
gul|sevgi|flower flowers rose цветы роза gul
uçraşuv|sevgi|date свидание uchrashuv
futbol|futbol|football soccer футбол futbol
töp|futbol|ball мяч toʻp top
gol|futbol|goal гол gol
darvozabon|futbol|goalkeeper вратарь darvozabon
hakam|futbol|referee судья hakam
Paxtakor|futbol|pakhtakor пахтакор paxtakor
sport|futbol|sport gym спорт качалка sport
toy|toy|wedding party свадьба вечеринка той toy
karnay|toy|trumpet карнай karnay
doira|toy|drum бубен дойра doira
raqs|toy|dance dancing танец танцы raqs oʻyin
tuğilgan kun|toy|birthday день рождения tugilgankun
bozor|bozor|market bazaar рынок базар bozor
Çorsu|bozor|chorsu чорсу chorsu
savdo|bozor|shopping sale покупки скидка savdo
dökon|bozor|shop store магазин doʻkon dokon
narx|bozor|price expensive cheap цена дорого дешево narx qimmat arzon
çoyxona|toy|teahouse чайхана choyxona
uyqu|oila|sleep sleeping спать сон uyqu uxlaydi
`;

const DICT = new Map();
for (const line of DICT_SRC.trim().split("\n")) {
  const [uz, theme, words] = line.split("|");
  for (const w of words.split(" ")) DICT.set(toNewAlphabet(w.toLowerCase()), { uz, theme });
}

const THEMES = ["hayvon","ovqat","oila","maktab","ish","mashina","telefon","havo","sevgi","futbol","toy","bozor"];

// Har bir band: 4 qator, {X} — asosiy söz.
const VERSES = {
  hayvon: [
    ["Bizning {X} juda aqlli, maktabni bitirgan,","Qöşnining tovuğiga ingliz tili örgatgan.","Ertalab turib çoy sörar, «şakarsiz» deydi,","Keçqurun serialni körib, yiğlab ham yeydi."],
    ["{X} bozorga borib, savdolaşdi rosa,","«Arzonroq ber, aka», dedi, qilmay heç pisanda.","Sotuvçi hayron qoldi, kalkulyator tuşdi,","{X} esa çegirma olib, uyiga uçdi."],
    ["Töyda {X} çiqib raqsga tuşdi zör,","Karnayçilar töxtab qoldi, doira ham kör.","Kuyov hayron, kelin hayron, mehmonlar qarsak,","Endi har töyga {X}ni çaqirsak!"],
  ],
  ovqat: [
    ["Oyim {X} qildi, xuşböy hidi taraldi,","Butun mahalla eşik oldida navbat saraldi.","Qöşni «tuz sörab» keldi, qölida lagan,","Ketganda {X}dan qolmadi bir qoşiq ham, inon!"],
    ["Çoyxonada ötirib {X} haqida bahs,","Kim köp yeydi, kim kam yeydi — hammasi qasd.","Ahmad aka ön tarelka, Bahrom aka ön bir,","Ofitsiant qoçib ketdi — qolmadi unda sabr."],
    ["Dietaga ötdim deb, ertalab qasam içdim,","Tuşda {X} körib qoldim, qasamni unutdim.","Keçqurun tarozi «yordam!» deb baqirdi,","Ertaga dieta, deyman — bu öninçi gal edi."],
  ],
  oila: [
    ["Qaynonam keldi bugun, qölida {X},","«Kelinim, çoy damla» dedi, «aççiq, ammo şirin!»","Çoy damlasam — sovuq, isitsam — kuyib ketdi,","Qaynonam kulib qöydi: «Mendan örgan, ketdik!»"],
    ["Bobom aytar: «Bizning davrda {X} boşqa edi,","Ön çaqirim piyoda yurib, maktabga yetardi».","Nevaralar söradi: «Bobo, taksi yöqmidi?»","Bobom jim qoldi-da, sekin çoyini içdi."],
    ["Qöşnimiz {X} haqida mahallaga gap tarqatdi,","Ertalab bir bilardi, keçqurun yuz bilardi.","Gap aylanib qaytib keldi, tanimay qoldik,","Oxiri özimiz ham işonib, hayron böldik."],
  ],
  maktab: [
    ["Imtihon kuni ertalab {X} esimga tuşdi,","Kitobni oçsam — böş, faqat yurak tuşdi.","Ustoz söradi: «Javob?» — men dedim: «Ikki!»","Ustoz kuldi: «Töğri, bahoyingiz ham ikki»."],
    ["Uy vazifasini {X} yeb qöydi, ustoz,","Işonmasangiz — sörang, u gapirmas, ammo soz.","Ustoz qoşini kötardi, jurnalni oçdi,","Mening ham bahoyim öşa zahot qoçdi."],
    ["Matematika darsida {X} haqida masala:","«Ikkita {X} bor edi, bittasi ketdi Toşkentga, qarang-a!»","Butun sinf öylandi, doskaga qaradi,","Javobni heç kim bilmadi — {X} qaytib keldi-da!"],
  ],
  ish: [
    ["Duşanba ertalab budilnik çalindi,","Men «beş daqiqa» dedim — soat ön böldi.","Boşliq qönğiroq qildi: «{X} qayerda?»","Men dedim: «Probkada, işonavering, axir!»"],
    ["Işxonada {X} haqida majlis böldi uç soat,","Hamma boş irğitdi, heç kim tuşunmadi, rost.","Oxirida boşliq söradi: «Savol bormi, qani?»","Hamma bir ovozda: «Tuşlik qaçon, şuni!»"],
    ["Maoş kelgan kuni {X} sotib oldim,","Ertasiga qarasam — kartada heç pul qolmadi.","Xotinim söradi: «Pul qani, dadasi?»","Men dedim: «Investitsiya — kelajak boylik asosi!»"],
  ],
  mashina: [
    ["Taksiçi aka aytdi: «{X} — mening jonim»,","Radioda qöşiq baland, yölga qaramas heç qaçon.","Çorsuga ketyapmiz desam, Yunusobodga bordik,","Yöl haqini söraganda, ikkalamiz ham kuldik."],
    ["Damasga ön beş kişi, yana {X} ham mindi,","Haydovçi «surilinglar» deb, özi ham siğdi.","Har bekatda bittasi «töxtang!» deb qiçqirar,","Damas esa kuylab ketar, heç qaçon çarçamas."],
    ["Probkada uç soat turdik, {X} bilan birga,","Çoy damladik, palov qildik, qöşiq aytdik bir-bir.","Svetofor yaşil böldi, hamma joyidan jildi,","Biz esa uxlab qolibmiz — orqadan signal bildi."],
  ],
  telefon: [
    ["Telefonim zaryadi bir foiz qoldi,","Men {X} haqida post yozdim — u öçib qoldi.","Butun dunyo bilmay qoldi bu buyuk xabarni,","Ertaga yana yozaman, kutinglar, mehribonlar!"],
    ["Buvim Telegram örnatdi, özi kanal oçdi,","{X} haqida stiker yuborib, guruhni bosdi.","Kuniga yuz «xayrli tong», gullar va kuçuklar,","Endi buvim — bloger, obunaçilar quçoqlar!"],
    ["Selfi olay deb {X} bilan suratga tuşdim,","Öttiz marta urinib, oxiri ariqqa tuşdim.","Surat çiqdi zör — hamma «layk» bosdi,","Ariqdagi qurbaqa ham men bilan ösdi."],
  ],
  havo: [
    ["Ob-havo dedi: «Bugun quyoş, iliq, soz»,","Men {X} bilan çiqdim — yoğdi döl, qor, muz.","Sinoptik aka, sizga bir savolim bor:","Derazangiz qayoqqa qaragan, özi bormi, yor?"],
    ["Saraton issiğida {X} ham erib ketdi,","Asfaltda tuxum qovurdik, mahalla yeb ketdi.","Konditsioner söradi: «Meni ham bir sovut»,","Biz esa ariq böyida — tarvuz bilan umid."],
  ],
  sevgi: [
    ["Sovçilar keldi uyga, qölida {X},","Oyim dedi: «Kuyovning işi bormi, bilsin!»","Kuyov dedi: «Bloger man, obunaçim ön ikki»,","Dadam sekin turib ketdi, eşik yopildi tiq-tiq."],
    ["Yorim uçun {X} olib, deraza ostiga bordim,","Qöşiq aytdim baland — itlar bilan birga hordim.","Deraza oçildi-yu, çiqdi uning dadasi,","Men qoçdim, {X} qoldi — bu sevgi xatosi!"],
  ],
  futbol: [
    ["Mahalla futbolida {X} darvozabon böldi,","Töp kelsa — çoy içar, gol kirsa — kulib qoldi.","Hisob ön-nol bölganda u dedi: «Hali erta!»","Biz ham işondik unga — öyin tugadi keç-da."],
    ["Televizor oldida {X} bilan ikkimiz,","Gol kirsa baqiramiz, qöşnilar keldi — hammamiz.","Hakamga maslahat berdik, murabbiyga ham reja,","Özimiz-çi, divandan turmay qoldik keça."],
  ],
  toy: [
    ["Töyda karnay çalindi, doira gumburladi,","{X} örtaga çiqib, «lazgi»ga tuşib ketdi.","Töy egasi hayron: «Bu kim, kim çaqirdi?»","Heç kim bilmas, ammo hamma oşini yeb ketdi."],
    ["Çoyxonada oş tortildi, {X} ham keldi,","«Men faqat bir qoşiq» dedi, uç lagan yedi.","Oşpaz aka kulib dedi: «Ana, mehmon zör!»","Ertasiga {X} uçun alohida qozon bor."],
  ],
  bozor: [
    ["Çorsu bozorida {X} narxini söradim,","Sotuvçi «yuz ming» dedi, men «ön ming» deb turdim.","Bir soat savdolaşdik, çoy içdik, döst böldik,","Oxiri bepul berdi-yu, «yana kel» deb qöydi."],
    ["Bozorga ketdim deb, ertalab çiqdim uydan,","{X} topay deb kezdim, oyoğim qoldi ötdan.","Qaytganda qölimda: uç qovun, bir gilam, xöroz,","{X}ni-çi? Unutibman — yana ertaga, soz!"],
  ],
};

const CHORUS = [
  ["Voy, {X}, voy, {X}, sen mahalla yulduzi,","Senga qöşiq aytamiz keçasi-yu kunduzi!","Doira çal, karnay çal, hamma tursin raqsga,","{X} bilan baxtlimiz — kulgu kerak har kasga!"],
  ["Hey-hey, {X}, yalla-yalla, yor-yor,","Sensiz bu dunyoda yöqdir heç qanday zavq, yor.","Çoyxonadan bozorgaça — hamma seni soğinar,","{X}! {X}! — butun Toşkent çorlar!"],
  ["La-la-lay, {X}, sening-çun bu qöşiq,","Kulib-kulib yiğlaymiz, qorinlar oğriydi, örtoq.","Bir kuy, ikki kuy, uç kuy — hammasi senga,","{X} bölsa yonimda, ğam kelmaydi menga!"],
  ["Oh, {X}, ey, {X}, sendan zöri yöq,","Oç bölsang ham, töq bölsang ham — sen bilan dil töq.","Qarsak çal, sakra, bir oz ham qiliq qil,","{X} uçun bu keça — butun mahalla bir dil!"],
];

const TITLES = ["{X} haqida ballada","Voy, {X}!","{X} va mahalla","{X}ning sarguzaştlari","{X} — yulduz","{X} uçun qöşiq"];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
const cap = (s) => s.replace(/^([«"]?)(\p{L})/u, (_, q, c) => q + c.toUpperCase());
// Gap boshidagi harfni katta qiladi ("Qaynona! qaynona!" → "Qaynona! Qaynona!").
const capLine = (s) => cap(s).replace(/([.!?]\s+[«"]?)(\p{Ll})/gu, (_, p, c) => p + c.toUpperCase());

// Sözni luğatdan qidiradi: töliq şakl, keyin özak (qöşimçalarni kesib).
function lookup(word) {
  for (let len = word.length; len >= 3; len--) {
    const hit = DICT.get(word.slice(0, len));
    if (hit) return hit;
  }
  return null;
}

export function analyzePrompt(prompt) {
  const latin = toNewAlphabet(cyrToLatin(prompt.trim()));
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
    verses.push(v.map((l) => capLine(toNewAlphabet(l.replaceAll("{X}", name)))));
  }
  const chorus = pick(CHORUS).map((l) => capLine(toNewAlphabet(l.replaceAll("{X}", main))));
  const title = capLine(toNewAlphabet(pick(TITLES).replaceAll("{X}", main)));
  return { title, prompt: clean, verses, chorus };
}

export function songToText(song) {
  const parts = [song.title.toUpperCase(), ""];
  song.verses.forEach((v, i) => parts.push(`${i + 1}-band:`, ...v, "", "Naqarot:", ...song.chorus, ""));
  return parts.join("\n").trim();
}
