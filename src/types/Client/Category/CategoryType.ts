export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parentName: string | null;
  parentSlug: string | null;
  childrenCount: number;
  hasChildren: boolean;
  children: any[] | null;
  hierarchyLevel: number;
  categoryType: string;
  productCount: number | null;
  isActive: boolean | null;
  imageUrl: string | null;
  displayName: string;
  fullPath: string;
  rootCategory: boolean;
  leafCategory: boolean;
};

