// Episode 1 cast (real people; appearance generic where photos don't settle it, period-correct clothing).
import { PAL } from "./style";
import type { Spec } from "./chibi";

/** Fr Francis Browne SJ (32): Jesuit student, dark clerical suit and collar, box camera */
export const BROWNE: Spec = { id: "browne", name: "Francis Browne", skin: PAL.skinLight, hair: PAL.hairDark, hairStyle: "sidepart", outfit: "suit", main: "#26232a", mainDark: "#1a181d", collar: true, prop: "camera", scale: 0.98 };
export const BROWNE_NC: Spec = { ...BROWNE, id: "browne2", prop: undefined };
/** steward Richard Geddes, white steward's jacket */
export const GEDDES: Spec = { id: "geddes", name: "Richard Geddes", skin: PAL.skinMid, hair: PAL.hairBrown, hairStyle: "short", outfit: "crew", main: "#f1ece2", mainDark: "#d2c7b4", scale: 0.95 };
export const SPEDDEN_F: Spec = { id: "fspedden", name: "Frederic Spedden", skin: PAL.skinLight, hair: PAL.hairBrown, hairStyle: "short", beard: "moustache", beardColor: PAL.hairBrown, outfit: "suit", main: "#6b6f7d", mainDark: "#4f5260", scale: 1.0 };
export const DOUGLAS: Spec = { id: "douglas", name: "Douglas Spedden", skin: PAL.skinLight, hair: "#c9a46a", hairStyle: "short", outfit: "suit", main: "#2c3a5e", mainDark: "#1d2742", scale: 0.6 };
export const NAVRATIL: Spec = { id: "navratil", name: "Michel Navratil", skin: PAL.skinMid, hair: PAL.hairDark, hairStyle: "sidepart", beard: "moustache", beardColor: PAL.hairDark, outfit: "suit", main: "#5a4a3c", mainDark: "#3e3229", scale: 1.0 };
export const MICHEL: Spec = { id: "michel", name: "Michel", skin: PAL.skinLight, hair: "#3a2a20", hairStyle: "short", outfit: "suit", main: "#c9b48a", mainDark: "#a8936a", scale: 0.56 };
export const EDMOND: Spec = { ...MICHEL, id: "edmond", name: "Edmond", main: "#9fb6c9", mainDark: "#7f96a9", scale: 0.48 };
export const JOHN_SAGE: Spec = { id: "jsage", name: "John Sage", skin: PAL.skinMid, hair: PAL.hairBrown, hairStyle: "short", beard: "moustache", beardColor: PAL.hairBrown, outfit: "suit", main: "#4a4a3c", mainDark: "#34342a", scale: 1.0 };
export const ANNIE_SAGE: Spec = { id: "asage", name: "Annie Sage", skin: PAL.skinLight, hair: PAL.hairDark, hairStyle: "updo", outfit: "dress", main: "#5a6a4f", mainDark: "#45523c", female: true, scale: 0.95 };
const kid = (i: number, female: boolean, sc: number): Spec => ({
  id: `sage${i}`, name: "", skin: i % 2 ? PAL.skinLight : PAL.skinMid, hair: [PAL.hairBrown, PAL.hairDark, "#8a5a3a"][i % 3], hairStyle: female ? "updo" : "short",
  outfit: female ? "dress" : "suit", main: ["#6b5a7a", "#5a6f8f", "#7a5a4a", "#4f6a5a"][i % 4], mainDark: "#3e3a40", female, scale: sc,
});
/** 9 Sage children, oldest to youngest (Stella, George, Douglas, Frederick, Dorothy, Anthony, Elizabeth, Constance, Thomas) */
export const SAGE_KIDS: Spec[] = [kid(1, true, 0.9), kid(2, false, 0.92), kid(3, false, 0.88), kid(4, false, 0.82), kid(5, true, 0.74), kid(6, false, 0.68), kid(7, true, 0.62), kid(8, true, 0.58), kid(9, false, 0.5)];
export const ASTOR: Spec = { id: "astor", name: "John Jacob Astor", skin: PAL.skinLight, hair: PAL.hairBrown, hairStyle: "sidepart", beard: "moustache", beardColor: PAL.hairBrown, outfit: "suit", main: "#2b2c35", mainDark: "#1f2027", scale: 1.04 };
export const MADELEINE: Spec = { id: "madeleine", name: "Madeleine Astor", skin: PAL.skinLight, hair: PAL.hairDark, hairStyle: "updo", outfit: "dress", main: "#c9a9c6", mainDark: "#a585a2", hat: "bighat", hatColor: "#5a3a5e", female: true, scale: 0.94 };
export const BRIDE: Spec = { id: "bride", name: "Harold Bride", skin: PAL.skinLight, hair: PAL.hairBrown, hairStyle: "sidepart", outfit: "marconi", main: "#26304a", mainDark: "#1b2236", trim: "#3b4a72", headphones: true, scale: 0.9 };
export const FIREMAN = (i: number): Spec => ({ id: `fire${i}`, name: "", skin: [PAL.skinMid, PAL.skinLight, PAL.skinTan][i % 3], hair: [PAL.hairDark, PAL.hairBrown, "#2a201a"][i % 3], hairStyle: "short", outfit: "crew", main: "#55535a", mainDark: "#3a383e", prop: "shovel", scale: 0.98 });
export const RICH_M: Spec = { id: "richm", name: "", skin: PAL.skinLight, hair: PAL.hairWhite, hairStyle: "short", beard: "full", beardColor: PAL.hairWhite, outfit: "suit", main: "#2b2c35", mainDark: "#1f2027", scale: 1.02 };
export const RICH_W: Spec = { id: "richw", name: "", skin: PAL.skinLight, hair: "#b9a58a", hairStyle: "updo", outfit: "dress", main: "#3f6a5a", mainDark: "#2f5044", hat: "bighat", hatColor: "#2f5044", female: true, scale: 0.95 };
export const WORKER = (i: number): Spec => ({ id: `wk${i}`, name: "", skin: [PAL.skinMid, PAL.skinLight][i % 2], hair: [PAL.hairBrown, PAL.hairDark][i % 2], hairStyle: "short", outfit: "crew", main: "#5a4a3c", mainDark: "#3e3229", hat: "sailor", hatColor: "#3a3030", scale: 0.95 });
export const EMIGRANT = (i: number): Spec => ({ id: `em${i}`, name: "", skin: PAL.skinLight, hair: [PAL.hairAuburn, PAL.hairDark, PAL.hairBrown][i % 3], hairStyle: i % 2 ? "updo" : "short", outfit: i % 2 ? "dress" : "suit", main: ["#5a6a4f", "#6b5a4a", "#4f5a6f"][i % 3], mainDark: "#3a3a34", female: i % 2 === 1, scale: 0.9 });
