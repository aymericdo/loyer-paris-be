import { Request } from 'express';
import NodeCache from 'node-cache';

const ipCache: NodeCache = new NodeCache({
  stdTTL: 600,
  checkperiod: 60,
  deleteOnExpire: true,
})

export class IpService {
  ip: string = null

  constructor(req: Request) {
    this.ip = req.header('x-forwarded-for') || req.connection.remoteAddress
  }

  isIpCached(): boolean {
    return ipCache.has(this.ip)
  }

  saveIp(): boolean {
    return ipCache.set(this.ip, true)
  }
}
