"use client";

import React, { useEffect } from "react";
import CreateBlog from "@/components/client/Blog/CreateBlog";

const CreateBlogPage = () => {
  useEffect(() => {
    document.title = "Tạo Blog | NextCommerce";
  }, []);

  return <CreateBlog />;
};

export default CreateBlogPage;

