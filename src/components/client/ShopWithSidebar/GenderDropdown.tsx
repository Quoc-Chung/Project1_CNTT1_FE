"use client";
import React, { useState } from "react";

interface GenderItemProps {
  category: {
    id: string;
    name: string;
    products: number;
  };
  isSelected: boolean;
  onToggle: (brandId: string) => void;
}

const GenderItem = ({ category, isSelected, onToggle }: GenderItemProps) => {
  return (
    <button
      className={`${
        isSelected && "text-blue"
      } group flex items-center justify-between ease-out duration-200 hover:text-blue `}
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

      <span
        className={`${
          isSelected ? "text-white bg-blue" : "bg-gray-2"
        } inline-flex rounded-[30px] text-custom-xs px-2 ease-out duration-200 group-hover:text-white group-hover:bg-blue`}
      >
        {category.products}
      </span>
    </button>
  );
};

interface GenderDropdownProps {
  genders: Array<{
    id: string;
    name: string;
    products: number;
  }>;
  loading?: boolean;
  selectedBrands?: string[];
  onBrandChange?: (brandIds: string[]) => void;
}

const GenderDropdown = ({ genders, loading = false, selectedBrands = [], onBrandChange }: GenderDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  const handleBrandToggle = (brandId: string) => {
    if (!brandId) return;
    // Checkbox behavior: toggle the brand in the array
    const newSelected = selectedBrands.includes(brandId)
      ? selectedBrands.filter(id => id !== brandId)
      : [...selectedBrands, brandId];
    onBrandChange?.(newSelected);
  };

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown && "shadow-filter"
        }`}
      >
        <p className="text-dark">Brand</p>
        <button
          onClick={() => setToggleDropdown(!toggleDropdown)}
          aria-label="button for brand dropdown"
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

      {/* <!-- dropdown menu --> */}
      <div
        className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${
          toggleDropdown ? "flex" : "hidden"
        }`}
      >
        {loading ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Đang tải brands...
          </div>
        ) : genders.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Không có brand nào
          </div>
        ) : (
          genders.map((gender, key) => (
            <GenderItem 
              key={gender.id || key} 
              category={gender}
              isSelected={gender.id ? selectedBrands.includes(gender.id) : false}
              onToggle={handleBrandToggle}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GenderDropdown;
