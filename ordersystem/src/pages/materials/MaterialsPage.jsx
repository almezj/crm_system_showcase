import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMaterialsRequest, deleteMaterialRequest } from '../../redux/materials/actions';
import { getImageUrl } from '../../utils/imageUtils';
import Pagination from '../../components/Pagination';

const MaterialsPage = () => {
    const dispatch = useDispatch();
    const { materials, loading, error } = useSelector(state => state.materials);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState(null);

    useEffect(() => {
        dispatch(fetchMaterialsRequest());
    }, [dispatch]);

    const handleDelete = (material) => {
        setMaterialToDelete(material);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (materialToDelete) {
            dispatch(deleteMaterialRequest(materialToDelete.id));
            setShowDeleteModal(false);
            setMaterialToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setMaterialToDelete(null);
    };

    // Pagination logic - might just use a UI library for this stuff later idk
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedMaterials = materials.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(materials.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (loading) {
        return <div className="alert alert-info">Loading materials...</div>;
    }

    if (error) {
        return <div className="alert alert-danger">Error: {error}</div>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Materials</h1>
                <Link className="btn btn-primary" to="/materials/add">
                    Add Material
                </Link>
            </div>

            {materials.length === 0 ? (
                <div className="alert alert-info">
                    No materials found.{" "}
                    <Link className="btn btn-link p-0" to="/materials/add">
                        Add your first material
                    </Link>
                </div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                            <thead className="table-dark">
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Code</th>
                                    <th>Color</th>
                                    <th>Type</th>
                                    <th>Style</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedMaterials.map((material) => (
                                    <tr key={material.id} className={!material.is_active ? "table-secondary" : ""}>
                                        <td style={{ width: '90px' }}>
                                            {material.image_path ? (
                                                <img
                                                    src={getImageUrl(material.image_path)}
                                                    alt={material.name}
                                                    style={{ height: '70px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            ) : (
                                                <span className="text-muted">No image</span>
                                            )}
                                        </td>
                                        <td>{material.name}</td>
                                        <td>{material.code || '-'}</td>
                                        <td>{material.color || '-'}</td>
                                        <td>{material.type || '-'}</td>
                                        <td>{material.style || '-'}</td>
                                        <td>
                                            <span className={`badge ${material.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                {material.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="btn-group" role="group">
                                                <Link
                                                    to={`/materials/${material.id}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    to={`/materials/${material.id}/edit`}
                                                    className="btn btn-sm btn-outline-secondary"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(material)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      showPageInfo={true}
                      maxVisiblePages={7}
                    />

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && materialToDelete && (
                        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Confirm Delete</h5>
                                        <button type="button" className="btn-close" aria-label="Close" onClick={handleCancelDelete}></button>
                                    </div>
                                    <div className="modal-body text-center">
                                        <p>Are you sure you want to delete the material:</p>
                                        <h5 className="mb-3">{materialToDelete.name}</h5>
                                        {materialToDelete.image_path ? (
                                            <img
                                                src={getImageUrl(materialToDelete.image_path)}
                                                alt={materialToDelete.name}
                                                style={{ height: "100px", objectFit: "cover", borderRadius: "4px" }}
                                            />
                                        ) : (
                                            <span className="text-muted">No image</span>
                                        )}
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={handleCancelDelete}>
                                            Cancel
                                        </button>
                                        <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MaterialsPage; 