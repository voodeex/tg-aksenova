export type EducationRecord = {
  id: string;
  index: string;
  year: number;
  institution: string;
  fieldLabel: "Специальность" | "Направление";
  field: string;
  qualification: string;
};

export const education: EducationRecord[] = [
  {
    id: "mesi",
    index: "01",
    year: 2013,
    institution: "Московский государственный университет экономики, статистики и информатики (МЭСИ)",
    fieldLabel: "Специальность",
    field: "Прикладная информатика (в менеджменте)",
    qualification: "Информатик-менеджер",
  },
  {
    id: "sga",
    index: "02",
    year: 2013,
    institution: "Современная гуманитарная академия (НАЧОУ ВПО)",
    fieldLabel: "Направление",
    field: "Экономика",
    qualification: "Бакалавр экономики",
  },
];
