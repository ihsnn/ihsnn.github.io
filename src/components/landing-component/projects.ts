export interface CartridgeProject {
  /** Catalog number, shown as "NO. 01" — order they were added, oldest first. */
  catalogNo: string
  title: string
  tagline: string
  route: string
  /** Cartridge shell color. Pick something that nods to the project itself. */
  color: string
  colorDark: string
  labelColor: string
}

// Add a new object here to add a new cartridge to the shelf — nothing else
// needs to change for it to show up on the landing page.
export const PROJECTS: CartridgeProject[] = [
  {
    catalogNo: '01',
    title: 'GAME BOY',
    tagline: 'A hand-built replica console — press start for a message.',
    route: '/gameboy',
    color: '#8b8f98',
    colorDark: '#5c6068',
    labelColor: '#eae6da',
  },
  {
    catalogNo: '02',
    title: 'POKÉSCAN',
    tagline: 'Point it at a Pokémon TCG card, get back live Pokédex data.',
    route: '/pokescan',
    color: '#e3350d',
    colorDark: '#8f1f08',
    labelColor: '#ffcb05',
  },
]
