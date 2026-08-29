import { Link } from "react-router-dom";

export default function Navbar({ onMenuClick, isMobile }) {
  function logout() {
    // Remove as chaves corretas usadas no App.jsx
    localStorage.removeItem("vmp_admin_token"); 
    localStorage.removeItem("vmp_role");
    // Força o recarregamento para limpar o contexto do React
    window.location.href = "/login";
  }

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        {/* Hamburger apenas em mobile */}
        {isMobile && (
          <button 
            onClick={onMenuClick} 
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: 24,
              cursor: 'pointer',
              marginRight: 10,
            }}
          >
            ☰
          </button>
        )}
        <h3 style={{ margin: 0 }}>VMP Admin</h3>
      </div>

      {/* Links centrais: ocultos em mobile (ficam no sidebar) */}
      {!isMobile && (
        <div style={styles.center}>
          <Link style={styles.link} to="/">Dashboard</Link>
          <Link style={styles.link} to="/licenses">Licenças</Link>
          <Link style={styles.link} to="/licenses/create">Criar Licença</Link>
          <Link style={styles.link} to="/profile">Perfil</Link>
        </div>
      )}

      <div style={styles.right}>
        <button onClick={logout} style={styles.button}>Sair</button>
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
    display: 'flex',
    alignItems: 'center',
  },
  center: {
    display: "flex",
    gap: "20px",
    flex: 1,
    justifyContent: 'center',
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