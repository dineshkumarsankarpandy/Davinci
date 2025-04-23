import { GroupType } from "@/types/enum";
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


export const parse_title_and_version = (title: string): [string, number | null] => {
  const versionMatch = title.match(/\(v(\d+)\)$/);
  if (versionMatch && versionMatch[1]) {
    const baseTitle = title.replace(/\s\(v\d+\)$/, '');
    const versionNumber = parseInt(versionMatch[1], 10);
    return [baseTitle, versionNumber];
  }
  const v0Match = title.match(/\(v0\)$/);
   if (v0Match) {
     const baseTitle = title.replace(/\s\(v0\)$/, '');
     return [baseTitle, 0];
   }

  return [title, null];
};


export function getBaseScreenId(websiteId: string): string {
  if (!websiteId) return '';
  return websiteId.replace(/-v\d+$/, '');
}


export const determineGroupType = (groupId: string): GroupType | null => {
  const parts = groupId.split('-');
  if (parts.length < 2) return null;
  
  switch (parts[1]) {
    case GroupType.IMAGE:
      return GroupType.IMAGE;
    case GroupType.FLOW:
      return GroupType.FLOW;
    case GroupType.VERSION:
      return GroupType.VERSION;
    case GroupType.SINGLE:
      return GroupType.SINGLE;
    default:
      return null;
  }
};

export const getGroupDisplayName = (type: GroupType, groupId: string): string => {
  const idSuffix = groupId.split('-').slice(2).join('-').substring(0, 8);
  switch (type) {
    case GroupType.IMAGE:
      return `Group: ${idSuffix}...`;
    case GroupType.FLOW:
      return `Group: ${idSuffix}...`;
    case GroupType.VERSION:
      return ` Group: ${idSuffix}...`;
    case GroupType.SINGLE:
      return ` Group: ${idSuffix}...`;
    default:
      return `Group: ${idSuffix}...`;
  }

};

