/**
 * The little of ZIP that sharing a theme needs.
 *
 * A theme is one small JSON document plus whatever media sits beside it, so the
 * archive format is worth exactly this much: a writer that emits stored/deflated
 * entries with a central directory, and a reader that walks that directory back.
 * Node owns the compression (`zlib.deflateRawSync` / `inflateRawSync`); the two
 * checksums and the record layout are all that has to be written here, which
 * keeps the plugin dependency-free.
 *
 * Deliberately unsupported, because nothing this plugin writes ever produces
 * them: zip64, encrypted entries, multi-disk archives, and data descriptors.
 */

import { deflateRawSync, inflateRawSync } from 'node:zlib'

/** Local file header. */
const SIG_LOCAL = 0x04034b50
/** Central directory file header. */
const SIG_CENTRAL = 0x02014b50
/** End of central directory. */
const SIG_EOCD = 0x06054b50

/** What a reader must find at the start of every entry this writer emits. */
const FLAG_UTF8 = 0x0800
const METHOD_STORE = 0
const METHOD_DEFLATE = 8

/** zip64 escape markers; anything carrying one is refused rather than misread. */
const ZIP64_LIMIT = 0xffffffff
const ZIP64_ENTRIES = 0xffff

const U32_LIMIT = 0xffffffff

export type ZipEntry = {
  /** Path inside the archive, always with forward slashes. */
  name: string
  data: Buffer
}

/** How a read should select and bound the entries it inflates. */
export type ReadZipOptions = {  /** Skip entries this returns false for, before they are inflated. */
  filter?: (name: string) => boolean
  /** Largest uncompressed entry to accept; a bigger one is a refusal, not a skip. */
  maxEntryBytes?: number
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i += 1) {
    let value = i
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    table[i] = value >>> 0
  }
  return table
})()

/** CRC-32 of one entry, as the archive records it. */
export function crc32(data: Buffer): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i += 1) {
    crc = CRC_TABLE[(crc ^ data[i]!) & 0xff]! ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

/**
 * Pack entries into one archive. Directory entries are not emitted: every
 * consumer this format targets infers them from the entry paths.
 */
export function createZip(entries: ZipEntry[]): Buffer {
  const locals: Buffer[] = []
  const centrals: Buffer[] = []
  let offset = 0

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8')
    const raw = entry.data
    if (raw.byteLength > U32_LIMIT) {
      throw new Error(`entry too large to archive: ${entry.name}`)
    }
    // Deflate only when it actually pays: a one-byte header either way, so an
    // incompressible asset is stored rather than inflated.
    const deflated = deflateRawSync(raw)
    const stored = deflated.byteLength >= raw.byteLength
    const body = stored ? raw : deflated
    const method = stored ? METHOD_STORE : METHOD_DEFLATE
    const crc = crc32(raw)

    const local = Buffer.alloc(30)
    local.writeUInt32LE(SIG_LOCAL, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(FLAG_UTF8, 6)
    local.writeUInt16LE(method, 8)
    local.writeUInt16LE(0, 10)
    local.writeUInt16LE(0, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(body.byteLength, 18)
    local.writeUInt32LE(raw.byteLength, 22)
    local.writeUInt16LE(name.byteLength, 26)
    local.writeUInt16LE(0, 28)
    locals.push(local, name, body)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(SIG_CENTRAL, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(FLAG_UTF8, 8)
    central.writeUInt16LE(method, 10)
    central.writeUInt16LE(0, 12)
    central.writeUInt16LE(0, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(body.byteLength, 20)
    central.writeUInt32LE(raw.byteLength, 24)
    central.writeUInt16LE(name.byteLength, 28)
    central.writeUInt16LE(0, 30)
    central.writeUInt16LE(0, 32)
    central.writeUInt16LE(0, 34)
    central.writeUInt16LE(0, 36)
    central.writeUInt32LE(0, 38)
    central.writeUInt32LE(offset, 42)
    centrals.push(central, name)

    offset += local.byteLength + name.byteLength + body.byteLength
  }

  const centralBuffer = Buffer.concat(centrals)
  if (entries.length > ZIP64_ENTRIES || offset > U32_LIMIT || centralBuffer.byteLength > U32_LIMIT) {
    throw new Error('archive too large for the supported zip flavour')
  }

  const end = Buffer.alloc(22)
  end.writeUInt32LE(SIG_EOCD, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralBuffer.byteLength, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20)

  return Buffer.concat([...locals, centralBuffer, end])
}

function findEndOfCentralDirectory(input: Buffer): number {
  const earliest = Math.max(0, input.length - 22 - 0xffff)
  for (let at = input.length - 22; at >= earliest; at -= 1) {
    if (input.readUInt32LE(at) === SIG_EOCD) return at
  }
  return -1
}

/**
 * Entry bytes from one archive, with `filter` deciding which entries are worth
 * inflating. Throws on anything this writer would not have produced, so a file
 * that is not one of our archives fails as "unreadable" rather than as a
 * half-parsed theme.
 */
export function readZip(input: Buffer, options: ReadZipOptions = {}): ZipEntry[] {
  const { filter, maxEntryBytes } = options
  const end = findEndOfCentralDirectory(input)
  if (end < 0) throw new Error('not a zip archive')
  const count = input.readUInt16LE(end + 10)
  const centralSize = input.readUInt32LE(end + 12)
  const centralOffset = input.readUInt32LE(end + 16)
  if (count === ZIP64_ENTRIES || centralOffset === ZIP64_LIMIT || centralSize === ZIP64_LIMIT) {
    throw new Error('zip64 archives are not supported')
  }
  if (centralOffset + centralSize > input.length) throw new Error('zip central directory is out of range')

  const entries: ZipEntry[] = []
  let at = centralOffset
  for (let index = 0; index < count; index += 1) {
    if (at + 46 > input.length || input.readUInt32LE(at) !== SIG_CENTRAL) {
      throw new Error('zip central directory is malformed')
    }
    const method = input.readUInt16LE(at + 10)
    const compressedSize = input.readUInt32LE(at + 20)
    const uncompressedSize = input.readUInt32LE(at + 24)
    const nameLength = input.readUInt16LE(at + 28)
    const extraLength = input.readUInt16LE(at + 30)
    const commentLength = input.readUInt16LE(at + 32)
    const localOffset = input.readUInt32LE(at + 42)
    if (
      compressedSize === ZIP64_LIMIT
      || uncompressedSize === ZIP64_LIMIT
      || localOffset === ZIP64_LIMIT
    ) {
      throw new Error('zip64 archives are not supported')
    }
    const name = input.toString('utf8', at + 46, at + 46 + nameLength)

    if (localOffset + 30 > input.length || input.readUInt32LE(localOffset) !== SIG_LOCAL) {
      throw new Error('zip local header is malformed')
    }
    const localNameLength = input.readUInt16LE(localOffset + 26)
    const localExtraLength = input.readUInt16LE(localOffset + 28)
    const dataStart = localOffset + 30 + localNameLength + localExtraLength
    const dataEnd = dataStart + compressedSize
    if (dataEnd > input.length) throw new Error('zip entry data is out of range')

    if (filter === undefined || filter(name)) {
      // The declared size is what the entry would expand to, so the cap is
      // enforced before the inflate rather than after it.
      if (maxEntryBytes !== undefined && uncompressedSize > maxEntryBytes) {
        throw new Error(`zip entry too large: ${name}`)
      }
      const body = input.subarray(dataStart, dataEnd)
      if (method === METHOD_STORE) entries.push({ name, data: Buffer.from(body) })
      else if (method === METHOD_DEFLATE) entries.push({ name, data: inflateRawSync(body) })
      else throw new Error(`unsupported zip compression method ${String(method)}`)
    }

    at += 46 + nameLength + extraLength + commentLength
  }
  return entries
}
