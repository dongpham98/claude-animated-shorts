// Real people of the Titanic, as chibi puppets. Appearance notes (to keep checking in research):
// - Captain Edward J. Smith (62): white full beard and hair; dark navy service uniform, double-breasted, gold buttons,
//   gold rings at the cuffs, peaked cap with badge (dark uniform in the departure photos, 10 April 1912).
// - Thomas Andrews (39): Harland & Wolff shipbuilder; clean-shaven (shaved his moustache in 1901), dark hair,
//   nearly six feet tall and broad-shouldered; dark suit; carries the ship's plans.
// - Wallace Hartley (33): bandleader and violinist; moustache, brown hair; band uniform with green facings.
// - Margaret "Molly" Brown (44): first-class passenger; Edwardian dress and a large hat.
import { PAL } from "./style";
import type { Spec } from "./chibi";

export const SMITH: Spec = {
  id: "smith", name: "Captain Edward J. Smith", skin: PAL.skinMid, hair: PAL.hairWhite, hairStyle: "short",
  beard: "full", beardColor: PAL.hairWhite, outfit: "captain", main: PAL.navy, mainDark: PAL.navyDark,
  hat: "captain", scale: 1.04,
};
export const ANDREWS: Spec = {
  id: "andrews", name: "Thomas Andrews", skin: PAL.skinLight, hair: PAL.hairDark, hairStyle: "sidepart",
  outfit: "suit", main: PAL.suit, mainDark: PAL.suitDark, prop: "plans", scale: 1.06,
};
export const HARTLEY: Spec = {
  id: "hartley", name: "Wallace Hartley", skin: PAL.skinLight, hair: PAL.hairBrown, hairStyle: "short",
  beard: "moustache", beardColor: PAL.hairBrown, outfit: "band", main: PAL.bandJacket, mainDark: PAL.navyDark,
  trim: PAL.bandGreen, prop: "violin", scale: 0.98,
};
export const BROWN: Spec = {
  id: "brown", name: "Margaret \"Molly\" Brown", skin: PAL.skinLight, hair: PAL.hairAuburn, hairStyle: "updo",
  outfit: "dress", main: PAL.dressPlum, mainDark: "#5b3168", hat: "bighat", hatColor: "#4e3a63", female: true, scale: 0.96,
};
/** Andrews on the maiden voyage: notebook of improvements (steward Henry Etches, US inquiry: "making notes of improvements") */
export const ANDREWS_NB: Spec = { ...ANDREWS, prop: "notebook" };
export const CAST = [SMITH, ANDREWS, HARTLEY, BROWN];
