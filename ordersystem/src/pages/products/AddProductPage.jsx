import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import MultilingualProductForm from "./MultilingualProductForm";
import { createProductRequest } from "../../redux/products/actions";
import { fetchManufacturersRequest } from "../../redux/manufacturers/actions";

const AddProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, createdProduct } = useSelector((state) => state.products);
  const { manufacturers } = useSelector((state) => state.manufacturers);
  const [pendingProduct, setPendingProduct] = useState(null);

  useEffect(() => {
    dispatch(fetchManufacturersRequest());
  }, [dispatch]);

  useEffect(() => {
    if (createdProduct && pendingProduct) {
      // Resolve the pending product creation
      pendingProduct.resolve(createdProduct);
      setPendingProduct(null);
      dispatch({ type: 'CLEAR_CREATED_PRODUCT' });
      navigate("/products");
    }
  }, [createdProduct, pendingProduct, navigate, dispatch]);

  const handleAddProduct = (data) => {
    return new Promise((resolve, reject) => {
      setPendingProduct({ resolve, reject });
      dispatch(createProductRequest(data));
    });
  };

  return (
    <div>
      <h1 className="mb-4">Add Product</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">Error: {error}</p>}
      <MultilingualProductForm manufacturers={manufacturers} onSubmit={handleAddProduct} />
    </div>
  );
};

export default AddProductPage;
