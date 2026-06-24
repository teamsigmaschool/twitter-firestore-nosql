import { useContext, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import ProfileSideBar from "../components/ProfileSideBar";
import ProfileMidBody from "../components/ProfileMidBody";
import { AuthContext } from "../components/AuthProvider";

export default function ProfilePage() {
  const navigate = useNavigate();
  const auth = getAuth();
const { currentUser } = useContext(AuthContext);

useEffect(() => {
  if (!currentUser) {
    navigate("/");
  }
}, [currentUser, navigate]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Container>
        <Row>
          <ProfileSideBar handleLogout={handleLogout} />
          <ProfileMidBody />
        </Row>
      </Container>
    </>
  );
}