import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProposalForm from "./ProposalForm";
import { createProposalRequest } from "../../redux/proposals/actions";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";

const AddProposalPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, proposals } = useSelector((state) => state.proposals);
  const [pendingCreation, setPendingCreation] = useState(null);

  // Helper to upload a material image
  const uploadMaterialImage = async (materialId, file) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("material_id", materialId);
    formData.append("title", file.name);
    formData.append("description", "");

    const response = await axios.post(`/materials/${materialId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  };

  const handleAddProposal = async (data, pendingMaterialImages = {}) => {
    try {
      // Create the proposal using Redux
      const result = await new Promise((resolve, reject) => {
        setPendingCreation({ resolve, reject, pendingMaterialImages, originalData: data });
        dispatch(createProposalRequest(data));
      });

      // After proposal is created, upload pending material images
      if (Object.keys(pendingMaterialImages).length > 0) {
        console.log('Uploading pending material images:', pendingMaterialImages);
        
        // For each item that has pending material images
        for (const [itemIndex, pieceImages] of Object.entries(pendingMaterialImages)) {
          const item = data.items[itemIndex];
          if (!item || !item.pieces) continue;

          // For each piece with a pending image
          for (const [pieceId, imageFile] of Object.entries(pieceImages)) {
            // Find the corresponding piece in the result
            const piece = item.pieces.find(p => p.id == pieceId);
            if (!piece || !piece.material_name) continue;

            // Find the material that was created for this piece
            // We need to match by material name since the material_id was null
            try {
              // First, get all materials to find the one with matching name
              const materialsResponse = await axios.get('/materials');
              const materials = materialsResponse.data;
              const matchingMaterial = materials.find(m => 
                m.name === piece.material_name && 
                m.code === piece.material_code
              );

              if (matchingMaterial) {
                console.log(`Uploading image for material ${matchingMaterial.id}:`, imageFile);
                await uploadMaterialImage(matchingMaterial.id, imageFile);
              } else {
                console.warn(`Could not find material for piece ${pieceId} with name ${piece.material_name}`);
              }
            } catch (error) {
              console.error(`Error uploading image for piece ${pieceId}:`, error);
            }
          }
        }
      }

      navigate("/proposals");
    } catch (error) {
      console.error("Error creating proposal:", error);
      // Error is now handled by axios interceptor and shown as toast
    }
  };

  useEffect(() => {
    if (pendingCreation && !loading && !error) {
      // Proposal was created successfully (no error and loading finished)
      // Find the newly created proposal (it should be the last one in the array)
      const newlyCreatedProposal = proposals[proposals.length - 1];
      
      if (newlyCreatedProposal) {
        // Resolve the pending creation
        pendingCreation.resolve(newlyCreatedProposal);
        
        // Upload pending material images if any
        if (pendingCreation.pendingMaterialImages && Object.keys(pendingCreation.pendingMaterialImages).length > 0) {
          // The upload logic is handled in handleAddProposal after the promise resolves
        }
        
        setPendingCreation(null);
        navigate("/proposals");
      }
    } else if (pendingCreation && error) {
      // Proposal creation failed
      pendingCreation.reject(new Error(error));
      setPendingCreation(null);
    }
  }, [loading, error, proposals, pendingCreation, navigate]);

  return (
    <div>
      <h1 className="mb-4">Add Proposal</h1>
      {loading && <p>Loading...</p>}
      <ProposalForm onSubmit={handleAddProposal} loading={loading} />
    </div>
  );
};

export default AddProposalPage;
