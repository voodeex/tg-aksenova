/**
 * Повышение квалификации и профессиональная переподготовка (2007–2026).
 * Названия программ и организаций сохранены дословно по исходным данным.
 */

export type CategoryId = "tech" | "pedagogy" | "security" | "skills";

export type TopicId =
  | "digital-edu"
  | "it"
  | "python"
  | "ai"
  | "infosec"
  | "vrar"
  | "3d"
  | "pedagogy"
  | "communication"
  | "elearning"
  | "figma"
  | "blockchain"
  | "1c"
  | "moodle";

export type Program = {
  id: string;
  year: number;
  /** null — название программы не указано в документе */
  title: string | null;
  organization: string;
  categories: CategoryId[];
  topics: TopicId[];
};

export const categories: { id: "all" | CategoryId; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "tech", label: "Технологии" },
  { id: "pedagogy", label: "Педагогика" },
  { id: "security", label: "Безопасность" },
  { id: "skills", label: "Профессиональные навыки" },
];

export const categoryLabel: Record<CategoryId, string> = {
  tech: "Технологии",
  pedagogy: "Педагогика",
  security: "Безопасность",
  skills: "Профессиональные навыки",
};

const FU = "Финансовый университет при Правительстве Российской Федерации";
const STK = "Серпуховской технический колледж";
const MESI = "Московский государственный университет экономики, статистики и информатики (МЭСИ)";

let n = 0;
const p = (
  year: number,
  title: string | null,
  organization: string,
  categories: CategoryId[],
  topics: TopicId[] = [],
): Program => ({ id: `p${year}-${++n}`, year, title, organization, categories, topics });

export const programs: Program[] = [
  // 2026
  p(2026, "Кибербезопасность работника Финансового университета: практические правила безопасной работы.", FU, ["security"], ["infosec"]),
  p(2026, "Figma с нуля для контента и презентаций.", FU, ["tech", "skills"], ["figma", "digital-edu"]),
  p(2026, "Повышение мотивации обучающихся через создание ситуации успеха в образовательной деятельности СПО.", FU, ["pedagogy"], ["pedagogy"]),
  p(2026, "Защита персональных данных в организации.", FU, ["security"], ["infosec"]),
  p(2026, "Коммуникативные компетенции преподавателя.", FU, ["skills", "pedagogy"], ["communication"]),
  p(2026, "Эмоциональный интеллект как системный элемент профессиональной компетентности преподавателя.", FU, ["skills", "pedagogy"], ["communication", "pedagogy"]),
  p(2026, "Профилактика эмоционального выгорания работников образовательной сферы.", FU, ["skills"], ["communication"]),

  // 2025
  p(2025, "Подготовка работников Финансового университета по вопросам гражданской обороны и защиты от чрезвычайных ситуаций.", FU, ["security"]),
  p(2025, "Основы 3D моделирования и графики: практический курс.", FU, ["tech"], ["3d"]),
  p(2025, "Применение VR/AR технологий в образовании, науке и киберспорте.", FU, ["tech"], ["vrar", "digital-edu"]),
  p(2025, "Мастер создания учебных презентаций.", FU, ["tech", "skills"], ["digital-edu"]),

  // 2024
  p(2024, "Технические средства в образовательном процессе.", FU, ["tech", "pedagogy"], ["digital-edu"]),
  p(2024, "Лидеры ППС: из педагога в наставники. Модуль 1.", FU, ["pedagogy"], ["pedagogy"]),
  p(2024, "Эффективная воспитательная работа в вузе: на пути из педагога в наставники.", FU, ["pedagogy"], ["pedagogy"]),
  p(2024, "Путь к интеллекту.", FU, ["skills"], ["ai"]),
  p(2024, "Основы информационной безопасности. Базовый уровень.", FU, ["security"], ["infosec", "it"]),
  p(2024, "Цифровой куратор: сопровождение обучающихся в цифровой образовательной среде.", FU, ["pedagogy", "tech"], ["digital-edu", "elearning"]),
  p(2024, "Технология распределенных реестров. Блокчейн.", FU, ["tech"], ["blockchain", "it"]),
  p(2024, "Информационные технологии в профессиональной деятельности. Основы работы в ПО «1С:Предприятие».", FU, ["tech"], ["1c", "it"]),

  // 2023
  p(2023, "Выстраивание методологических подходов защиты работ ВКР в формате «Стартап как диплом».", FU, ["pedagogy"], ["pedagogy"]),
  p(2023, "Использование интернет-сервисов для формирования эффективного образовательного контента.", FU, ["tech", "pedagogy"], ["digital-edu", "elearning"]),
  p(2023, "Оказание первой помощи в образовательной организации.", FU, ["security"]),
  p(2023, "Особенности организации образовательного процесса и доступной среды для обучающихся с инвалидностью и ограниченными возможностями здоровья в образовательной организации.", FU, ["pedagogy"], ["pedagogy"]),

  // 2022
  p(2022, "Опыт разработки и применения дистанционных образовательных технологий в высшем образовании (Astra Linux, LibreOffice).", FU, ["tech", "pedagogy"], ["elearning", "it", "digital-edu"]),
  p(2022, "Профессиональное развитие педагога в цифровой среде.", FU, ["pedagogy", "tech"], ["digital-edu", "pedagogy"]),

  // 2021
  p(2021, "Инновации в технологиях разработки и применения презентаций в образовательной деятельности.", FU, ["tech", "pedagogy"], ["digital-edu"]),
  p(2021, "Разработка электронных курсов в СДО Moodle.", FU, ["tech", "pedagogy"], ["moodle", "elearning"]),
  p(2021, "Python для анализа данных.", FU, ["tech"], ["python", "it", "ai"]),

  // 2019
  p(2019, "Практика и методика реализации образовательных программ среднего профессионального образования с учетом спецификации стандартов Ворлдскиллс по компетенции «Программные решения для бизнеса».", "Колледж предпринимательства № 11", ["pedagogy", "tech"], ["pedagogy", "it"]),
  p(2019, "Оказание первой помощи в образовательной организации.", FU, ["security"]),
  p(2019, "Современные информационно-коммуникационные технологии в образовательной деятельности.", FU, ["tech", "pedagogy"], ["digital-edu", "it"]),

  // 2018
  p(2018, "Стажировка по профессии «Программист».", "Национальное агентство развития квалификаций", ["tech", "skills"], ["it"]),
  p(2018, "Технологии командной разработки программного обеспечения информационных систем.", "Национальный Открытый Университет «ИНТУИТ»", ["tech"], ["it"]),

  // 2015
  p(2015, "Современное вузовское образование: педагогика, психология, методика.", FU, ["pedagogy"], ["pedagogy"]),

  // 2013
  p(2013, null, STK, ["skills"]),

  // 2009
  p(2009, "Английский язык. Уровень Intermediate.", MESI, ["skills"], ["communication"]),

  // 2007
  p(2007, "Бухгалтер с навыками работы в ПЭВМ.", STK, ["skills", "tech"]),
];

export const UNTITLED_PROGRAM = "Название программы не указано.";

export type YearGroup = { year: number; programs: Program[] };

export function groupByYear(list: Program[]): YearGroup[] {
  const map = new Map<number, Program[]>();
  for (const item of list) {
    const bucket = map.get(item.year) ?? [];
    bucket.push(item);
    map.set(item.year, bucket);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, items]) => ({ year, programs: items }));
}

export function filterPrograms(category: "all" | CategoryId): Program[] {
  return category === "all" ? programs : programs.filter((x) => x.categories.includes(category));
}

export const TIMELINE_START = 2007;
export const TIMELINE_END = 2026;

/** Русские формы множественного числа: 1 программа, 2 программы, 5 программ. */
export function plural(count: number, forms: [string, string, string]): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}
