import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  BookOpenText,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Copy,
  GraduationCap,
  LayoutDashboard,
  Library,
  MessageCircle,
  NotebookPen,
  Plus,
  Search,
  Sparkles,
  Target,
  TextCursorInput,
  UsersRound,
  WandSparkles,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مساعد المعلم الذكي | إدارة دروس العربية" },
      {
        name: "description",
        content: "لوحة عربية لإدارة الطلاب وتحضير الدروس ومتابعة تعلّم العربية.",
      },
      { property: "og:title", content: "مساعد المعلم الذكي | إدارة دروس العربية" },
      {
        property: "og:description",
        content: "إدارة طلابك وتحضير دروس عربية واضحة في مساحة واحدة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MidadApp,
});

type PageKey = "home" | "students" | "generator" | "diacritics" | "library";
type Level = "مبتدئ" | "متوسط" | "متقدم";

type StudentNote = {
  id: string;
  date: string;
  text: string;
};

type Student = {
  id: string;
  name: string;
  age: number;
  level: Level;
  curriculum: string;
  weakness: string;
  sessions: number;
  notes: StudentNote[];
};

type LessonQuestion = {
  prompt: string;
  options: string[];
  answerIndex: number;
};

type VocabularyItem = {
  word: string;
  transliteration: string;
  meaning: string;
};

type Lesson = {
  id: string;
  title: string;
  topic: string;
  studentId: string;
  studentName: string;
  createdAt: string;
  reading: string;
  translation: string;
  vocabulary: VocabularyItem[];
  questions: LessonQuestion[];
};

type Scenario = Omit<Lesson, "id" | "title" | "topic" | "studentId" | "studentName" | "createdAt">;

const STORAGE_KEY = "midad-saved-lessons-v1";

const initialStudents: Student[] = [
  {
    id: "student-sofia",
    name: "صوفيا مارتن",
    age: 27,
    level: "مبتدئ",
    curriculum: "العربية بين يديك ١",
    weakness: "تمييز الحركات القصيرة",
    sessions: 8,
    notes: [
      { id: "note-s1", date: "اليوم", text: "قرأت حوار المقهى بثقة، وتحتاج إلى تكرار صوت الحاء." },
      { id: "note-s2", date: "الأحد، ٢٢ نوفمبر", text: "تقدّم ملحوظ في قراءة الكلمات المألوفة." },
    ],
  },
  {
    id: "student-daniel",
    name: "دانيال براون",
    age: 34,
    level: "متوسط",
    curriculum: "العربية بين يديك ٢",
    weakness: "ترتيب الكلمات في السؤال",
    sessions: 12,
    notes: [
      { id: "note-d1", date: "أمس", text: "استخدم الماضي بشكل صحيح في وصف عطلة نهاية الأسبوع." },
      { id: "note-d2", date: "الخميس، ١٩ نوفمبر", text: "مراجعة صياغة السؤال وتبديل الضمائر." },
    ],
  },
  {
    id: "student-isabelle",
    name: "إيزابيل روسي",
    age: 22,
    level: "مبتدئ",
    curriculum: "العربية للناطقين بغيرها",
    weakness: "التذكير والتأنيث",
    sessions: 5,
    notes: [{ id: "note-i1", date: "الثلاثاء، ١٧ نوفمبر", text: "تتذكر المفردات الجديدة جيداً مع الصور." }],
  },
  {
    id: "student-marc",
    name: "مارك دوبوا",
    age: 41,
    level: "متقدم",
    curriculum: "العربية الإعلامية",
    weakness: "التعبير الكتابي المطوّل",
    sessions: 19,
    notes: [{ id: "note-m1", date: "الاثنين، ١٦ نوفمبر", text: "نقاش ممتاز حول مقال السفر؛ إضافة أدوات ربط جديدة." }],
  },
  {
    id: "student-mia",
    name: "ميا تشين",
    age: 29,
    level: "متوسط",
    curriculum: "كتاب المدينة ٢",
    weakness: "الاستماع إلى اللهجات",
    sessions: 9,
    notes: [{ id: "note-mia1", date: "السبت، ١٤ نوفمبر", text: "فهمت الحوار الفصيح كاملاً، ونبدأ باللهجة الشامية تدريجياً." }],
  },
  {
    id: "student-liam",
    name: "ليام ويليامز",
    age: 31,
    level: "مبتدئ",
    curriculum: "العربية بين يديك ١",
    weakness: "أصوات العين والقاف",
    sessions: 4,
    notes: [{ id: "note-l1", date: "الأربعاء، ١١ نوفمبر", text: "تحسّن نطقه مع التدرّب البطيء وتقسيم الكلمات." }],
  },
];

const levelStyles: Record<Level, string> = {
  مبتدئ: "bg-sage/50 text-primary",
  متوسط: "bg-sky/50 text-sky-strong",
  متقدم: "bg-coral/50 text-coral-strong",
};

const studentAvatarStyles = [
  "bg-sage text-primary",
  "bg-sky text-sky-strong",
  "bg-coral text-coral-strong",
  "bg-sun text-sun-strong",
];

const scenarios: { matches: string[]; data: Scenario }[] = [
  {
    matches: ["مقهى", "قهوة", "مطعم", "طعام"],
    data: {
      reading:
        "فِي صَباحٍ جَميلٍ، ذَهَبَ سامي إِلَى الْمَقْهَى. قالَ: «مِنْ فَضْلِكَ، أُريدُ كَوْبًا مِنَ الْقَهْوَةِ وَقِطْعَةً مِنَ الْخُبْزِ». اِبْتَسَمَ النّادِلُ وَقالَ: «تَفَضَّلْ، هَذا طَلَبُكَ». شَكَرَهُ سامي وَجَلَسَ قُرْبَ النّافِذَةِ.",
      translation:
        'On a lovely morning, Sami went to the café. He said, “Please, I would like a cup of coffee and a piece of bread.” The waiter smiled and said, “Here is your order.” Sami thanked him and sat near the window.',
      vocabulary: [
        { word: "الْمَقْهَى", transliteration: "al-maqhā", meaning: "café" },
        { word: "مِنْ فَضْلِكَ", transliteration: "min faḍlika", meaning: "please" },
        { word: "كَوْبٌ", transliteration: "kawbun", meaning: "cup" },
        { word: "اِبْتَسَمَ", transliteration: "ibtasama", meaning: "smiled" },
      ],
      questions: [
        { prompt: "ماذا طلب سامي؟", options: ["شايًا وتمرًا", "قهوةً وخبزًا", "عصيرًا وماءً"], answerIndex: 1 },
        { prompt: "أين جلس سامي؟", options: ["قرب النافذة", "في الحديقة", "بجانب الباب"], answerIndex: 0 },
        { prompt: "أي عبارة استخدمها سامي بأدب؟", options: ["إلى اللقاء", "من فضلك", "صباح الخير"], answerIndex: 1 },
      ],
    },
  },
  {
    matches: ["سوق", "شراء", "متجر", "فاكهة", "تسوّق"],
    data: {
      reading:
        "ذَهَبَتْ مَرْيَمُ إِلَى السُّوقِ في الصَّباحِ. اِشْتَرَتْ تُفّاحًا وَخُبْزًا، ثُمَّ سَأَلَتِ البائِعَ: «بِكَمْ هذا؟» قالَ البائِعُ: «بِخَمْسَةِ دَراهِمَ». دَفَعَتْ مَرْيَمُ المَبْلَغَ وَعادَتْ إِلَى الْبَيْتِ.",
      translation:
        'Maryam went to the market in the morning. She bought apples and bread, then asked the seller, “How much is this?” The seller said, “Five dirhams.” Maryam paid and returned home.',
      vocabulary: [
        { word: "السُّوقُ", transliteration: "as-sūqu", meaning: "market" },
        { word: "بائِعٌ", transliteration: "bāʾiʿun", meaning: "seller" },
        { word: "بِكَمْ", transliteration: "bikam", meaning: "how much" },
        { word: "دَفَعَ", transliteration: "dafaʿa", meaning: "paid" },
      ],
      questions: [
        { prompt: "ماذا اشترت مريم؟", options: ["تفاحًا وخبزًا", "قهوةً وحليبًا", "كتابًا وقلمًا"], answerIndex: 0 },
        { prompt: "كم دفعت مريم؟", options: ["ثلاثة دراهم", "خمسة دراهم", "عشرة دراهم"], answerIndex: 1 },
        { prompt: "أين ذهبت مريم؟", options: ["إلى المدرسة", "إلى السوق", "إلى المطار"], answerIndex: 1 },
      ],
    },
  },
  {
    matches: ["مطار", "سفر", "رحلة", "طائرة"],
    data: {
      reading:
        "اِسْتَيْقَظَ عُمَرُ مُبَكِّرًا لِيَذْهَبَ إِلَى الْمَطارِ. حَمَلَ حَقيبَتَهُ، وَأَخَذَ جَوازَ سَفَرِهِ، ثُمَّ سَأَلَ: «مَتى تُقْلِعُ الطّائِرَةُ؟» أَجابَ المُوَظَّفُ: «في السّاعَةِ العاشِرَةِ». وَجَدَ عُمَرُ مَقْعَدَهُ وَجَلَسَ بِهُدوءٍ.",
      translation:
        'Omar woke up early to go to the airport. He carried his bag and took his passport, then asked, “When does the plane take off?” The employee replied, “At ten o’clock.” Omar found his seat and sat quietly.',
      vocabulary: [
        { word: "الْمَطارُ", transliteration: "al-maṭāru", meaning: "airport" },
        { word: "حَقيبَةٌ", transliteration: "ḥaqībatun", meaning: "bag" },
        { word: "جَوازُ السَّفَرِ", transliteration: "jawāzu as-safari", meaning: "passport" },
        { word: "تُقْلِعُ", transliteration: "tuq liʿu", meaning: "takes off" },
      ],
      questions: [
        { prompt: "إلى أين ذهب عمر؟", options: ["إلى المطار", "إلى السوق", "إلى الصف"], answerIndex: 0 },
        { prompt: "متى تقلع الطائرة؟", options: ["في التاسعة", "في العاشرة", "في الثانية عشرة"], answerIndex: 1 },
        { prompt: "ماذا أخذ عمر معه؟", options: ["كتابه", "جواز سفره", "مفتاح البيت"], answerIndex: 1 },
      ],
    },
  },
  {
    matches: ["صف", "تعارف", "اسم", "مدرسة", "دراسة"],
    data: {
      reading:
        "في أَوَّلِ يَوْمٍ في الصَّفِّ، قالَ المُعَلِّمُ: «ما اسْمُكَ؟» أَجابَ ليو: «اِسْمي ليو، وَأَنا مِنْ إِيطاليا». قالَ المُعَلِّمُ: «أَهْلًا وَسَهْلًا بِكَ!» اِبْتَسَمَ ليو وَجَلَسَ في مَكانِهِ قُرْبَ صَديقِهِ.",
      translation:
        'On the first day in class, the teacher asked, “What is your name?” Leo answered, “My name is Leo, and I am from Italy.” The teacher said, “Welcome!” Leo smiled and sat in his place beside his friend.',
      vocabulary: [
        { word: "الصَّفُّ", transliteration: "aṣ-ṣaffu", meaning: "classroom" },
        { word: "ما اسْمُكَ؟", transliteration: "mā ismuka?", meaning: "what is your name?" },
        { word: "أَهْلًا وَسَهْلًا", transliteration: "ahlan wa-sahlan", meaning: "welcome" },
        { word: "صَديقٌ", transliteration: "ṣadīqun", meaning: "friend" },
      ],
      questions: [
        { prompt: "ماذا سأل المعلّم؟", options: ["أين تسكن؟", "ما اسمك؟", "ماذا تريد؟"], answerIndex: 1 },
        { prompt: "من أين ليو؟", options: ["من إيطاليا", "من فرنسا", "من كندا"], answerIndex: 0 },
        { prompt: "أين جلس ليو؟", options: ["قرب صديقه", "قرب النافذة", "في الحديقة"], answerIndex: 0 },
      ],
    },
  },
];

function createLesson(
  topic: string,
  studentName: string,
  studentId: string,
  id: string,
  createdAt = "اليوم",
): Lesson {
  const normalizedTopic = topic.toLocaleLowerCase("ar");
  const scenario = scenarios.find(({ matches }) => matches.some((word) => normalizedTopic.includes(word)))?.data;
  const content = scenario ?? scenarios[0]?.data;

  if (!content) {
    throw new Error("لم يتم إعداد محتوى الدرس التجريبي.");
  }

  return {
    id,
    title: `درس: ${topic}`,
    topic,
    studentId,
    studentName,
    createdAt,
    ...content,
  };
}

const initialSavedLessons: Lesson[] = [
  createLesson("التعارف في الصف", "إيزابيل روسي", "student-isabelle", "saved-introduction", "١٨ نوفمبر ٢٠٢٦"),
  createLesson("طلب الطعام في المقهى", "صوفيا مارتن", "student-sofia", "saved-cafe", "١٥ نوفمبر ٢٠٢٦"),
  createLesson("شراء الفاكهة من السوق", "دانيال براون", "student-daniel", "saved-market", "١٢ نوفمبر ٢٠٢٦"),
  createLesson("الاستعداد للسفر", "ميا تشين", "student-mia", "saved-travel", "٩ نوفمبر ٢٠٢٦"),
];

const navigation: { id: PageKey; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "الرئيسية", icon: LayoutDashboard },
  { id: "students", label: "إدارة الطلاب", icon: UsersRound },
  { id: "generator", label: "مولّد الدروس", icon: WandSparkles },
  { id: "diacritics", label: "التشكيل السريع", icon: TextCursorInput },
  { id: "library", label: "مكتبة الدروس", icon: Library },
];

const diacriticsDictionary: Record<string, string> = {
  أنا: "أَنا",
  أحب: "أُحِبُّ",
  اللغة: "اللُّغَةَ",
  العربية: "الْعَرَبِيَّةَ",
  السلام: "السَّلامُ",
  عليكم: "عَلَيْكُمْ",
  صباح: "صَباحٌ",
  الخير: "الْخَيْرُ",
  طالب: "طالِبٌ",
  طالبة: "طالِبَةٌ",
  الكتاب: "الْكِتابَ",
  جميل: "جَميلٌ",
  بيت: "بَيْتٌ",
  الماء: "الْماءَ",
  أريد: "أُريدُ",
  من: "مِنْ",
  فضلك: "فَضْلِكَ",
  أين: "أَيْنَ",
  السوق: "السُّوقِ",
  مطار: "مَطارٌ",
  اليوم: "الْيَوْمَ",
  شكرا: "شُكْرًا",
  مدرسة: "مَدْرَسَةٌ",
  كتاب: "كِتابٌ",
  قهوة: "قَهْوَةٌ",
  معلم: "مُعَلِّمٌ",
  معلمة: "مُعَلِّمَةٌ",
  صديق: "صَديقٌ",
  مرحبا: "مَرْحَبًا",
};

function applyMockDiacritics(text: string): string {
  return text
    .split(/(\s+)/u)
    .map((part) => {
      const core = part.replace(/^[،,.!?؛:«»"()]+|[،,.!?؛:«»"()]+$/gu, "");
      if (!core) return part;
      const normalized = core
        .normalize("NFD")
        .replace(/[\u064B-\u0653\u0656-\u065F\u0670]/gu, "")
        .normalize("NFC");
      const marked = diacriticsDictionary[normalized];
      return marked ? part.replace(core, marked) : part;
    })
    .join("");
}

function isLesson(value: unknown): value is Lesson {
  if (typeof value !== "object" || value === null) return false;
  const lesson = value as Partial<Lesson>;
  return (
    typeof lesson.id === "string" &&
    typeof lesson.title === "string" &&
    typeof lesson.topic === "string" &&
    typeof lesson.studentId === "string" &&
    typeof lesson.studentName === "string" &&
    typeof lesson.createdAt === "string" &&
    typeof lesson.reading === "string" &&
    typeof lesson.translation === "string" &&
    Array.isArray(lesson.vocabulary) &&
    Array.isArray(lesson.questions)
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ar-EG").format(value);
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/u).slice(0, 2).map((part) => part.slice(0, 1)).join("");
}

function MidadApp() {
  const [activePage, setActivePage] = useState<PageKey>("home");
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [savedLessons, setSavedLessons] = useState<Lesson[]>(initialSavedLessons);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudents[0]?.id ?? "");
  const [currentLesson, setCurrentLesson] = useState(() =>
    createLesson("زيارة إلى المقهى", "صوفيا مارتن", "student-sofia", "current-demo"),
  );
  const [studentDisplay, setStudentDisplay] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every(isLesson)) setSavedLessons(parsed);
      }
    } catch {
      // Storage can be unavailable in a private browsing session; the in-memory demo still works.
    }
    setStorageLoaded(true);
  }, []);

  useEffect(() => {
    if (!storageLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLessons));
    } catch {
      // Keep the current session usable even when browser storage is full or disabled.
    }
  }, [savedLessons, storageLoaded]);

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? students[0];

  const saveLesson = (lesson: Lesson) => {
    setSavedLessons((previous) =>
      previous.some((saved) => saved.id === lesson.id) ? previous : [lesson, ...previous],
    );
  };

  const openSavedLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setSelectedStudentId(lesson.studentId);
    setActivePage("generator");
  };

  if (studentDisplay) {
    return <StudentDisplay lesson={currentLesson} onExit={() => setStudentDisplay(false)} />;
  }

  const activeLabel = navigation.find((item) => item.id === activePage)?.label ?? "الرئيسية";

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[252px] shrink-0 flex-col border-l border-border/70 bg-card px-4 py-6 lg:flex">
          <div className="flex items-center gap-3 px-3">
            <div className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground">
              <BookOpenText className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold">مساعد المعلم الذكي</p>
              <p className="text-xs text-muted-foreground">مساحة معلّم العربية</p>
            </div>
          </div>

          <div className="mt-10 px-3 text-xs font-semibold text-muted-foreground">مساحة العمل</div>
          <nav className="mt-3 flex flex-col gap-1" aria-label="القائمة الرئيسية">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <Button
                  key={item.id}
                  type="button"
                  variant={isActive ? "default" : "ghost"}
                  className="h-11 w-full justify-start gap-3 px-3 text-sm"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setActivePage(item.id)}
                >
                  <Icon className="size-[18px]" aria-hidden="true" />
                  {item.label}
                  {item.id === "library" && (
                    <span className={`mr-auto rounded-full px-2 py-0.5 text-[11px] ${isActive ? "bg-primary-foreground/15 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {formatNumber(savedLessons.length)}
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-lg bg-secondary/80 p-4">
            <div className="flex size-9 items-center justify-center rounded-md bg-background text-primary">
              <GraduationCap className="size-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold">رحلتك مع كل طالب</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              ملاحظات صغيرة تصنع تقدّماً واضحاً.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 backdrop-blur">
            <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground lg:hidden">
                  <BookOpenText className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold sm:text-base">مساعد المعلم الذكي</p>
                  <p className="text-xs text-muted-foreground">{activeLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold">مساحة المعلّم</p>
                  <p className="text-xs text-muted-foreground">نسخة تجريبية</p>
                </div>
                <div className="grid size-10 place-items-center rounded-full bg-sun text-sm font-bold text-sun-strong" aria-label="حساب المعلّم">
                  ع
                </div>
                <Button type="button" className="hidden sm:inline-flex" onClick={() => setActivePage("generator")}>
                  <Plus aria-hidden="true" />
                  تحضير درس
                </Button>
              </div>
            </div>
            <nav className="grid grid-cols-3 gap-1 border-t border-border/50 px-3 py-2 lg:hidden" aria-label="القائمة الرئيسية">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <Button
                    key={item.id}
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "ghost"}
                    className="h-auto min-h-10 min-w-0 justify-center gap-1.5 whitespace-normal px-1 py-2 text-[11px]"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setActivePage(item.id)}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Button>
                );
              })}
            </nav>
          </header>

          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
            <div className="page-enter">
              {activePage === "home" && (
                <OverviewPage
                  students={students}
                  savedLessons={savedLessons}
                  onNavigate={setActivePage}
                />
              )}
              {activePage === "students" && (
                <StudentsPage students={students} onStudentsChange={setStudents} />
              )}
              {activePage === "generator" && (
                <GeneratorPage
                  students={students}
                  selectedStudentId={selectedStudentId}
                  onStudentChange={setSelectedStudentId}
                  lesson={currentLesson}
                  onLessonChange={setCurrentLesson}
                  savedLessons={savedLessons}
                  onSave={saveLesson}
                  onDisplay={() => setStudentDisplay(true)}
                  onNavigate={setActivePage}
                />
              )}
              {activePage === "diacritics" && <DiacriticsPage />}
              {activePage === "library" && (
                <LibraryPage lessons={savedLessons} onOpen={openSavedLesson} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function OverviewPage({
  students,
  savedLessons,
  onNavigate,
}: {
  students: Student[];
  savedLessons: Lesson[];
  onNavigate: (page: PageKey) => void;
}) {
  const recentNotes = students.flatMap((student) =>
    student.notes.slice(0, 1).map((note) => ({ ...note, studentName: student.name, level: student.level })),
  ).slice(0, 3);

  const stats = [
    { label: "الطلاب النشطون", value: students.length, detail: "يتابعون التعلّم معك", icon: UsersRound, tone: "sage" },
    { label: "الدروس المحفوظة", value: savedLessons.length, detail: "جاهزة لإعادة الاستخدام", icon: BookOpen, tone: "sky" },
    { label: "الحصص هذا الأسبوع", value: 8, detail: "حصص فردية ومراجعات", icon: CalendarDays, tone: "coral" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">الثلاثاء، ٢٤ نوفمبر ٢٠٢٦</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">أهلاً بك في مساعد المعلم الذكي</h1>
          <p className="mt-2 text-sm text-muted-foreground">كل ما تحتاجه لتجعل درس العربية أقرب وأسهل.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => onNavigate("students")}>
          <UsersRound aria-hidden="true" />
          عرض الطلاب
          <ArrowLeft aria-hidden="true" />
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="ملخص النشاط">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const tone = stat.tone === "sage" ? "bg-sage text-primary" : stat.tone === "sky" ? "bg-sky text-sky-strong" : "bg-coral text-coral-strong";
          return (
            <Card key={stat.label} className="rounded-lg border-border/70 bg-card p-5 shadow-none">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold">{formatNumber(stat.value)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
                </div>
                <div className={`grid size-11 place-items-center rounded-lg ${tone}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="relative overflow-hidden rounded-lg bg-primary p-6 text-primary-foreground sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80">
            <Sparkles className="size-4" aria-hidden="true" />
            تحضير يناسب كل طالب
          </div>
          <h2 className="mt-3 text-2xl font-bold leading-relaxed sm:text-3xl">اجعل لكل حصة حكاية جديدة</h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-primary-foreground/80">
            اختر طالبك وموضوعك، ثم رتّب القراءة والمفردات والأسئلة في درس واحد.
          </p>
          <Button type="button" variant="secondary" className="mt-5" onClick={() => onNavigate("generator")}>
            <WandSparkles aria-hidden="true" />
            ابدأ تحضير درس
            <ArrowLeft aria-hidden="true" />
          </Button>
        </div>
        <div className="absolute left-8 top-8 hidden size-28 items-center justify-center rounded-lg border border-primary-foreground/20 text-primary-foreground/25 sm:flex">
          <BookOpenText className="size-14" strokeWidth={1} aria-hidden="true" />
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">ملاحظات الحصص الأخيرة</h2>
              <p className="mt-1 text-sm text-muted-foreground">لقطات سريعة من رحلة طلابك.</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => onNavigate("students")}>
              كل الطلاب <ArrowLeft aria-hidden="true" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentNotes.map((note) => (
              <Card key={note.id} className="rounded-lg border-border/70 p-4 shadow-none">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <MessageCircle className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{note.studentName}</p>
                      <span className="text-xs text-muted-foreground">{note.date}</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{note.text}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">طلابك</h2>
              <p className="mt-1 text-sm text-muted-foreground">متابعة سريعة للمستويات الحالية.</p>
            </div>
            <Button type="button" variant="ghost" size="icon" title="إدارة الطلاب" aria-label="إدارة الطلاب" onClick={() => onNavigate("students")}>
              <ArrowLeft aria-hidden="true" />
            </Button>
          </div>
          <Card className="rounded-lg border-border/70 p-2 shadow-none">
            {students.slice(0, 4).map((student, index) => (
              <div key={student.id} className="flex items-center gap-3 rounded-md px-3 py-3">
                <div className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${studentAvatarStyles[index % studentAvatarStyles.length] ?? "bg-secondary text-primary"}`}>
                  {getInitials(student.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{student.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{student.sessions} حصص · {student.curriculum}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${levelStyles[student.level]}`}>
                  {student.level}
                </span>
              </div>
            ))}
          </Card>
          <Card className="mt-4 rounded-lg border-border/70 bg-sun/35 p-4 shadow-none">
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-md bg-sun text-sun-strong">
                <Target className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold">خطوة صغيرة اليوم</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">أضف ملاحظة قصيرة بعد الحصة لتبقى نقاط التركيز قريبة منك.</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function StudentsPage({
  students,
  onStudentsChange,
}: {
  students: Student[];
  onStudentsChange: Dispatch<SetStateAction<Student[]>>;
}) {
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<Level | "الكل">("الكل");
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState({ name: "", age: "", level: "مبتدئ" as Level, curriculum: "" });

  const filteredStudents = useMemo(
    () => students.filter((student) => {
      const matchesSearch = `${student.name} ${student.curriculum}`.toLocaleLowerCase("ar").includes(query.trim().toLocaleLowerCase("ar"));
      return matchesSearch && (levelFilter === "الكل" || student.level === levelFilter);
    }),
    [levelFilter, query, students],
  );

  const addStudent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = draft.name.trim();
    const age = Number(draft.age);
    if (!name || !Number.isFinite(age) || age < 1 || !draft.curriculum.trim()) return;

    const student: Student = {
      id: `student-${Date.now()}`,
      name,
      age,
      level: draft.level,
      curriculum: draft.curriculum.trim(),
      weakness: "تُحدّد بعد الحصة الأولى",
      sessions: 0,
      notes: [],
    };
    onStudentsChange((previous) => [student, ...previous]);
    setDraft({ name: "", age: "", level: "مبتدئ", curriculum: "" });
    setShowAddForm(false);
  };

  const addNote = (studentId: string) => {
    const text = noteDrafts[studentId]?.trim();
    if (!text) return;
    onStudentsChange((previous) => previous.map((student) =>
      student.id === studentId
        ? { ...student, notes: [{ id: `note-${Date.now()}`, date: "اليوم", text }, ...student.notes] }
        : student,
    ));
    setNoteDrafts((previous) => ({ ...previous, [studentId]: "" }));
    setExpandedStudentId(studentId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">مساحة الطلاب</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">إدارة الطلاب</h1>
          <p className="mt-2 text-sm text-muted-foreground">ملفات مبسّطة لمستوى كل طالب وملاحظات الحصص.</p>
        </div>
        <Button type="button" onClick={() => setShowAddForm(true)}>
          <Plus aria-hidden="true" />
          إضافة طالب
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن طالب أو منهج..."
            aria-label="البحث عن طالب"
            className="h-11 rounded-lg border-border/80 bg-card pr-10"
          />
        </div>
        <div className="relative sm:w-48">
          <select
            value={levelFilter}
            onChange={(event) => setLevelFilter(event.target.value as Level | "الكل")}
            aria-label="تصفية حسب المستوى"
            className="h-11 w-full appearance-none rounded-lg border border-border/80 bg-card px-3 pl-9 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="الكل">كل المستويات</option>
            <option value="مبتدئ">مبتدئ</option>
            <option value="متوسط">متوسط</option>
            <option value="متقدم">متقدم</option>
          </select>
          <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/35 p-4" role="presentation">
          <Card role="dialog" aria-modal="true" aria-labelledby="add-student-title" className="w-full max-w-lg rounded-lg border-border/70 p-5 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="add-student-title" className="text-xl font-bold">إضافة طالب جديد</h2>
                <p className="mt-1 text-sm text-muted-foreground">أضف معلوماته لتبدأ متابعة رحلته.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" title="إغلاق" aria-label="إغلاق" onClick={() => setShowAddForm(false)}>
                <X aria-hidden="true" />
              </Button>
            </div>
            <form onSubmit={addStudent} className="mt-5 space-y-4">
              <label className="block space-y-2 text-sm font-medium">
                الاسم
                <Input required value={draft.name} onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))} placeholder="مثال: صوفيا مارتن" className="h-11 rounded-lg bg-background" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2 text-sm font-medium">
                  العمر
                  <Input required min="1" max="120" type="number" value={draft.age} onChange={(event) => setDraft((previous) => ({ ...previous, age: event.target.value }))} placeholder="٢٨" className="h-11 rounded-lg bg-background" />
                </label>
                <label className="relative block space-y-2 text-sm font-medium">
                  المستوى
                  <select value={draft.level} onChange={(event) => setDraft((previous) => ({ ...previous, level: event.target.value as Level }))} className="h-11 w-full appearance-none rounded-lg border border-input bg-background px-3 pl-9 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="مبتدئ">مبتدئ</option>
                    <option value="متوسط">متوسط</option>
                    <option value="متقدم">متقدم</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-3 top-[42px] size-4 text-muted-foreground" aria-hidden="true" />
                </label>
              </div>
              <label className="block space-y-2 text-sm font-medium">
                المنهج الحالي
                <Input required value={draft.curriculum} onChange={(event) => setDraft((previous) => ({ ...previous, curriculum: event.target.value }))} placeholder="اسم الكتاب أو المنهج" className="h-11 rounded-lg bg-background" />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>إلغاء</Button>
                <Button type="submit"><Plus aria-hidden="true" /> حفظ الطالب</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{formatNumber(filteredStudents.length)} طلاب</p>
        <span className="text-xs text-muted-foreground">بيانات تجريبية</span>
      </div>

      {filteredStudents.length === 0 ? (
        <Card className="rounded-lg border-dashed border-border p-10 text-center shadow-none">
          <UsersRound className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-semibold">لا يوجد طالب بهذا البحث</p>
          <p className="mt-1 text-sm text-muted-foreground">جرّب اسماً أو مستوى مختلفاً.</p>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredStudents.map((student, index) => {
            const expanded = expandedStudentId === student.id;
            return (
              <Card key={student.id} className="rounded-lg border-border/70 p-5 shadow-none">
                <div className="flex items-start gap-3">
                  <div className={`grid size-12 shrink-0 place-items-center rounded-full text-base font-bold ${studentAvatarStyles[index % studentAvatarStyles.length] ?? "bg-secondary text-primary"}`}>
                    {getInitials(student.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold">{student.name}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${levelStyles[student.level]}`}>{student.level}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{formatNumber(student.age)} سنة · {student.curriculum}</p>
                  </div>
                  <span className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {formatNumber(student.sessions)} حصص
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md bg-secondary/70 p-3">
                    <p className="text-xs font-semibold text-muted-foreground">نقطة التركيز</p>
                    <p className="mt-1.5 text-sm font-medium leading-6">{student.weakness}</p>
                  </div>
                  <div className="rounded-md bg-muted/70 p-3">
                    <p className="text-xs font-semibold text-muted-foreground">آخر ملاحظة</p>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-6">
                      {student.notes[0]?.text ?? "لم تُسجّل ملاحظات بعد."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setExpandedStudentId(expanded ? null : student.id)}>
                    <NotebookPen aria-hidden="true" />
                    {expanded ? "إخفاء السجل" : `سجل الملاحظات (${formatNumber(student.notes.length)})`}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setExpandedStudentId(student.id)}>
                    <Plus aria-hidden="true" />
                    ملاحظة جديدة
                  </Button>
                </div>

                {expanded && (
                  <div className="mt-2 border-t border-border/70 pt-4">
                    <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); addNote(student.id); }}>
                      <Textarea
                        value={noteDrafts[student.id] ?? ""}
                        onChange={(event) => setNoteDrafts((previous) => ({ ...previous, [student.id]: event.target.value }))}
                        placeholder="ما الذي حدث في الحصة؟ وما النقطة التي تحتاج إلى متابعة؟"
                        aria-label={`ملاحظة جديدة لـ ${student.name}`}
                        className="min-h-20 flex-1 rounded-md bg-background text-sm"
                      />
                      <Button type="submit" className="self-end sm:self-stretch"><Plus aria-hidden="true" /> إضافة</Button>
                    </form>
                    <div className="mt-4 space-y-3">
                      {student.notes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">سيظهر سجل الحصص هنا.</p>
                      ) : student.notes.map((note) => (
                        <div key={note.id} className="border-r-2 border-primary/30 pr-3">
                          <p className="text-xs font-medium text-muted-foreground">{note.date}</p>
                          <p className="mt-1 text-sm leading-6">{note.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GeneratorPage({
  students,
  selectedStudentId,
  onStudentChange,
  lesson,
  onLessonChange,
  savedLessons,
  onSave,
  onDisplay,
  onNavigate,
}: {
  students: Student[];
  selectedStudentId: string;
  onStudentChange: (studentId: string) => void;
  lesson: Lesson;
  onLessonChange: (lesson: Lesson) => void;
  savedLessons: Lesson[];
  onSave: (lesson: Lesson) => void;
  onDisplay: () => void;
  onNavigate: (page: PageKey) => void;
}) {
  const [topic, setTopic] = useState("زيارة إلى المقهى");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? students[0];
  const isSaved = savedLessons.some((saved) => saved.id === lesson.id);
  const answeredCount = Object.keys(answers).length;
  const correctCount = lesson.questions.reduce((count, question, index) => count + (answers[index] === question.answerIndex ? 1 : 0), 0);

  const generateLesson = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTopic = topic.trim();
    if (!trimmedTopic || !selectedStudent) return;
    onLessonChange(createLesson(trimmedTopic, selectedStudent.name, selectedStudent.id, `lesson-${Date.now()}`));
    setAnswers({});
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">من الفكرة إلى حصة كاملة</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">مولّد الدروس الذكي</h1>
        <p className="mt-2 text-sm text-muted-foreground">اختر طالباً وموضوعاً لتبدأ بتحضير منظّم.</p>
      </div>

      <Card className="rounded-lg border-border/70 p-5 shadow-none sm:p-6">
        <form onSubmit={generateLesson} className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr_auto] lg:items-end">
          <label className="relative block space-y-2 text-sm font-semibold">
            اسم الطالب
            <select
              value={selectedStudentId}
              onChange={(event) => onStudentChange(event.target.value)}
              className="h-11 w-full appearance-none rounded-lg border border-input bg-background px-3 pl-9 text-sm font-normal outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {students.length === 0 ? <option value="">أضف طالباً أولاً</option> : students.map((student) => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute left-3 top-[42px] size-4 text-muted-foreground" aria-hidden="true" />
          </label>
          <label className="block space-y-2 text-sm font-semibold">
            موضوع الدرس
            <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="مثال: في المطار، الطعام، التعارف..." className="h-11 rounded-lg bg-background text-sm font-normal" />
          </label>
          <Button type="submit" size="lg" disabled={!selectedStudent || !topic.trim()} className="h-11 px-5">
            <Sparkles aria-hidden="true" />
            توليد الدرس الذكي
          </Button>
        </form>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">درس تجريبي · {lesson.studentName}</p>
          <h2 className="mt-1 text-xl font-bold">{lesson.title}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={isSaved ? "secondary" : "outline"} onClick={() => onSave(lesson)} disabled={isSaved}>
            {isSaved ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
            {isSaved ? "تم الحفظ" : "حفظ الدرس"}
          </Button>
          <Button type="button" onClick={onDisplay}>
            <BookOpen aria-hidden="true" />
            وضع العرض للطالب
          </Button>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg border-border/70 p-5 shadow-none sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-primary">اقرأ بصوتٍ واضح</p>
              <h3 className="mt-1 text-lg font-bold">نص القراءة</h3>
            </div>
            <span className="rounded-full bg-sage/50 px-3 py-1 text-xs font-medium text-primary">مُشكّل</span>
          </div>
          <p dir="rtl" className="arabic-reading mt-5 text-right">{lesson.reading}</p>
        </Card>
        <Card className="rounded-lg border-border/70 bg-sky/20 p-5 shadow-none sm:p-6">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-md bg-sky text-sky-strong">
              <BookOpenText className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold text-sky-strong">المعنى بالإنجليزية</p>
              <h3 className="mt-0.5 text-lg font-bold">Translation</h3>
            </div>
          </div>
          <p dir="ltr" className="mt-5 text-left text-base leading-8 text-foreground/85">{lesson.translation}</p>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-primary">كلمات من النص</p>
            <h3 className="mt-1 text-lg font-bold">مفردات جديدة</h3>
          </div>
          <span className="text-xs text-muted-foreground">{formatNumber(lesson.vocabulary.length)} كلمات</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {lesson.vocabulary.map((item) => (
            <Card key={item.word} className="rounded-lg border-border/70 p-4 shadow-none">
              <p className="text-xl font-bold leading-relaxed text-primary">{item.word}</p>
              <p dir="ltr" className="mt-1 text-left text-sm font-medium text-sky-strong">{item.transliteration}</p>
              <p dir="ltr" className="mt-2 border-t border-border/70 pt-2 text-left text-sm text-muted-foreground">{item.meaning}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-primary">تأكّد من الفهم</p>
            <h3 className="mt-1 text-lg font-bold">أسئلة تفاعلية</h3>
          </div>
          {answeredCount > 0 && (
            <span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-primary" aria-live="polite">
              النتيجة: {formatNumber(correctCount)} من {formatNumber(lesson.questions.length)}
            </span>
          )}
        </div>
        <div className="grid gap-3 xl:grid-cols-3">
          {lesson.questions.map((question, questionIndex) => {
            const chosenAnswer = answers[questionIndex];
            const answeredCorrectly = chosenAnswer === question.answerIndex;
            return (
              <Card key={`${lesson.id}-${questionIndex}`} className="rounded-lg border-border/70 p-4 shadow-none sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">{formatNumber(questionIndex + 1)}</span>
                  <h4 className="pt-0.5 text-sm font-semibold leading-6">{question.prompt}</h4>
                </div>
                <div className="mt-4 space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const isChosen = chosenAnswer === optionIndex;
                    const isCorrect = optionIndex === question.answerIndex;
                    const resultStyle = isChosen
                      ? isCorrect
                        ? "border-primary bg-sage/45 text-foreground"
                        : "border-destructive bg-destructive/5 text-foreground"
                      : "border-border bg-background hover:bg-muted";
                    return (
                      <Button
                        key={option}
                        type="button"
                        variant="outline"
                        aria-pressed={isChosen}
                        className={`h-auto min-h-10 w-full justify-start whitespace-normal px-3 py-2 text-right text-sm leading-6 shadow-none ${resultStyle}`}
                        onClick={() => setAnswers((previous) => ({ ...previous, [questionIndex]: optionIndex }))}
                      >
                        <span className="grid size-5 shrink-0 place-items-center rounded-full border border-current/30 text-[10px]">{String.fromCharCode(0x0623 + optionIndex)}</span>
                        {option}
                      </Button>
                    );
                  })}
                </div>
                {chosenAnswer !== undefined && (
                  <p className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${answeredCorrectly ? "text-primary" : "text-destructive"}`} aria-live="polite">
                    {answeredCorrectly ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <CircleHelp className="size-4" aria-hidden="true" />}
                    {answeredCorrectly ? "إجابة صحيحة" : "حاول مرة أخرى"}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card p-4">
        <p className="text-sm text-muted-foreground">هل تريد الاحتفاظ بهذا الدرس؟</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => onNavigate("library")}>
            <Library aria-hidden="true" /> المكتبة
          </Button>
          <Button type="button" variant={isSaved ? "secondary" : "default"} onClick={() => onSave(lesson)} disabled={isSaved}>
            {isSaved ? <Check aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
            {isSaved ? "تم الحفظ" : "حفظ الدرس"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StudentDisplay({ lesson, onExit }: { lesson: Lesson; onExit: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background" dir="rtl">
      <header className="sticky top-0 z-10 flex min-h-[68px] items-center justify-between gap-3 border-b border-border/70 bg-background/95 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground"><BookOpenText className="size-5" aria-hidden="true" /></div>
          <div>
            <p className="text-sm font-bold">{lesson.title}</p>
            <p className="text-xs text-muted-foreground">{lesson.studentName} · وضع العرض</p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={onExit}>
          <X aria-hidden="true" />
          إنهاء العرض
        </Button>
      </header>
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-7 sm:px-8 sm:py-10">
        <Card className="rounded-lg border-border/70 p-6 shadow-none sm:p-10">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary"><BookOpen aria-hidden="true" /> نقرأ معاً</div>
          <p dir="rtl" className="display-reading mt-6 text-right">{lesson.reading}</p>
        </Card>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card className="rounded-lg border-border/70 bg-sky/20 p-5 shadow-none sm:p-7">
            <p className="text-sm font-semibold text-sky-strong">English translation</p>
            <p dir="ltr" className="mt-3 text-left text-lg leading-8">{lesson.translation}</p>
          </Card>
          <Card className="rounded-lg border-border/70 p-5 shadow-none sm:p-7">
            <p className="text-sm font-semibold text-primary">مفردات جديدة</p>
            <div className="mt-4 space-y-3">
              {lesson.vocabulary.map((item) => (
                <div key={item.word} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <span className="text-xl font-bold">{item.word}</span>
                  <span dir="ltr" className="text-sm text-muted-foreground">{item.transliteration} · {item.meaning}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function DiacriticsPage() {
  const [inputText, setInputText] = useState("أنا أحب اللغة العربية");
  const [outputText, setOutputText] = useState(() => applyMockDiacritics("أنا أحب اللغة العربية"));
  const [copied, setCopied] = useState(false);

  const shapeText = () => {
    const result = applyMockDiacritics(inputText.trim());
    setOutputText(result);
    setCopied(false);
  };

  const useExample = (example: string) => {
    setInputText(example);
    setOutputText(applyMockDiacritics(example));
    setCopied(false);
  };

  const copyText = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">كلمات واضحة في لحظتها</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">أداة التشكيل السريع</h1>
        <p className="mt-2 text-sm text-muted-foreground">اكتب الجملة التي تريد عرضها، ثم اعرض تشكيلها بحجم كبير.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <Card className="rounded-lg border-border/70 p-5 shadow-none sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">النص الأصلي</h2>
              <p className="mt-1 text-xs text-muted-foreground">المعاينة التجريبية متاحة للكلمات الشائعة.</p>
            </div>
            <span className="rounded-full bg-sun/70 px-3 py-1 text-xs font-medium text-sun-strong">تجريبي</span>
          </div>
          <Textarea
            dir="rtl"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="اكتب كلمة أو جملة بالعربية..."
            aria-label="النص المراد تشكيله"
            className="mt-5 min-h-52 rounded-lg bg-background text-lg leading-8"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: "اللغة العربية", value: "أنا أحب اللغة العربية" },
              { label: "تحية صباحية", value: "صباح الخير" },
              { label: "في المطار", value: "أين المطار؟" },
            ].map((sample) => (
              <Button key={sample.label} type="button" variant="outline" size="sm" onClick={() => useExample(sample.value)}>{sample.label}</Button>
            ))}
          </div>
          <Button type="button" className="mt-5 w-full" size="lg" disabled={!inputText.trim()} onClick={shapeText}>
            <TextCursorInput aria-hidden="true" />
            تشكيل النص
          </Button>
        </Card>

        <Card className="flex min-h-[360px] flex-col rounded-lg border-border/70 bg-sage/25 p-5 shadow-none sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-primary">للعرض أثناء الحصة</p>
              <h2 className="mt-1 font-bold">النص المُشكّل</h2>
            </div>
            <Button type="button" variant="outline" size="sm" disabled={!outputText} onClick={copyText}>
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied ? "تم النسخ" : "نسخ النص"}
            </Button>
          </div>
          <div className="my-auto py-10">
            {outputText ? (
              <p dir="rtl" className="arabic-reading text-center">{outputText}</p>
            ) : (
              <p className="text-center text-sm text-muted-foreground">سيظهر النص هنا بعد إدخاله.</p>
            )}
          </div>
          <p className="border-t border-border/70 pt-4 text-xs leading-6 text-muted-foreground">
            الكلمات غير الموجودة في قاموس التجربة تبقى كما كُتبت.
          </p>
        </Card>
      </div>
    </div>
  );
}

function LibraryPage({ lessons, onOpen }: { lessons: Lesson[]; onOpen: (lesson: Lesson) => void }) {
  const [query, setQuery] = useState("");
  const filteredLessons = lessons.filter((lesson) =>
    `${lesson.title} ${lesson.studentName} ${lesson.topic}`.toLocaleLowerCase("ar").includes(query.trim().toLocaleLowerCase("ar")),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">دروسك في مكان واحد</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">مكتبة الدروس المحفوظة</h1>
          <p className="mt-2 text-sm text-muted-foreground">افتح درساً سابقاً أو ابحث عن موضوع يناسب حصتك القادمة.</p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-primary">{formatNumber(lessons.length)} دروس</span>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن عنوان أو طالب..." aria-label="البحث في مكتبة الدروس" className="h-11 rounded-lg border-border/80 bg-card pr-10" />
      </div>

      {filteredLessons.length === 0 ? (
        <Card className="rounded-lg border-dashed border-border p-10 text-center shadow-none">
          <Library className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-semibold">لا توجد دروس مطابقة</p>
          <p className="mt-1 text-sm text-muted-foreground">جرّب البحث بكلمة أخرى.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredLessons.map((lesson, index) => (
            <Card key={lesson.id} className="flex flex-col rounded-lg border-border/70 p-5 shadow-none">
              <div className="flex items-start justify-between gap-3">
                <div className={`grid size-10 place-items-center rounded-lg ${index % 3 === 0 ? "bg-sage text-primary" : index % 3 === 1 ? "bg-sky text-sky-strong" : "bg-coral text-coral-strong"}`}>
                  <BookOpenText className="size-5" aria-hidden="true" />
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{lesson.createdAt}</span>
              </div>
              <h2 className="mt-4 text-lg font-bold leading-7">{lesson.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{lesson.studentName}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{lesson.vocabulary.length} مفردات</span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{lesson.questions.length} أسئلة</span>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">{lesson.reading}</p>
              <Button type="button" variant="outline" className="mt-5 w-full" onClick={() => onOpen(lesson)}>
                <BookOpen aria-hidden="true" />
                فتح الدرس
                <ArrowLeft aria-hidden="true" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
