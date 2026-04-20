import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { getActiveUser } from './auth';

type PrivateRouteProps = RouteProps & {
  redirectTo?: string;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  redirectTo = '/login',
  ...routeProps
}) => {
  const isAuthenticated = Boolean(getActiveUser());

  if (!isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  return <Route {...routeProps} />;
};

export default PrivateRoute;
