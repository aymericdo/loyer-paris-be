import { Request } from 'express'
import NodeCache from 'node-cache'

export class IpService {
    ip: string = null
    ipCache: NodeCache = new NodeCache({ checkperiod: 15, deleteOnExpire: true })

    constructor(req: Request) {
        this.ip = req.header('x-forwarded-for') || req.connection.remoteAddress
    }

    isIpCached(): boolean {
        return this.ipCache.has(this.ip)
    }
    
    saveIp() {
        return this.ipCache.set(this.ip, true)
    }
    
}
