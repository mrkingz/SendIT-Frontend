import decode from "jwt-decode";
import setAthorizationToken from "./setAuthorization";

const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (token) {
    const currentTime = Date.now();
    const tokenExp = decode(token).exp * 1000;
    if (currentTime < tokenExp) {
      setAthorizationToken(token);
      return true;
    }
  }
  return false;
};
export default isAuthenticated;
