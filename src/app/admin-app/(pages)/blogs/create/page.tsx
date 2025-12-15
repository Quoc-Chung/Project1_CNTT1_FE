"use client";

import React, { useEffect } from "react";
import CreateBlog from "../../../../../components/admin/CreateBlog";

const CreateBlogPage = () => {
  useEffect(() => {
    document.title = "Proshop | Tạo blog mới";
  }, []);

  return <CreateBlog />;
};

export default CreateBlogPage;

