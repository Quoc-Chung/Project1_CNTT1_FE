"use client";

import { useState } from "react";

interface CategoryItemProps {
  category: {
    id: string;
    name: string;
    products: number;
  };
  isSelected: boolean;
  onToggle: (categoryId: string) => void;
}

const CategoryItem = ({ category, isSelected, onToggle }: CategoryItemProps) => {
  return (
    <button
      className={`${
        isSelected && "text-blue"
      } group flex items-center ease-out duration-200 hover:text-blue `}
      onClick={() => onToggle(category.id)}
    >
      <div className="flex items-center gap-2">
        {/* Checkbox style - square with checkmark when selected */}
        <div
          className={`cursor-pointer flex items-center justify-center rounded w-4 h-4 border-2 ${
            isSelected ? "border-blue bg-blue" : "border-gray-3 bg-white"
          }`}
        >
          {isSelected && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <span>{category.name}</span>
      </div>
    </button>
  );
};

interface CategoryDropdownProps {
  categories: Array<{
    id: string;
    name: string;
    products: number;
  }>;
  loading?: boolean;
  selectedCategories?: string[];
  onCategoryChange?: (categoryIds: string[]) => void;
}

const CategoryDropdown = ({ categories, loading = false, selectedCategories = [], onCategoryChange }: CategoryDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  const handleCategoryToggle = (categoryId: string) => {
    if (!categoryId) return;
    // Checkbox behavior: toggle the category in the array
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoryChange?.(newSelected);
  };

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={(e) => {
          e.preventDefault();
          setToggleDropdown(!toggleDropdown);
        }}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown && "shadow-filter"
        }`}
      >
        <p className="text-dark">Danh mục</p>
        <button
          aria-label="button for category dropdown"
          className={`text-dark ease-out duration-200 ${
            toggleDropdown && "rotate-180"
          }`}
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      {/* dropdown && 'shadow-filter */}
      {/* <!-- dropdown menu --> */}
      <div
        className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${
          toggleDropdown ? "flex" : "hidden"
        }`}
      >
        {loading ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Đang tải danh mục...
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Không có danh mục nào
          </div>
        ) : (
          categories.map((category, key) => (
            <CategoryItem 
              key={category.id || key} 
              category={category}
              isSelected={category.id ? selectedCategories.includes(category.id) : false}
              onToggle={handleCategoryToggle}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryDropdown;
