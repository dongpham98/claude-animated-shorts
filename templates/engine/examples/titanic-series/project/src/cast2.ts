// Episode 2 cast additions. Appearance notes:
// - J. Bruce Ismay (49): chairman of White Star Line; dark hair, dark moustache, dark suit.
// - Charles Lightoller (38): Second Officer; clean-shaven, officer's uniform and cap.
// - Rev. Ernest Carter (54): Anglican vicar; grey hair, clerical collar, dark suit.
// - Daisy Spedden (39): first class; Edwardian dress, large hat.
// - Frederick Barrett (28): leading fireman; work clothes, coal-dusted.
import { PAL } from "./style";
import type { Spec } from "./chibi";

export const ISMAY: Spec = { id: "ismay", name: "J. Bruce Ismay", skin: PAL.skinLight, hair: PAL.hairDark, hairStyle: "sidepart", beard: "moustache", beardColor: PAL.hairDark, outfit: "suit", main: "#2b2c35", mainDark: "#1f2027", scale: 1.05 };
export const LIGHTOLLER: Spec = { id: "lightoller", name: "Charles Lightoller", skin: PAL.skinMid, hair: PAL.hairBrown, hairStyle: "short", outfit: "officer", main: PAL.navy, mainDark: PAL.navyDark, hat: "captain", scale: 1.0 };
export const CARTER: Spec = { id: "carter", name: "Rev. Ernest Carter", skin: PAL.skinLight, hair: "#b9b2a6", hairStyle: "sidepart", outfit: "suit", main: "#26232a", mainDark: "#1a181d", collar: true, scale: 1.0 };
export const DAISY: Spec = { id: "daisy", name: "Daisy Spedden", skin: PAL.skinLight, hair: PAL.hairBrown, hairStyle: "updo", outfit: "dress", main: "#c9b48a", mainDark: "#a8936a", hat: "bighat", hatColor: "#6b5a3c", female: true, scale: 0.95 };
export const BARRETT: Spec = { id: "barrett", name: "Frederick Barrett", skin: PAL.skinMid, hair: PAL.hairDark, hairStyle: "short", outfit: "crew", main: "#55535a", mainDark: "#3e3d42", prop: "shovel", scale: 1.0 };
export const BEESLEY: Spec = { id: "beesley", name: "Lawrence Beesley", skin: PAL.skinLight, hair: PAL.hairBrown, hairStyle: "sidepart", beard: "moustache", beardColor: PAL.hairBrown, outfit: "suit", main: "#4a4a5a", mainDark: "#34343f", scale: 1.0 };
