let reason: string | null = null

export function setSignOutReason(r: string) {
  reason = r
}

/** Read and clear the reason — call once on the welcome/sign-in screen. */
export function consumeSignOutReason(): string | null {
  const r = reason
  reason = null
  return r
}
