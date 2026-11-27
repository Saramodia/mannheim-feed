// Iconos de la app: todos de Pictogrammers (https://pictogrammers.com/library/mdi/), paquete @mdi/js.
// Para cambiar uno, busca el nombre en la biblioteca y cambia el import (mdi + NombreEnCamelCase).
import {
  mdiAccount,
  mdiArrowTopRight,
  mdiBank,
  mdiBriefcase,
  mdiClose,
  mdiDramaMasks,
  mdiHomeCity,
  mdiNewspaperVariant,
  mdiPartyPopper,
  mdiPoliceBadge,
  mdiSchool,
  mdiSilverwareForkKnife,
  mdiSoccer,
  mdiStethoscope,
  mdiTram,
  mdiTree
} from '@mdi/js'

export const icons = {
  tabFeed: mdiNewspaperVariant,
  tabProfile: mdiAccount,
  externalLink: mdiArrowTopRight,
  remove: mdiClose
}

// Un icono por tema (id de taxonomy.json). Sustituyen a los emojis de colores.
const topicIcons: Record<string, string> = {
  verkehr: mdiTram,
  kultur: mdiDramaMasks,
  freizeit: mdiPartyPopper,
  sicherheit: mdiPoliceBadge,
  politik: mdiBank,
  wohnen: mdiHomeCity,
  wirtschaft: mdiBriefcase,
  sport: mdiSoccer,
  bildung: mdiSchool,
  umwelt: mdiTree,
  gesundheit: mdiStethoscope,
  gastro: mdiSilverwareForkKnife
}

export const topicIcon = (id: string): string | undefined => topicIcons[id]
