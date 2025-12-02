import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchManufacturerByIdRequest, updateManufacturerRequest } from "../../redux/manufacturers/actions";
import ManufacturerForm from "./ManufacturerForm";

const EditManufacturerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { manufacturer, loading, error } = useSelector((state) => state.manufacturers);

  useEffect(() => {
    dispatch(fetchManufacturerByIdRequest(id));
  }, [dispatch, id]);

  const handleUpdateManufacturer = (formData) => {
    dispatch(updateManufacturerRequest({ ...formData, id }));
    navigate("/manufacturers");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!manufacturer) return <div>Manufacturer not found</div>;

  return (
    <div>
      <h1 className="mb-4">Edit Manufacturer</h1>
      <ManufacturerForm manufacturer={manufacturer} onSubmit={handleUpdateManufacturer} />
    </div>
  );
};

export default EditManufacturerPage;
