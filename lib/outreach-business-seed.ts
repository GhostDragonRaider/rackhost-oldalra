/** Alap vállalkozás-címlista az Ügyfélszerzéshez (commitolt seed). */

export type SeedBusiness = {
  company: string;
  email: string;
  location: string;
};

export const OUTREACH_BUSINESS_SEED: SeedBusiness[] = [
  {
    company: "Tamások Használtautó",
    email: "zsta@freemail.hu",
    location: "4027 Debrecen, Böszörményi út 66.",
  },
  {
    company: "Origo Play Kft.",
    email: "origoplay@freemail.hu",
    location: "6070 Izsák, Madách Imre u. 27.",
  },
  {
    company: "Cseko-Bau Bt.",
    email: "tiborkulcsar@freemail.hu",
    location: "8154 Polgárdi, Batthyány u. 18.",
  },
  {
    company: "V. Autóudvar",
    email: "v.auto@visdata.hu",
    location: "8600 Siófok, Vak Bottyán u. 32.",
  },
  {
    company: "Mészáros Team Kft.",
    email: "meszaros.fenyezo@freemail.hu",
    location: "6000 Kecskemét, Dunaföldvári út 52/B.",
  },
];
