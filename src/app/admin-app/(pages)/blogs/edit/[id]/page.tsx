"use client";

import React, { useEffect } from "react";
import EditBlog from "../../../../../../components/admin/EditBlog";

const EditBlogPage = () => {
  useEffect(() => {
    document.title = "NextCommerce | Chỉnh sửa blog";
  }, []);

  return <EditBlog />;
};

export default EditBlogPage;

