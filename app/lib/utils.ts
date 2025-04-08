import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sleep = (ms = 2000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
