import NodeCache from 'node-cache'
const ipCache = new NodeCache({ checkperiod: 15, deleteOnExpire: true })

export function getIp(req) {
    return req.header('x-forwarded-for') || req.connection.remoteAddress
}

export function isIpCached(requestIp: string): boolean {
    return ipCache.has(requestIp)
}

export function saveIp(ip: string) {
    return ipCache.set(ip, true)
}
