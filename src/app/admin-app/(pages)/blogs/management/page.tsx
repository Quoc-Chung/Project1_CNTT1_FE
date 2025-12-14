"use client";

import React, { useEffect } from "react";
import BlogManagement from "../../../../../components/admin/BlogManagement";

const BlogManagementPage = () => {
  useEffect(() => {
    document.title = "NextCommerce | Quản lý blog";
  }, []);

  return <BlogManagement />;
};

export default BlogManagementPage;

