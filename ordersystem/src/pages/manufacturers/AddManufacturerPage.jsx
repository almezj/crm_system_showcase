import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createManufacturerRequest } from "../../redux/manufacturers/actions";
import ManufacturerForm from "./ManufacturerForm";

const AddManufacturerPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAddManufacturer = (formData) => {
    dispatch(createManufacturerRequest(formData));
    navigate("/manufacturers");
  };

  return (
    <div>
      <h1 className="mb-4">Add Manufacturer</h1>
      <ManufacturerForm onSubmit={handleAddManufacturer} />
    </div>
  );
};

export default AddManufacturerPage;
