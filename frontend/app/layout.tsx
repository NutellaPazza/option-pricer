import './globals.css'

export const metadata = { title: 'Option Pricer', description: 'Spot×Vol heatmaps, Greeks, models' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
