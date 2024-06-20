import {useContext, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import DataContext from "../context/DataContext.tsx";
type Props = {
  children: React.ReactNode;
};

const VerifyAdmin = ({ children }: Props) => {
  const { session, role } = useContext(DataContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/login');
    } else {
      if (role !== 'admin') {
        navigate('/');
      }
    }
  }, [session, navigate, role]);

  return <>{children}</>;
};

export default VerifyAdmin;
