// import { min } from '@helpers/functions';
// import { regexString } from '@helpers/regex';
// import { MetroItem } from '@interfaces/json-item';
// import { StationService } from '@services/station';
// import inside from 'point-in-polygon';
// import { AddressService } from './address';

// export class ParisAddressService extends AddressService {
//   city = 'paris'

//   getStations(): string[] {
//     const stationsFromDescription: MetroItem[] = this.ad?.description && new StationService(this.ad.description).getStations()
//     return this.ad.stations || stationsFromDescription && (this.getPostalCode() && this.nearestPointInPostalCode(stationsFromDescription))
//   }

//   protected digForPostalCode2(text: string): string {
//     const postalCode2Re = new RegExp(regexString(`postalCode2_${this.city}`))
//     const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
//     return match ? match.trim().length === 1 ? `7500${match.trim()}` : `750${match.trim()}` : null
//   }

//   private nearestPointInPostalCode(metroItems: MetroItem[]): string[] {
//     const postalCodePolygon = this.distanceService().getPolyFromPostalCode()

//     if (!postalCodePolygon) return null

//     const pointByDist = metroItems.map(metro => {
//         const point = [metro.lon, metro.lat]
//         if (inside(point, postalCodePolygon)) {
//             return { point, dist: 0, name: metro.tags.name }
//         } else {
//             // Get the closest coord but in the right postalCode
//             return { ...this.distanceService().distanceToPoly(point as [number, number], postalCodePolygon as [number, number][]), name: metro.tags.name };
//         }
//     });

//     if (!pointByDist.length) return null

//     if (pointByDist[0].dist === 0) {
//         const insidePostalCodeCase = pointByDist[0] as { name: string, point: number[] };
//         this.blurryCoordinates = { lng: insidePostalCodeCase.point[0], lat: insidePostalCodeCase.point[1] };
//     } else {
//         const bah = min(pointByDist, 'dist')

//         // marge d'erreur : 250m
//         if (bah.dist < 0.0025) {
//             this.blurryCoordinates = { lng: bah.point[0], lat: bah.point[1] }
//         }
//     }

//     return pointByDist.reduce((prev, point) => {
//         if (point.dist < 0.0025 && prev.every(elem => elem !== point.name)) {
//             prev.push(point.name);
//         }
//         return prev;
//     }, []);
//   }
// }
