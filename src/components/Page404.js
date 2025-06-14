import React from 'react';
import { Link } from 'react-router-dom';

const Page404 = () => {
  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="text-center">
        <h1 className="display-1 text-primary">404</h1>
        <h2>Page Not Found</h2>
        <p className="lead">The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary mt-3">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Page404;
