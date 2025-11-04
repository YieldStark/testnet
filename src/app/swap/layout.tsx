import Layout from '@/components/layout/Layout'

export default function SwapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Layout showSidebar={false}>{children}</Layout>
}























