import { Navigate } from "react-router-dom";

// roles es opcional: si no se pasa, solo exige haber iniciado sesión (comportamiento anterior)
export default function RequireAuth({ children, roles }) {
  const rol = localStorage.getItem("rol");

  if (!rol || (roles && !roles.includes(rol))) {
    return <Navigate to="/" replace />;
  }

  return children;
}
