import { programs, type Program, type TopicId } from "./development";

export type Topic = {
  id: TopicId;
  label: string;
  /** позиция сферы в орбитальном созвездии — сбалансирована для идеального разделения подписей */
  position: [number, number, number];
};

/**
 * Направления, отражённые в документах о повышении квалификации.
 * Это карта документально подтверждённых тем обучения, а не заявление об экспертном уровне.
 */
export const topics: Topic[] = [
  { id: "digital-edu", label: "Цифровое образование", position: [0.0, 0.15, 0.5] },
  { id: "figma", label: "Figma", position: [-1.4, 2.35, 0.4] },
  { id: "elearning", label: "Электронное обучение", position: [0.65, 2.1, -0.4] },
  { id: "moodle", label: "Moodle", position: [2.25, 1.5, 0.2] },
  { id: "ai", label: "Искусственный интеллект", position: [2.45, 0.25, -0.7] },
  { id: "python", label: "Python", position: [2.1, -1.05, 0.6] },
  { id: "it", label: "Информационные технологии", position: [0.85, -1.35, -0.2] },
  { id: "blockchain", label: "Блокчейн", position: [1.55, -2.35, -0.8] },
  { id: "1c", label: "1С:Предприятие", position: [-0.25, -2.55, -0.6] },
  { id: "infosec", label: "Информационная безопасность", position: [-1.75, -2.15, 0.5] },
  { id: "3d", label: "3D-моделирование", position: [-2.75, -1.05, -0.5] },
  { id: "vrar", label: "VR / AR", position: [-1.5, -0.65, 0.9] },
  { id: "communication", label: "Коммуникации", position: [-2.85, 0.55, 0.3] },
  { id: "pedagogy", label: "Педагогика", position: [-2.15, 1.65, -0.3] },
];

export const topicLinks: [TopicId, TopicId][] = [
  ["digital-edu", "elearning"],
  ["digital-edu", "pedagogy"],
  ["digital-edu", "it"],
  ["digital-edu", "vrar"],
  ["digital-edu", "figma"],
  ["elearning", "moodle"],
  ["pedagogy", "communication"],
  ["pedagogy", "elearning"],
  ["it", "python"],
  ["it", "infosec"],
  ["it", "blockchain"],
  ["it", "1c"],
  ["python", "ai"],
  ["ai", "digital-edu"],
  ["vrar", "3d"],
  ["3d", "figma"],
  ["blockchain", "infosec"],
];

export function programsForTopic(id: TopicId): Program[] {
  return programs.filter((p) => p.topics.includes(id)).sort((a, b) => b.year - a.year);
}

export const topicCounts: Record<TopicId, number> = topics.reduce(
  (acc, t) => {
    acc[t.id] = programsForTopic(t.id).length;
    return acc;
  },
  {} as Record<TopicId, number>,
);
