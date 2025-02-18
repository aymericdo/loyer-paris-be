import { AvailableCities } from '@services/filters/city-filter/city-list'

export const zones = (city: AvailableCities): string[] | { [key: string]: string[] } => {
  switch (city) {
    case 'paris': return {
      1: ['Palais-Royal','Halles','St-Germain-l\'Auxerrois','Place-Vendôme'],
      2: ['Gaillon','Mail','Vivienne','Bonne-Nouvelle'],
      3: ['Enfants-Rouges','Arts-et-Metiers','Sainte-Avoie','Archives'],
      4: ['Arsenal','Saint-Gervais','Notre-Dame','Saint-Merri'],
      5: ['Saint-Victor','Val-de-Grace','Jardin-des-Plantes','Sorbonne'],
      6: ['Saint-Germain-des-Prés','Notre-Dame-des-Champs','Odeon','Monnaie'],
      7: ['Saint-Thomas-d\'Aquin','Gros-Caillou','Ecole-Militaire','Invalides'],
      8: ['Madeleine','Europe','Faubourg-du-Roule','Champs-Elysées'],
      9: ['Faubourg-Montmartre','Saint-Georges','Chaussée-d\'Antin','Rochechouart'],
      10: ['Porte-Saint-Martin','Hôpital-Saint-Louis','Saint-Vincent-de-Paul','Porte-Saint-Denis'],
      11: ['Saint-Ambroise','Roquette','Folie-Méricourt','Sainte-Marguerite'],
      12: ['Picpus','Quinze-Vingts','Bel-Air','Bercy'],
      13: ['Maison-Blanche','Salpêtrière','Gare','Croulebarbe'],
      14: ['Parc-de-Montsouris','Plaisance','Montparnasse','Petit-Montrouge'],
      15: ['Grenelle','Necker','Javel','Saint-Lambert'],
      16: ['Chaillot','Porte-Dauphine','Auteuil','Muette'],
      17: ['Epinettes','Plaine de Monceaux','Batignolles','Ternes'],
      18: ['Clignancourt','Grandes-Carrières','Goutte-d\'Or','La Chapelle'],
      19: ['Villette','Amérique','Pont-de-Flandre','Combat'],
      20: ['Charonne','Belleville','Saint-Fargeau','Père-Lachaise'],
    }
    case 'lyon': return ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5']
    case 'lille': return ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5']
    case 'montpellier': return ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5']
    case 'bordeaux': return ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4']
    case 'aubervilliers': return ['Zone 314']
    case 'epinay-sur-seine': return ['Zone 315']
    case 'ile-saint-denis': return ['Zone 312']
    case 'courneuve': return ['Zone 316']
    case 'pierrefitte': return ['Zone 317']
    case 'saint-denis': return ['Zone 311', 'Zone 312']
    case 'saint-ouen': return ['Zone 310']
    case 'stains': return ['Zone 318']
    case 'villetaneuse': return ['Zone 316']
    case 'bagnolet': return ['Zone 308']
    case 'bobigny': return ['Zone 315']
    case 'bondy': return ['Zone 318']
    case 'le pré-saint-gervais': return ['Zone 308']
    case 'les lilas': return ['Zone 307']
    case 'montreuil': return ['Zone 307', 'Zone 308']
    case 'noisy-le-sec': return ['Zone 311']
    case 'pantin': return ['Zone 308']
    case 'romainville': return ['Zone 313']
    case 'ahetze': return ['Zone 2']
    case 'anglet': return ['Zone 1', 'Zone 2']
    case 'arbonne': return ['Zone 2']
    case 'arcangues': return ['Zone 1']
    case 'ascain': return ['Zone 2']
    case 'bassussarry': return ['Zone 2']
    case 'bayonne': return ['Zone 1', 'Zone 2', 'Zone 3']
    case 'biarritz': return ['Zone 1']
    case 'bidart': return ['Zone 1']
    case 'biriatou': return ['Zone 3']
    case 'boucau': return ['Zone 3']
    case 'ciboure': return ['Zone 1', 'Zone 2']
    case 'guéthary': return ['Zone 1']
    case 'hendaye': return ['Zone 3']
    case 'jatxou': return ['Zone 3']
    case 'lahonce': return ['Zone 3']
    case 'larressore': return ['Zone 3']
    case 'mouguerre': return ['Zone 3']
    case 'saint-jean-de-luz': return ['Zone 1']
    case 'saint-pierre-d\'irube': return ['Zone 3']
    case 'urcuit': return ['Zone 3']
    case 'urrugne': return ['Zone 2']
    case 'ustaritz': return ['Zone 3']
    case 'villefranque': return ['Zone 3']

    case 'bresson': return ['Zone A']
    case 'claix': return ['Zone A']
    case 'domène': return ['Zone A']
    case 'échirolles': return ['Zone A']
    case 'éybens': return ['Zone A']
    case 'fontaine': return ['Zone A']
    case 'fontanil-cornillon': return ['Zone A']
    case 'gières': return ['Zone A']
    case 'grenoble': return ['Zone 1', 'Zone 2']
    case 'la tronche': return ['Zone A']
    case 'le pont-de-claix': return ['Zone A']
    case 'meylan': return ['Zone A']
    case 'murianette': return ['Zone A']
    case 'poisat': return ['Zone A']
    case 'saint-égrève': return ['Zone A']
    case 'saint-martin-d\'hères': return ['Zone A']
    case 'sassenage': return ['Zone A']
    case 'seyssinet-pariset': return ['Zone A']
    case 'seyssins': return ['Zone A']
    case 'varces-allières-et-risset': return ['Zone A']
    case 'venon': return ['Zone A']
    default: return null
  }
}