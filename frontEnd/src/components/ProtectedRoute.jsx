ppppppppppppppppppppppppppppppppppppppppimport React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Get token and user from localStorage
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check user role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate home page
    if (user.role === 'buyer') {
      return <Navigate to="/buyer/home" replace />;
    } else if (user.role === 'artist') {
      return <Navigate to="/seller/home" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // If everything is ok, show the page
  return children;
};

export default ProtectedRoute;