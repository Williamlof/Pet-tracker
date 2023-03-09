import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useState, useEffect, PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";

export interface IAuthRouteProps {}
const AuthRoute: React.FunctionComponent<IAuthRouteProps> = (props) => {
  const { children }: PropsWithChildren = props;
  const auth = getAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    AuthCheck();
  }, [auth]);

  const AuthCheck = onAuthStateChanged(auth, (user) => {
    if (user) {
      setLoading(false);
    } else {
      console.log("auth failed");
      navigate("/signin");
    }
  });

  if (loading) return <p>loading...</p>;

  return <div className="w-full h-full ">{children}</div>;
};

export default AuthRoute;
