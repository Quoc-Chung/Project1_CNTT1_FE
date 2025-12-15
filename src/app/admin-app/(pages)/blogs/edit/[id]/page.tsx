"use client";

import React, { useEffect } from "react";
import EditBlog from "../../../../../../components/admin/EditBlog";

const EditBlogPage = () => {
  useEffect(() => {
    document.title = "Proshop | Chỉnh sửa blog";
  }, []);

  return <EditBlog />;
};

export default EditBlogPage;

