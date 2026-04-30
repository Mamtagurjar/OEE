import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

type PublicRouteProps = RouteProps & {
  redirectTo?: string;
};

const PublicRoute: React.FC<PublicRouteProps> = ({
  redirectTo = '/dashboard',
  ...routeProps
}) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  return <Route {...routeProps} />;
};

export default PublicRoute;
