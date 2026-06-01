/**
 * deviceFingerprint — generates a stable browser/device identifier.
 *
 * Used by checkIn() as the `device_fingerprint` field.
 * Backend registers unknown fingerprints as untrusted devices.
 * Trusted devices reduce flagging probability.
 *
 * This is a lightweight deterministic fingerprint — not cryptographic.
 * Combines: userAgent + screen + timezone + language + platform.
 */
export const getDeviceFingerprint = () => {
  const components = [
    navigator.userAgent         || '',
    navigator.language          || '',
    navigator.platform          || '',
    screen.width                || 0,
    screen.height               || 0,
    screen.colorDepth           || 0,
    new Date().getTimezoneOffset() || 0,
    navigator.hardwareConcurrency  || 0,
  ]

  // Simple hash of concatenated values
  const raw = components.join('|')
  let hash  = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash  // convert to 32-bit int
  }

  return `web-${Math.abs(hash).toString(16)}-${Date.now().toString(36)}`
}

/**
 * Returns a cached fingerprint for the session.
 * Stored in sessionStorage to stay stable within a browser session.
 */
export const getStableDeviceFingerprint = () => {
  const STORAGE_KEY = 'dispatch_device_fp'
  let fp = sessionStorage.getItem(STORAGE_KEY)
  if (!fp) {
    fp = getDeviceFingerprint()
    sessionStorage.setItem(STORAGE_KEY, fp)
  }
  return fp
}