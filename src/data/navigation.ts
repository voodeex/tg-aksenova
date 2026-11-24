export type NavItem = {
  id: string;
  label: string;
  index: string;
  /** id DOM-секции, к которой ведёт якорь */
  target: string;
  /** секции, при которых пункт считается активным */
  sections: string[];
};

export const navItems: NavItem[] = [
  { id: "home", label: "Главная", index: "01", target: "home", sections: ["home"] },
  { id: "about", label: "О преподавателе", index: "02", target: "about", sections: ["about"] },
  { id: "education", label: "Образование", index: "03", target: "education", sections: ["education"] },
  { id: "development", label: "Развитие", index: "04", target: "development", sections: ["development", "archive", "expertise"] },
  { id: "awards", label: "Награды", index: "05", target: "awards", sections: ["awards", "degree"] },
  { id: "contact", label: "Контакты", index: "06", target: "contact", sections: ["contact"] },
];
