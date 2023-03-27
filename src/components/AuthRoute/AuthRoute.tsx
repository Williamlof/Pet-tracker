import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useState, useEffect, PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";

export interface IAuthRouteProps {}

const AuthRoute: React.FunctionComponent<IAuthRouteProps> = (props) => {
  const { children }: PropsWithChildren = props;
  const auth = getAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (!user) {
        navigate("/signin");
      }
    });

    return unsubscribe;
  }, [auth, navigate]);

  if (loading) {
    return <p>loading...</p>;
  }

  return <div className="w-full h-full">{children}</div>;
};

export default AuthRoute;
