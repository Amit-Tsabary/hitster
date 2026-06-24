import type { Song } from '../state/gameTypes';

// Hebrew deck: well-known Israeli/Hebrew songs spread across the decades.
// As with the regular deck, `year` is the gameplay-critical original release year and is
// curated by hand (best-effort — easy to tweak here). iTunes is used only for preview audio;
// the audio lookup sends the Hebrew artist + title straight to the Search API.
export const HEBREW_SONGS: Song[] = [
  { id: 'h1', title: 'ירושלים של זהב', artist: 'שולי נתן', year: 1967 },
  { id: 'h2', title: 'שיר לשלום', artist: 'להקת הנחל', year: 1969 },
  { id: 'h3', title: 'אני ואתה', artist: 'אריק איינשטיין', year: 1971 },
  { id: 'h4', title: 'יושב על הגדר', artist: 'כוורת', year: 1973 },
  { id: 'h5', title: 'א-ב-ני-בי', artist: 'יזהר כהן והעלפים', year: 1978 },
  { id: 'h6', title: 'הללויה', artist: 'מילק אנד האני', year: 1979 },
  { id: 'h7', title: 'פרח בגני', artist: 'זוהר ארגוב', year: 1982 },
  { id: 'h8', title: 'חי', artist: 'עפרה חזה', year: 1983 },
  { id: 'h9', title: 'מחכים למשיח', artist: 'שלום חנוך', year: 1985 },
  { id: 'h10', title: 'רכבת לילה לקהיר', artist: 'משינה', year: 1985 },
  { id: 'h11', title: 'אין לי ארץ אחרת', artist: 'גלי עטרי', year: 1986 },
  { id: 'h12', title: 'כמו צמח בר', artist: 'יהודית רביץ', year: 1986 },
  { id: 'h13', title: 'עוף גוזל', artist: 'אריק איינשטיין', year: 1987 },
  { id: 'h14', title: 'דיווה', artist: 'דנה אינטרנשיונל', year: 1998 },
  { id: 'h15', title: 'ממעמקים', artist: 'פרויקט עידן רייכל', year: 2003 },
  { id: 'h16', title: 'שירת הסטיקר', artist: 'הדג נחש', year: 2004 },
  { id: 'h17', title: 'בואי', artist: 'פרויקט עידן רייכל', year: 2006 },
  { id: 'h18', title: 'תל אביב', artist: 'עומר אדם', year: 2015 },
  { id: 'h19', title: 'מלכת היופי', artist: 'עדן בן זקן', year: 2015 },
  { id: 'h20', title: 'ברצלונה', artist: 'סטטיק ובן אל', year: 2016 },
  { id: 'h21', title: 'כל הניסים', artist: 'ישי ריבו', year: 2017 },
  { id: 'h22', title: 'מיליון דולר', artist: 'נועה קירל', year: 2017 },
  { id: 'h23', title: 'טוב שבאת', artist: 'חנן בן ארי', year: 2018 },
  { id: 'h24', title: 'צבע הכסף', artist: 'עדן בן זקן', year: 2018 },
  { id: 'h25', title: 'אהובתי', artist: 'פאר טסי', year: 2019 },
  { id: 'h26', title: 'הללויה', artist: 'ישי ריבו ועומר אדם', year: 2019 },
];
