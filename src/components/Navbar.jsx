import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("vmp_token");
    localStorage.removeItem("vmp_admin_role");
    navigate("/");
  }

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <h3 style={{ margin: 0 }}>VMP Admin</h3>
      </div>

      <div style={styles.center}>
        <Link style={styles.link} to="/dashboard">
          Dashboard
        </Link>

        <Link style={styles.link} to="/licenses">
          Licenças
        </Link>

        <Link style={styles.link} to="/create-license">
          Criar Licença
        </Link>
      </div>

      <div style={styles.right}>
        <button onClick={logout} style={styles.button}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    backgroundColor: "#111",
    color: "white",
  },
  left: {
    fontWeight: "bold",
  },
  center: {
    display: "flex",
    gap: "20px",
  },
  right: {},
  link: {
    color: "white",
    textDecoration: "none",
  },
  button: {
    padding: "6px 12px",
    cursor: "pointer",
  },
};