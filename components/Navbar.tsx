import { Box } from "lucide-react";
import React from "react";
import Button from "./ui/Button";
import { useOutlet, useOutletContext } from "react-router";

const Navbar = () => {
  // const isSignedIn = false; // Dummy variables
  // const username = "anand";

  // Real variables
  const { isSignedIn, userName, signIn, signOut } =
    useOutletContext<AuthContext>();

  const handleAuthentication = async () => {
    // If a user is already signedin then we will try to sign the user out
    if (isSignedIn) {
      try {
        await signOut();
      } catch (error) {
        console.error("Puter signout failed", error);
      }
      return;
    }

    // If a user is signedout then we will try to signin the user
    try {
      await signIn();
    } catch (error) {
      console.error("Puter signin failed", error);
    }
  };
  return (
    <header className="navbar">
      <nav className="inner">
        <div className="left">
          <div className="brand">
            <Box className="logo" />
            <span className="name">Roomify</span>
          </div>

          <ul className="links">
            <a href="#">Product</a>
            <a href="#">Pricing</a>
            <a href="#">Community</a>
            <a href="#">Enterprise</a>
          </ul>
        </div>

        <div className="actions">
          {isSignedIn ? (
            <>
              <span className="greeting">
                {userName ? `Hi, ${userName}` : "Signed In"}
              </span>

              <Button size="sm" onClick={handleAuthentication} className="btn">
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAuthentication}
                className="btn"
              >
                Login
              </Button>

              <a href="#upload" className="cta">
                Get Started
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
