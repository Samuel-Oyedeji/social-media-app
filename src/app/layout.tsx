// import { Inter } from 'next/font/google';
// import './globals.css';
// import Header from '@/components/core/Header';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'Social Media Content Generator',
//   description: 'Generate engaging social media posts with AI',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={`${inter.className} pt-16`}>
//         <Header />
//         <main>{children}</main>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import {Kanit} from "next/font/google"

const kanit = Kanit({weight: "700", subsets: ["latin"]})
 


export const metadata: Metadata = {
  title: "Autolearn - ",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={` ${kanit.className} `}
      >
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
