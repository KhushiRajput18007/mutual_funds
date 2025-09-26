import { Inter } from 'next/font/google';
import './globals.css';
import MUIThemeProvider from '../components/ThemeProvider';
import Navigation from '../components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Mutual Fund Explorer',
  description: 'Explore mutual funds with SIP calculator',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MUIThemeProvider>
          <div style={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #2d3748 100%)',
          }}>
            <Navigation />
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
              {children}
            </div>
          </div>
        </MUIThemeProvider>
      </body>
    </html>
  );
}