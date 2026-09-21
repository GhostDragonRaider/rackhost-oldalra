import { Article } from "./types";
import { articleArak2026 } from "./content/weboldal-keszites-arak-2026";
import { articleWeboldalVagyWebshop } from "./content/weboldal-vagy-webshop";
import { articleSzolgaltatoi } from "./content/szolgaltatoi-weboldal-elemei";
import { articleEgyediVsSablon } from "./content/egyedi-fejlesztes-vs-sablon";
import { articleSeoAlapok } from "./content/seo-alapok-uj-weboldalhoz";
import { articleInditasChecklist } from "./content/weboldal-inditas-checklist";
import { articleWordpressBuilder } from "./content/wordpress-builder-vagy-egyedi";
import { articleMennyiIdo } from "./content/mennyi-ido-alatt-keszul-el-egy-weboldal";
import { articleFenntartas } from "./content/weboldal-fenntartas-koltsege";
import { articleGoogleLatja } from "./content/google-latja-e-a-weboldalad";
import { articleTechnikaiSeo } from "./content/mi-az-a-technikai-seo";

export type { Article, ArticleBlock, ArticleSection } from "./types";
export { parseInlineLinks } from "./types";

/** Hub order: purchase guides → practical → technical. */
export const ARTICLES: Article[] = [
  articleArak2026,
  articleWeboldalVagyWebshop,
  articleSzolgaltatoi,
  articleEgyediVsSablon,
  articleWordpressBuilder,
  articleMennyiIdo,
  articleFenntartas,
  articleSeoAlapok,
  articleInditasChecklist,
  articleGoogleLatja,
  articleTechnikaiSeo,
];

export function getArticle(slug: string) {
  return ARTICLES.find((article) => article.slug === slug);
}
