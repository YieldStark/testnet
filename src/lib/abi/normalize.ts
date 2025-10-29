// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeAbi(rawAbi: unknown): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const abi = rawAbi as any
  if (Array.isArray(abi)) {
    // If it's a Cairo 1 ABI with a single interface wrapper, unwrap to items
    const iface = abi.find((e) => e && e.type === 'interface' && Array.isArray(e.items))
    if (iface && Array.isArray(iface.items)) {
      return iface.items
    }
  }
  return abi
}










