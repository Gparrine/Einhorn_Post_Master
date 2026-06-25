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
