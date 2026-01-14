"use client";

import React, { useState, useEffect } from "react";

const SettingsPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    imgSrc: "",
    path: "",
    title: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from an API or local storage
  useEffect(() => {
    // Replace this with actual data fetching logic
    const fetchCategories = async () => {
      try {
        // Example: const response = await fetch('/api/categories');
        // const data = await response.json();
        // setCategories(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleAddCategory = () => {
    if (newCategory.title && newCategory.imgSrc && newCategory.path) {
      // Add the new category to local state
      setCategories(prev => [...prev, { ...newCategory, id: Date.now() }]);
      
      // Here you would typically make an API call to save the category
      // await saveCategoryToAPI(newCategory);
      
      // Clear the form
      setNewCategory({ imgSrc: "", path: "", title: "" });
    }
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  if (error) {
    return <div>Error loading settings: {error}</div>;
  }

  // Ensure categories is always an array to prevent map errors
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <nav
        style={{
          width: "250px",
          background: "#f4f4f4",
          padding: "20px",
          borderRight: "1px solid #ddd",
        }}
      >
        <h2 style={{ marginBottom: "16px", color: "black" }}>Sections</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {safeCategories.map((category) => (
            <li key={category.id || Math.random().toString(36).substr(2, 9)} style={{ marginBottom: '8px' }}>
              {category.title}
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "20px" }}>
        <h1 style={{ color: "black" }}>Add New Category</h1>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newCategory.title}
          onChange={handleInputChange}
          style={{
            display: "block",
            margin: "8px 0",
            padding: "8px",
            width: "100%",
          }}
        />
        <input
          type="text"
          name="imgSrc"
          placeholder="Image URL"
          value={newCategory.imgSrc}
          onChange={handleInputChange}
          style={{
            display: "block",
            margin: "8px 0",
            padding: "8px",
            width: "100%",
          }}
        />
        <input
          type="text"
          name="path"
          placeholder="Path"
          value={newCategory.path}
          onChange={handleInputChange}
          style={{
            display: "block",
            margin: "8px 0",
            padding: "8px",
            width: "100%",
          }}
        />
        <button
          onClick={handleAddCategory}
          style={{
            marginTop: "8px",
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Add Category
        </button>
      </main>
    </div>
  );
};

export default SettingsPage;
