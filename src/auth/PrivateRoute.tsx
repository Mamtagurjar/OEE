import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { hasRequiredRole, UserRole } from './auth';
import { useAppSelector } from '../redux/hooks';

type PrivateRouteProps = RouteProps & {
  redirectTo?: string;
  allowedRoles?: UserRole[];
  unauthorizedTo?: string;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  redirectTo = '/login',
  allowedRoles,
  unauthorizedTo = '/unauthorized',
  ...routeProps
}) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  if (!hasRequiredRole(user, allowedRoles)) {
    return <Redirect to={unauthorizedTo} />;
  }

  return <Route {...routeProps} />;
};

export default PrivateRoute;
