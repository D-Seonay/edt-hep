import rules from "../data/userAds.json";

export interface AdData {
  title: string;
  description?: string;
  image?: string;
  link?: string;
}

export interface UserRule {
  redirect?: string;
  ad?: AdData;
  themeColor?: string;
  role?: string;
}

export const getUserRule = (username: string): UserRule | null => {
  const key = username.toLowerCase();
  return (rules as Record<string, UserRule>)[key] || null;
};
