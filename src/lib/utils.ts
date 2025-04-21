import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return 'N/A';
  try {
     return new Date(dateString).toLocaleDateString(undefined, {
         year: 'numeric', month: 'short', day: 'numeric'
     });
  } catch {
     return 'Invalid Date';
  }
}


export const parse_title_and_version = (title: string): [string, number] => {
  const match = title.match(/^(.*?)\s*\(v(\d+)\)$/);
  if (match) {
      return [match[1].trim(), parseInt(match[2], 10)];
  }
  return [title, 1];
}
