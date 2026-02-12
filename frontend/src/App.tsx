import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  createHotel,
  getHotelById,
  listHotels,
  loadAuthState,
  loginUser,
  registerUser,
  saveAuthState,
  clearAuthState,
  checkHealth,
  getTokenExpiryMs,
} from "./api";
import type { AuthResponse, AuthState, HealthResponse, Hotel } from "./api";

type ApiInspectorProps = {
  title: string;
  lastStatus: number | null;
  lastError: string | null;
  lastData: unknown;
};

function ApiInspector({
  title,
  lastStatus,
  lastError,
  lastData,
}: ApiInspectorProps) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="panel-body">
        <div className="field">
          <span className="label">Last status:</span>
          <span>{lastStatus ?? "—"}</span>
        </div>
        <div className="field">
          <span className="label">Last error:</span>
          <span className={lastError ? "error" : ""}>
            {lastError ?? "None"}
          </span>
        </div>
        <div className="field">
          <span className="label">Last response JSON:</span>
        </div>
        <pre className="json-viewer">
          {lastData ? JSON.stringify(lastData, null, 2) : "No data yet"}
        </pre>
      </div>
    </section>
  );
}

function useLastResponse<T>() {
  const [status, setStatus] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const update = (res: { status: number; error: string | null; data: T | null }) => {
    setStatus(res.status);
    setError(res.error);
    setData(res.data);
  };

  return { status, error, data, update };
}

type StatusState = {
  status: "online" | "offline" | "loading";
  lastCheckedAt: string | null;
};

function StatusPage() {
  const [status, setStatus] = useState<StatusState>({
    status: "loading",
    lastCheckedAt: null,
  });

  const checkStatus = async () => {
    const res = await checkHealth();

    if (res.status === 200 && res.data) {
      const timestamp =
        "timestamp" in res.data && typeof res.data.timestamp === "string"
          ? new Date(res.data.timestamp).toLocaleString()
          : new Date().toLocaleString();

      setStatus({
        status: "online",
        lastCheckedAt: timestamp,
      });
    } else {
      setStatus({
        status: "offline",
        lastCheckedAt: null,
      });
    }
  };

  useEffect(() => {
    void checkStatus();
  }, []);

  const isLoading = status.status === "loading";
  const isOnline = status.status === "online";

  return (
    <div className="status-page">
      <div className="status-page-content">
        <section className="status-intro">
          <h2 className="status-intro-title">Pokemon Hotel</h2>
          <p className="status-intro-text">
            A game-inspired hotel booking platform where users can book rooms
            in different biomes and encounter Pokemon cards with varying rarity
            tiers based on their level and role.
          </p>
          <ul className="status-intro-list">
            <li>Book rooms in hotels across beach, mountain, forest, desert & more</li>
            <li>Encounter Pokemon cards with biome-specific spawn rates</li>
            <li>Collect cards with rarity tiers: Common → Legendary</li>
            <li>Level up users to unlock rarer encounters</li>
          </ul>
        </section>

        <section className="status-card">
          <p className="status-title">API Status</p>
          <p
            className={`status-value ${
              isLoading ? "status-loading" : isOnline ? "status-online" : "status-offline"
            }`}
          >
            {isLoading
              ? "Status: Checking..."
              : isOnline
              ? "Status: Online"
              : "Status: Offline"}
          </p>
          {status.lastCheckedAt && (
            <p className="status-meta">Last checked: {status.lastCheckedAt}</p>
          )}
          <button className="primary" type="button" onClick={checkStatus}>
            Refresh status
          </button>
        </section>
      </div>
    </div>
  );
}

function HealthPage() {
  const last = useLastResponse<HealthResponse>();

  const handleCheck = async () => {
    const res = await checkHealth();
    last.update(res);
  };

  return (
    <div className="page">
      <section className="panel">
        <h2>Health</h2>
        <p>Call GET /health to check if the server is running.</p>
        <button className="primary" onClick={handleCheck}>
          Check health
        </button>
      </section>

      <ApiInspector
        title="Health Response"
        lastStatus={last.status}
        lastError={last.error}
        lastData={last.data}
      />
    </div>
  );
}

function AuthPage({
  auth,
  setAuth,
}: {
  auth: AuthState;
  setAuth: (value: AuthState) => void;
}) {
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loginForm, setLoginForm] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const last = useLastResponse<AuthResponse>();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await registerUser(registerForm);
    last.update(res);
    if (res.data && !res.error) {
      const newState: AuthState = {
        token: res.data.token,
        user: res.data.user,
      };
      saveAuthState(newState);
      setAuth(newState);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await loginUser(loginForm);
    last.update(res);
    if (res.data && !res.error) {
      const newState: AuthState = {
        token: res.data.token,
        user: res.data.user,
      };
      saveAuthState(newState);
      setAuth(newState);
    }
  };

  const handleLogout = () => {
    clearAuthState();
    setAuth({ token: null, user: null });
  };

  const isLoggedIn = !!auth.token && !!auth.user;

  return (
    <div className="page">
      <section className="panel">
        <h2>Auth</h2>
        <p>
          Interact with <code>/auth/register</code> and{" "}
          <code>/auth/login</code>. Successful responses store the JWT token and
          user info locally so you can reuse them for future features.
        </p>

        <div className="auth-status">
          <span className="label">Current auth:</span>
          {isLoggedIn ? (
            <span>
              Logged in as <strong>{auth.user?.username}</strong>{" "}
              (<code>{auth.user?.email}</code>) - Role:{" "}
              <strong>{auth.user?.role === "ADMIN" ? "admin" : "Trainer"}</strong>
            </span>
          ) : (
            <span>Not logged in</span>
          )}
          {isLoggedIn && (
            <button
              type="button"
              className="secondary"
              onClick={handleLogout}
            >
              Log out
            </button>
          )}
        </div>

        <div className="two-column">
          <form className="panel" onSubmit={handleLogin}>
            <h3>Login</h3>
            <label className="field">
              <span className="label">Username or email</span>
              <input
                type="text"
                value={loginForm.usernameOrEmail}
                onChange={(e) =>
                  setLoginForm((f) => ({
                    ...f,
                    usernameOrEmail: e.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="field">
              <span className="label">Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((f) => ({ ...f, password: e.target.value }))
                }
                required
              />
            </label>
            <button className="primary" type="submit">
              Login
            </button>
          </form>

          <form className="panel" onSubmit={handleRegister}>
            <h3>Register User</h3>
            <label className="field">
              <span className="label">Username</span>
              <input
                type="text"
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm((f) => ({ ...f, username: e.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span className="label">Email</span>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span className="label">Password</span>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm((f) => ({ ...f, password: e.target.value }))
                }
                required
              />
            </label>
            <button className="primary" type="submit">
              Register
            </button>
          </form>
        </div>
      </section>

      <ApiInspector
        title="Auth Last Response"
        lastStatus={last.status}
        lastError={last.error}
        lastData={last.data}
      />
    </div>
  );
}

function HotelsPage() {
  const last = useLastResponse<Hotel | Hotel[]>();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelId, setHotelId] = useState<string>("");
  const [createForm, setCreateForm] = useState({
    name: "",
    city: "",
    country: "",
    biome: "BEACH",
  });

  const biomes = useMemo(
    () => [
      "BEACH",
      "MOUNTAIN",
      "FOREST",
      "DESERT",
      "OCEAN",
      "GRASSLAND",
      "CAVE",
      "URBAN",
    ],
    []
  );

  const handleListHotels = async () => {
    const res = await listHotels();
    last.update(res);
    if (res.data && Array.isArray(res.data)) {
      setHotels(res.data);
    }
  };

  const handleGetById = async (e: React.FormEvent) => {
    e.preventDefault();
    const idNum = Number(hotelId);
    if (!Number.isFinite(idNum)) {
      last.update({
        status: 400,
        error: "Please enter a valid numeric ID",
        data: null,
      } as any);
      return;
    }
    const res = await getHotelById(idNum);
    last.update(res);
  };

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createHotel(createForm);
    last.update(res);
    if (res.data) {
      setHotels((prev) => [...prev, res.data as Hotel]);
    }
  };

  return (
    <div className="page">
      <section className="panel">
        <h2>Hotels</h2>
        <p>
          Work with the <code>/hotels</code> endpoints. You can list all
          hotels, fetch one by ID, and create new hotels.
        </p>

        <div className="hotels-sections">
        <div className="two-column">
          <div className="panel">
            <h3>List Hotels</h3>
            <button className="primary" onClick={handleListHotels}>
              Fetch all hotels
            </button>
            <ul className="hotel-list">
              {hotels.map((h) => (
                <li key={h.id}>
                  <strong>
                    #{h.id} {h.name}
                  </strong>{" "}
                  – {h.city}, {h.country} ({h.biome})
                </li>
              ))}
              {hotels.length === 0 && <li>No hotels loaded yet.</li>}
            </ul>
          </div>

          <div className="panel">
            <h3>Fetch Hotel By ID</h3>
            <form onSubmit={handleGetById}>
              <label className="field">
                <span className="label">Hotel ID</span>
                <input
                  type="number"
                  value={hotelId}
                  onChange={(e) => setHotelId(e.target.value)}
                  placeholder="e.g. 1"
                />
              </label>
              <button className="secondary" type="submit">
                Fetch
              </button>
            </form>
          </div>
        </div>

        <form className="panel" onSubmit={handleCreateHotel}>
          <h3>Create Hotel</h3>
          <div className="two-column">
            <label className="field">
              <span className="label">Name</span>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span className="label">City</span>
              <input
                type="text"
                value={createForm.city}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, city: e.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span className="label">Country</span>
              <input
                type="text"
                value={createForm.country}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, country: e.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span className="label">Biome</span>
              <select
                value={createForm.biome}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, biome: e.target.value }))
                }
              >
                {biomes.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="primary" type="submit">
            Create Hotel
          </button>
        </form>
        </div>
      </section>

      <ApiInspector
        title="Hotels Last Response"
        lastStatus={last.status}
        lastError={last.error}
        lastData={last.data}
      />
    </div>
  );
}

type PageId = "dashboard" | "health" | "auth" | "hotels";

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard");
  const [auth, setAuth] = useState<AuthState>(() => loadAuthState());
  const isAdmin = auth.user?.role === "ADMIN";

  useEffect(() => {
    if (!auth.token || !auth.user) return;

    const expiresAt = getTokenExpiryMs(auth.token);
    if (!expiresAt) {
      clearAuthState();
      setAuth({ token: null, user: null });
      if (currentPage === "hotels") {
        setCurrentPage("dashboard");
      }
      return;
    }

    const msUntilExpiry = expiresAt - Date.now();
    if (msUntilExpiry <= 0) {
      clearAuthState();
      setAuth({ token: null, user: null });
      if (currentPage === "hotels") {
        setCurrentPage("dashboard");
      }
      return;
    }

    const logoutTimer = window.setTimeout(() => {
      clearAuthState();
      setAuth({ token: null, user: null });
      if (currentPage === "hotels") {
        setCurrentPage("dashboard");
      }
    }, msUntilExpiry);

    return () => window.clearTimeout(logoutTimer);
  }, [auth.token, auth.user, currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case "health":
        return <HealthPage />;
      case "auth":
        return <AuthPage auth={auth} setAuth={setAuth} />;
      case "hotels":
        if (!isAdmin) {
          return (
            <div className="page">
              <section className="panel">
                <h2>Access Denied</h2>
                <p>
                  The Hotels page is available only to users with the admin role.
                  Please log in as an admin to access it.
                </p>
              </section>
            </div>
          );
        }
        return <HotelsPage />;
      case "dashboard":
      default:
        return <StatusPage />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <button
          type="button"
          className="app-brand"
          onClick={() => setCurrentPage("dashboard")}
        >
          Pokemon Hotel
        </button>
        <nav className="nav">
          {isAdmin && (
            <button
              className={currentPage === "hotels" ? "nav-link active" : "nav-link"}
              onClick={() => setCurrentPage("hotels")}
            >
              Hotel
            </button>
          )}
          <button
            type="button"
            className={
              currentPage === "auth" ? "nav-link nav-cta active" : "nav-link nav-cta"
            }
            onClick={() => setCurrentPage("auth")}
          >
            Login / Register
          </button>
        </nav>
      </header>
      <main className="app-main">{renderPage()}</main>
    </div>
  );
}

export default App;
