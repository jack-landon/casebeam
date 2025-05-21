import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sleep = (ms = 2000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const colorList = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-gray-500",
  "bg-lime-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-cyan-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-fuchsia-500",
  "bg-amber-500",
];

export const generateRandomColor = () => {
  return colorList[Math.floor(Math.random() * colorList.length)];
};

export function formatColumnNames(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// export function convertUrlToEmbeddedUrl(
//   url: string,
//   highlightedSection: string
// ) {
//   // Remove all line breaks and extra whitespace
//   const cleanedSection = highlightedSection
//     .trim()
//     .replace(/\s+/g, " ")
//     .replace(/&/g, "&");
//   // Highlight the text in the highlightedSection on the webpage and add it to the url so that when the url is clicked, it will scroll to the highlighted text
//   const stringLength = cleanedSection.length;

//   if (stringLength < 70) {
//     return `${url}#:~:text=${encodeURIComponent(cleanedSection)}`;
//   }

//   const firstPart = encodeURIComponent(cleanedSection.substring(0, 30));
//   const lastPart = encodeURIComponent(
//     cleanedSection.substring(stringLength - 30, stringLength)
//   );
//   return `${url}#:~:text=${firstPart},${lastPart}`;
// }

export function convertUrlToEmbeddedUrl(
  url: string,
  highlightedSection: string
) {
  // Remove all line breaks and extra whitespace
  const cleanedSection = highlightedSection
    .trim()
    .replace(/\s+/g, " ")
    .replace(/&/g, "&");

  const stringLength = cleanedSection.length;

  if (stringLength < 70) {
    return `${url}#:~:text=${encodeURIComponent(cleanedSection)}`;
  }

  // Find word boundaries
  const words = cleanedSection.split(" ");
  let firstPart = "";
  let currentLength = 0;

  // Build first part up to ~30 characters
  for (const word of words) {
    if (currentLength + word.length > 30) break;
    firstPart += (firstPart ? " " : "") + word;
    currentLength += word.length + (firstPart ? 1 : 0);
  }

  // Build last part starting from end
  let lastPart = "";
  currentLength = 0;
  for (let i = words.length - 1; i >= 0; i--) {
    if (currentLength + words[i].length > 30) break;
    lastPart = words[i] + (lastPart ? " " : "") + lastPart;
    currentLength += words[i].length + (lastPart ? 1 : 0);
  }

  return `${url}#:~:text=${encodeURIComponent(firstPart)},${encodeURIComponent(
    lastPart
  )}`;
}

export const DOC_JURISDICTIONS = [
  "commonwealth",
  "new_south_wales",
  "norfolk_island",
  "queensland",
  "south_australia",
  "tasmania",
  "western_australia",
] as const;

export const DOC_SOURCES = [
  "federal_court_of_australia",
  "federal_register_of_legislation",
  "high_court_of_australia",
  "nsw_caselaw",
  "nsw_legislation",
  "queensland_legislation",
  "south_australian_legislation",
  "tasmanian_legislation",
  "western_australian_legislation",
] as const;

export const DOC_TYPES = [
  "bill",
  "decision",
  "primary_legislation",
  "secondary_legislation",
] as const;

export function formatTag(str: string) {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/_/g, " ");
}

export const timeOperation = async <T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  const result = await operation();
  const end = performance.now();
  const durationInSeconds = ((end - start) / 1000).toFixed(2);
  console.log(`⏱️ ${operationName}: ${durationInSeconds}s`);
  return result;
};

export const totalDocumentsCount = 300_000;

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function isDownloadableSource(url: string) {
  return (
    url.endsWith(".pdf") ||
    url.endsWith(".docx") ||
    url.endsWith(".doc") ||
    url.endsWith(".pptx") ||
    url.endsWith(".ppt") ||
    url.endsWith(".txt") ||
    url.endsWith(".csv") ||
    url.endsWith(".xlsx") ||
    url.endsWith(".xls") ||
    url.endsWith(".zip") ||
    url.endsWith(".rar") ||
    url.endsWith(".7z")
  );
}
