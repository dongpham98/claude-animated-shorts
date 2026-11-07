// Titanic character bible -> toon Outfits (approved bible, Nov 2026). Officers share the navy greatcoat; read them by
// face (Smith: white beard; Murdoch: clean-shaven, calm; Lightoller: stern, thin moustache-free; Lowe: youngest,
// lighter skin tone; Rostron: Cunard captain, small moustache) and by the name label on first appearance.
import { Outfit, SKINS, FrontOpts } from "./toon";

const NAVY = "#24305a", NAVY_D = "#1b2340", GOLD = "#e8c45a";
const officer = (extra: Partial<Outfit>): Outfit => ({ jacket: NAVY, dress: NAVY, coat: true, pants: NAVY_D, boots: "#17141c", hat: "peak",
  cap: "#1f2740", buttons: GOLD, ...extra });

export type CastDef = { name: string; role: string; o: Outfit; opts: FrontOpts };
export const CAST: Record<string, CastDef> = {
  clipboard: { name: "Clipboard", role: "our guide (original)", o: { jacket: "#2f4f8f", pants: "#22263a", boots: "#17141c", hat: "peak", cap: "#2f4f8f",
    band: "#c0353a", buttons: GOLD, skin: SKINS[2] }, opts: { expr: "grin", mode: "stand", prop: "clipboard", seed: 31, facing: 1 } },
  clipboardStamp: { name: "Clipboard", role: "verdict pose", o: { jacket: "#2f4f8f", pants: "#22263a", boots: "#17141c", hat: "peak", cap: "#2f4f8f",
    band: "#c0353a", buttons: GOLD, skin: SKINS[2] }, opts: { expr: "stern", mode: "stand", prop: "stamp", seed: 31, facing: -1 } },
  smith: { name: "Captain Smith", role: "the order", o: officer({ build: "stout", beard: "#f1efe9", hairSide: "#f1efe9", skin: SKINS[0], band: "#151a2b" }),
    opts: { expr: "neutral", mode: "stand", seed: 4, facing: 0 } },
  murdoch: { name: "First Officer Murdoch", role: "starboard: women & children FIRST", o: officer({ skin: SKINS[1] }), opts: { expr: "smile", mode: "stand", seed: 12, facing: 1 } },
  lightoller: { name: "Second Officer Lightoller", role: "port: women & children ONLY", o: officer({ skin: SKINS[0] }), opts: { expr: "stern", mode: "stand", seed: 23, facing: -1 } },
  lowe: { name: "Fifth Officer Lowe", role: "boat 14 went back", o: officer({ skin: SKINS[2] }), opts: { expr: "stern", mode: "stand", seed: 44, facing: 1, look: 0.6 } },
  rostron: { name: "Captain Rostron", role: "Carpathia", o: officer({ moustache: "#5a4030", skin: SKINS[1], cap: "#191d2a", band: "#151a2b" }),
    opts: { expr: "smile_closed", mode: "stand", seed: 57, facing: 0 } },
  cottam: { name: "Harold Cottam", role: "Carpathia's wireless", o: { jacket: "#eef0f4", pants: "#3b3f52", boots: "#2a2420", hat: "hair", hair: "#6a4a30",
    headphones: true, skin: SKINS[2] }, opts: { expr: "shock", mode: "stand", seed: 61, facing: 1 } },
  carlisle: { name: "Alexander Carlisle", role: "shipyard designer", o: { jacket: "#6b6f7a", dress: "#6b6f7a", coat: true, pants: "#3b3f52", boots: "#2a2420",
    hat: "hair", hair: "#c9c6c0", moustache: "#e8e4dc", buttons: "#2a2a30", build: "stout", skin: SKINS[0] }, opts: { expr: "smile", mode: "stand", prop: "scroll", seed: 72, facing: 1 } },
  clerk: { name: "The 1894 Rule Clerk", role: "original, where the jokes land", o: { jacket: "#2a2830", dress: "#2a2830", coat: true, pants: "#22202a", boots: "#17141c",
    hat: "bowler", moustache: "#3a2a22", buttons: "#111", skin: SKINS[1] }, opts: { expr: "smile_closed", mode: "stand", prop: "ledger", seed: 83, facing: -1 } },
  cosmo: { name: "Sir Cosmo Duff-Gordon", role: "boat 1", o: { jacket: "#3d3a44", dress: "#3d3a44", coat: true, collar: "#8a6a4a", pants: "#22202a", boots: "#17141c",
    hat: "hair", hair: "#4a3a30", moustache: "#4a3a30", lifebelt: true, buttons: "#222", skin: SKINS[0] }, opts: { expr: "neutral", mode: "stand", seed: 91, facing: 1 } },
  lucy: { name: "Lady Duff-Gordon", role: "boat 1", o: { jacket: "#5a3b5e", dress: "#4a2f4e", collar: "#d9c9b0", pants: "#22202a", boots: "#17141c", hat: "widehat",
    cap: "#2e2236", band: "#e7d6ef", lifebelt: true, skin: SKINS[0] }, opts: { expr: "nervous", mode: "stand", seed: 95, facing: -1 } },
  steward: { name: "Steward", role: "crowd", o: { jacket: "#f2efe6", pants: "#22263a", boots: "#17141c", hat: "hair", hair: "#3a2a20", buttons: "#c9ccd2", skin: SKINS[3] },
    opts: { expr: "neutral", mode: "stand", seed: 101, facing: 1 } },
  firstwoman: { name: "First-class passenger", role: "crowd", o: { jacket: "#3a5a7a", dress: "#2f4a66", collar: "#efe6d6", pants: "#22202a", boots: "#17141c", hat: "widehat",
    cap: "#2a2a3a", band: "#c25a7a", lifebelt: true, skin: SKINS[1] }, opts: { expr: "nervous", mode: "stand", seed: 111, facing: 1 } },
  firstman: { name: "First-class passenger", role: "crowd", o: { jacket: "#2e2a36", dress: "#2e2a36", coat: true, pants: "#22202a", boots: "#17141c", hat: "tophat",
    lifebelt: true, buttons: "#111", skin: SKINS[2] }, opts: { expr: "neutral", mode: "stand", seed: 121, facing: -1 } },
  thirdwoman: { name: "Third-class passenger", role: "crowd", o: { jacket: "#7a4a3a", dress: "#5a6a4a", pants: "#22202a", boots: "#3a2a20", hat: "shawl", cap: "#8a5a3a",
    skin: SKINS[3] }, opts: { expr: "nervous", mode: "stand", seed: 131, facing: 1 } },
  thirdman: { name: "Third-class passenger", role: "crowd", o: { jacket: "#5b5348", pants: "#3b3f52", boots: "#3a2a20", hat: "flatcap", cap: "#4a443c", moustache: "#2a201a",
    skin: SKINS[1] }, opts: { expr: "neutral", mode: "stand", seed: 141, facing: -1 } },
  thirdkid: { name: "Third-class child", role: "crowd", o: { jacket: "#b5653f", pants: "#3b5b9a", boots: "#3a2a20", hat: "flatcap", cap: "#6a5a4a", build: "kid",
    skin: SKINS[1] }, opts: { expr: "nervous", mode: "stand", seed: 151, facing: 1 } },
};
