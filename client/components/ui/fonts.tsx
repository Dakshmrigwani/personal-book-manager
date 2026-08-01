// app/fonts.js
import { Inter, Playfair_Display, Merriweather } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const playfair = Playfair_Display({
  subsets: ["latin"],
});

export const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});