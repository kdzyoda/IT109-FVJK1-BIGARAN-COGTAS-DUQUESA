import type { Address } from "@/lib/psgc";

export const DELIVERY_FEE = 10; // runner service fee, ₱5-₱10 (confirm the exact amount with the team)

export type Canteen = {
  id: number;
  name: string;
  note: string;
  active: boolean;
  logo?: string;
  location?: Address;
};

export type MenuItem = {
  id: number;
  canteenId: number;
  name: string;
  desc: string;
  price: number;
  available: boolean;
  image?: string;
};

// Starting sample data. The Laravel API replaces this later.
export const canteens: Canteen[] = [
  { id: 1, name: "Main Canteen Grill", note: "Rice meals and grilled favorites", active: true },
  { id: 2, name: "CCIS Snack Hub", note: "Quick bites and drinks", active: true },
  { id: 3, name: "Library Cafe", note: "Coffee, pastries and light meals", active: true },
];

export const menuItems: MenuItem[] = [
  { id: 1, canteenId: 1, name: "Chicken Adobo Rice", desc: "Tender chicken in soy and vinegar with garlic rice.", price: 85, available: true },
  { id: 2, canteenId: 1, name: "Pork Sisig", desc: "Sizzling chopped pork with onions, chili and egg.", price: 120, available: true },
  { id: 3, canteenId: 1, name: "Beef Tapa", desc: "Garlicky cured beef with fried egg and rice.", price: 110, available: false },
  { id: 4, canteenId: 2, name: "Lumpiang Shanghai", desc: "Crispy pork spring rolls with sweet chili dip.", price: 60, available: true },
  { id: 5, canteenId: 2, name: "Pancit Canton", desc: "Stir-fried noodles with vegetables and chicken.", price: 75, available: true },
  { id: 6, canteenId: 2, name: "Iced Calamansi Juice", desc: "Fresh calamansi, cold and refreshing.", price: 35, available: true },
  { id: 7, canteenId: 3, name: "Iced Latte", desc: "Espresso with cold milk over ice.", price: 90, available: true },
  { id: 8, canteenId: 3, name: "Ensaymada", desc: "Soft buttery bun topped with sugar and cheese.", price: 45, available: true },
  { id: 9, canteenId: 3, name: "Tuna Sandwich", desc: "Toasted bread with creamy tuna filling.", price: 70, available: true },
];