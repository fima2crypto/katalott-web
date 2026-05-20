import fs from 'fs'
import path from 'path'
import os from 'os'


const UPLOAD_DIR = path.join(os.homedir(), 'Projects/katalott/vuaxs_uploads/tickets')

export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

export function getTicketImagePath(groupId: number): string {
  return path.join(UPLOAD_DIR, `${groupId}.jpg`)
}

export function ticketImageExists(groupId: number): boolean {
  return fs.existsSync(getTicketImagePath(groupId))
}

export async function downloadTicketImage(
  groupId: number,
  imageUrl: string
): Promise<string | null> {
  try {
    ensureUploadDir()

    const filePath = getTicketImagePath(groupId)

    // Đã có rồi → không download lại
    if (fs.existsSync(filePath)) {
      return filePath
    }

    const res = await fetch(imageUrl)
    if (!res.ok) {
      console.error(`[vuaxs] Download ảnh thất bại: ${imageUrl} → ${res.status}`)
      return null
    }

    const buffer = await res.arrayBuffer()
    fs.writeFileSync(filePath, Buffer.from(buffer))
    console.log(`[vuaxs] Đã download ảnh groupId=${groupId} → ${filePath}`)
    return filePath
  } catch (e) {
    console.error(`[vuaxs] Lỗi download ảnh groupId=${groupId}:`, e)
    return null
  }
}
