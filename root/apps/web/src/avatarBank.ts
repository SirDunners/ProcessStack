import AdaBlueShirt from "./assets/avatars/Ada-Blue-shirt.png";
import AgnesPatternedDress from "./assets/avatars/Agnes-Patterned-dress.png";
import AlishaRedTop from "./assets/avatars/Alisha-Red-top.png";
import ArnoldBeigeBlazer from "./assets/avatars/Arnold-Beige-blazer.png";
import CarlyBlackBlazer from "./assets/avatars/Carly-Black-blazer.png";
import CarolineWhiteJacket from "./assets/avatars/Caroline-White-jacket.png";
import JadeBlueDress from "./assets/avatars/Jade-Blue-dress.png";
import TyraPatternedJacket from "./assets/avatars/Tyra-Patterned-jacket.png";
import VioletBlackDress from "./assets/avatars/Violet-Black-dress.png";
import WillNavyBlazer from "./assets/avatars/Will-Navy-blazer.png";

/**
 * Avatar model used by the UI.
 * - `id` is what the app uses to match against Persona.avatar_id
 * - `avatar_id` kept for backwards-compat and readability
 */
export type AvatarBankItem = {
  id: string;
  avatar_id: string;
  name: string;
  outfit: string;
  image_url: string;
  source: string;
};

export const AVATAR_BANK: readonly AvatarBankItem[] = [
  { id: "AV-ADA-001", avatar_id: "AV-ADA-001", name: "Ada", outfit: "Blue shirt", image_url: AdaBlueShirt, source: "my" },
  { id: "AV-AGNES-001", avatar_id: "AV-AGNES-001", name: "Agnes", outfit: "Patterned dress", image_url: AgnesPatternedDress, source: "my" },
  { id: "AV-ALISHA-001", avatar_id: "AV-ALISHA-001", name: "Alisha", outfit: "Red top", image_url: AlishaRedTop, source: "my" },
  { id: "AV-ARNOLD-001", avatar_id: "AV-ARNOLD-001", name: "Arnold", outfit: "Beige blazer", image_url: ArnoldBeigeBlazer, source: "my" },
  { id: "AV-CARLY-001", avatar_id: "AV-CARLY-001", name: "Carly", outfit: "Black blazer", image_url: CarlyBlackBlazer, source: "my" },
  { id: "AV-CAROLINE-001", avatar_id: "AV-CAROLINE-001", name: "Caroline", outfit: "White jacket", image_url: CarolineWhiteJacket, source: "my" },
  { id: "AV-JADE-001", avatar_id: "AV-JADE-001", name: "Jade", outfit: "Blue dress", image_url: JadeBlueDress, source: "my" },
  { id: "AV-TYRA-001", avatar_id: "AV-TYRA-001", name: "Tyra", outfit: "Patterned jacket", image_url: TyraPatternedJacket, source: "my" },
  { id: "AV-VIOLET-001", avatar_id: "AV-VIOLET-001", name: "Violet", outfit: "Black dress", image_url: VioletBlackDress, source: "my" },
  { id: "AV-WILL-001", avatar_id: "AV-WILL-001", name: "Will", outfit: "Navy blazer", image_url: WillNavyBlazer, source: "my" },
] as const;