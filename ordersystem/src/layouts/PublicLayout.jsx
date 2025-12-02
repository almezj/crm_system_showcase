import React from "react";

const PublicLayout = ({ children }) => {
  return (
    <div className="container">
      <div className="row justify-content-center align-items-center vh-100">
        <div className="col-12 col-md-6">{children}</div>
      </div>
    </div>
  );
};

export default PublicLayout;
