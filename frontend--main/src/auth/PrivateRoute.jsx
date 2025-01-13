//import React from 'react';
//import { Route, Navigate } from 'react-router-dom';
//import { useAuth } from './AuthProvider';

//const PrivateRoute = ({ children, ...rest }) => {
//  const { isLoggedIn } = useAuth();
  
//  return (
//    <Route
//     {...rest}
//      render={({ location }) =>
//        isLoggedIn ? (
//          children
 //       ) : (
 //         <Navigate
    //        to={{
 //             pathname: "/login"              state: { from: location }
//            }}
  //        />
 //       )
//}
//  
//);
//};

//export default PrivateRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
