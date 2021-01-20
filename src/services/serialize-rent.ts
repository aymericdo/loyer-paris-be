import * as log from '@helpers/log'
import { roundNumber } from '@helpers/round-number'
import { YearBuiltService } from '@services/year-built'
import { EncadrementItem } from '@interfaces/json-item'

interface SerializedInfo {
    address: string
    charges?: number
    hasCharges?: boolean
    hasFurniture?: boolean
    isLegal: boolean
    maxAuthorized: number
    postalCode: string
    price: number
    priceExcludingCharges: number
    roomCount?: number
    surface: number
    yearBuilt?: number[]
}

export class SerializeRentService {
    serializedInfo: SerializedInfo = null
    encadrementItem: EncadrementItem = null

    constructor(
        serializedInfo: SerializedInfo,
        encadrementItem: EncadrementItem,
    ) {
        this.serializedInfo = serializedInfo
        this.encadrementItem = encadrementItem
    }

    serialize() {
        log.info('sending data', 'green')

        const {
            address,
            charges,
            hasCharges,
            hasFurniture,
            isLegal,
            maxAuthorized,
            postalCode,
            price,
            priceExcludingCharges,
            roomCount,
            surface,
            yearBuilt,
        } = this.serializedInfo

        return {
            detectedInfo: {
                address: { order: 0, value: `${address ? address : ''} ${postalCode ? postalCode : ''}`.trim() },
                hasFurniture: { order: 1, value: hasFurniture },
                roomCount: { order: 2, value: roomCount },
                surface: { order: 3, value: surface },
                yearBuilt: { order: 4, value: YearBuiltService.getDateFormatted(yearBuilt) },
                price: { order: 5, value: roundNumber(price) },
                charges: { order: 6, value: roundNumber(charges) },
                hasCharges: { order: 7, value: !charges && hasCharges != null ? hasCharges : null },
            },
            computedInfo: {
                neighborhood: { order: 0, value: this.encadrementItem.fields.nom_quartier },
                hasFurniture: { order: 1, value: !!this.encadrementItem.fields.meuble_txt.match(/^meubl/g) },
                roomCount: { order: 2, value: +this.encadrementItem.fields.piece },
                surface: { order: 3, value: surface },
                dateRange: { order: 4, value: this.encadrementItem.fields.epoque },
                min: { order: 5, value: roundNumber(+this.encadrementItem.fields.min) },
                max: { order: 6, value: roundNumber(+this.encadrementItem.fields.max) },
                maxAuthorized: { order: 7, value: maxAuthorized },
                promoPercentage: { order: 8, value: !isLegal ? roundNumber(100 - (maxAuthorized * 100 / priceExcludingCharges)) : null },
            },
            isLegal,
        }
    }
}
