"use client"
import React, { createContext, useContext, useState } from "react";
import { Product } from "@/types/Client/Product/ProductItem";

interface ModalContextType {
  isModalOpen: boolean;
  product: Product | null;
  openModal: (product?: Product) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalContext must be used within a ModalProvider");
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const openModal = (productData?: Product) => {
    if (productData) {
      setProduct(productData);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProduct(null);
  };

  return (
    <ModalContext.Provider value={{ isModalOpen, product, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}; 