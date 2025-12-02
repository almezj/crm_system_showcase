import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MultilingualProductForm from "./MultilingualProductForm";
import {
  fetchProductByIdRequest,
  updateProductRequest,
} from "../../redux/products/actions";

import { fetchManufacturersRequest } from "../../redux/manufacturers/actions";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading, error } = useSelector((state) => state.products);
  const { manufacturers } = useSelector((state) => state.manufacturers);

  useEffect(() => {
    dispatch(fetchProductByIdRequest(id));
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(fetchManufacturersRequest());
  }, [dispatch]);

  const handleUpdateProduct = async (updatedData) => {
    dispatch(
      updateProductRequest({
        ...updatedData,
        id: parseInt(id),
      })
    );
    
    // Return the existing product ID for metadata saving
    return { product_id: parseInt(id) };
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div>
      <h1 className="mb-4">Edit Product</h1>
      <MultilingualProductForm
        product={product}
        manufacturers={manufacturers}
        onSubmit={handleUpdateProduct}
        onSuccess={() => navigate("/products")}
      />
    </div>
  );
};

export default EditProductPage;
