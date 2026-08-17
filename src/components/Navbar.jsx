import { Link } from "react-router-dom";

export default function Navbar() {
  function logout() {
    // REMOVE A CHAVE CORRETA USADA NO App.jsx
    localStorage.removeItem("vmp_admin_token"); 
    localStorage.removeItem("vmp_admin_role");
    // FORÇA O RECARREGAMENTO PARA LIMPAR O CONTEXTO DO REACT
    window.location.href = "/login";
  }

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <h3 style={{ margin: 0 }}>VMP Admin</h3>
      </div>

      <div style={styles.center}>
        <Link style={styles.link} to="/">
          Dashboard
        </Link>

        <Link style={styles.link} to="/licenses">
          Licenças
        </Link>

        <Link style={styles.link} to="/licenses/create">
          Criar Licença
        </Link>
      </div>

      <div style={styles.right}>
        <button onClick={logout} style={styles.button}>
          Sair
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
    backgroundColor: "#0d1117",
    borderBottom: "1px solid #21262d",
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
    fontSize: 14,
  },
  button: {
    padding: "6px 12px",
    cursor: "pointer",
    backgroundColor: "#f03e3e",
    color: "#fff",
    border: "none",
    borderRadius: 4,
  },
};