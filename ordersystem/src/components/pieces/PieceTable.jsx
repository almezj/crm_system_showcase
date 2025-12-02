import React from 'react';

const PieceTable = ({ pieces, onRemovePiece }) => {
  if (pieces.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No pieces added yet. Click "Add Piece" to get started.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h5 className="fw-bold mb-3">Added Pieces</h5>
      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Internal Code</th>
              <th>EAN</th>
              <th>QR</th>
              <th>Delivery Date</th>
              <th>Material Name</th>
              <th>Material Code</th>
              <th>Color</th>
              <th>Type</th>
              <th>Style</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pieces.map((piece, index) => (
              <tr key={piece.id || index}>
                <td>{index + 1}</td>
                <td>{piece.internal_manufacturer_code}</td>
                <td>{piece.ean_code}</td>
                <td>{piece.qr_code}</td>
                <td>{piece.estimated_delivery_date}</td>
                <td>{piece.material_name}</td>
                <td>{piece.material_code}</td>
                <td>{piece.material_color}</td>
                <td>{piece.material_type}</td>
                <td>{piece.material_style}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => onRemovePiece(index)}
                    className="btn btn-sm btn-danger"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PieceTable;
