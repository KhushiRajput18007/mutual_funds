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
          <Navigation />
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 16px 0 16px' }}>
            {children}
          </div>
        </MUIThemeProvider>
      </body>
    </html>
  );
}