"use client";

import React, { useEffect } from "react";
import CreateProduct from "../../../../../components/admin/CreateProduct";

const CreateProductPage = () => {
  useEffect(() => {
    document.title = "Proshop | Tạo sản phẩm mới";
  }, []);

  return <CreateProduct />;
};

export default CreateProductPage;