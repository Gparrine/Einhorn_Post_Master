/**
 * Open a blank tab synchronously (must run during a user click handler).
 * Browsers block window.open after await, so Send to All pre-opens tabs first.
 */
export function openTabPlaceholder(): Window | null {
  const tab = window.open('about:blank', '_blank')
  if (tab) {
    try {
      tab.opener = null
    } catch {
      /* ignore cross-origin restrictions */
    }
  }
  return tab
}

export function navigateTab(tab: Window | null | undefined, url: string): boolean {
  if (!tab || tab.closed) return false

  try {
    tab.location.href = url
    return true
  } catch {
    return false
  }
}

export function openUrlInNewTab(url: string): Window | null {
  const tab = window.open(url, '_blank')
  if (tab) {
    try {
      tab.opener = null
    } catch {
      /* ignore */
    }
  }
  return tab
}
