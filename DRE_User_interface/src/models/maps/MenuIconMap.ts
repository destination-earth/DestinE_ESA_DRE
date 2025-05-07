import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faBox, faSun, faWind, faChartLine, faDashboard,
         faGlobe,faCheck, faQuestion, faMoneyBill, faBook } from "@fortawesome/free-solid-svg-icons";

export const MenuIconMap: Record<string, IconDefinition> = {
  "solar-icon-menu": faSun,
  "wind-icon": faWind,
  "hybrid-icon": faBox,
  "chart-icon": faChartLine,
  "dashboard": faDashboard,
  "globe":faGlobe,
  "check":faCheck,
  "question":faQuestion,
  "money":faMoneyBill,
  "book":faBook
};
