import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { motion } from 'motion/react';
import Home from './pages/Home.jsx';
import EventDetails from './pages/EventDetails.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pass from './pages/Pass.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import VineDivider from './components/VineDivider.jsx';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-20 bg-canopy-50/85 backdrop-blur border-b border-canopy-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="PrakritiConnect" className="w-9 h-9 rounded-full" />
          <span className="font-display font-semibold text-lg tracking-tight text-canopy-950">
            Prakriti<span className="text-canopy-600">Connect</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-full transition ${isActive('/') ? 'bg-canopy-100 text-canopy-800 font-semibold' : 'text-canopy-900/80 hover:bg-canopy-100/70'}`}
          >
            Explore
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-full transition ${isActive('/dashboard') ? 'bg-canopy-100 text-canopy-800 font-semibold' : 'text-canopy-900/80 hover:bg-canopy-100/70'}`}
            >
              Dashboard
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-2 ml-1">
              <span className="hidden sm:inline text-canopy-900/60 text-xs px-2">{user.name}</span>
              <button onClick={logout} className="btn-outline !px-4 !py-1.5">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link to="/login" className="btn-outline !px-4 !py-1.5">Login</Link>
              <Link to="/signup" className="btn !px-4 !py-1.5">Join in</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-canopy-900 text-white">
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        aria-hidden="true"
      />
      {/* Gradient overlay so the green brand tone + text stay legible over any photo */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-canopy-900/90 via-canopy-800/80 to-canopy-700/70"
        aria-hidden="true"
      />
      <motion.div
        className="relative max-w-6xl mx-auto px-4 pt-12 pb-20 md:pt-16 md:pb-24"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
      >
        <div className="max-w-2xl">
          <span className="tag-leaf-solid !bg-canopy-400 !border-canopy-400 !text-canopy-950">🌱 Volunteer-powered, community-run</span>
          <h1 className="mt-4 font-display text-3xl md:text-5xl font-semibold leading-[1.05] tracking-tight text-balance">
            Grow greener neighbourhoods, one event at a time.
          </h1>
          <p className="mt-4 text-canopy-100/90 text-base md:text-lg max-w-xl">
            Find tree plantations, clean-up drives, and eco workshops near you — or organize your own and rally volunteers who care.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#events" className="btn !bg-white !text-canopy-800 hover:!bg-canopy-100">Find an event</a>
            <Link to="/signup" className="btn-outline !border-white/70 !text-white hover:!bg-white/10">Become an organizer</Link>
          </div>
        </div>
      </motion.div>
      <VineDivider className="text-canopy-50 relative" />
    </section>
  );
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-canopy-50 text-canopy-950 flex flex-col">
      <Navbar />
      <Hero />
      <main id="events" className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full -mt-10">
        {children}
      </main>
      <footer className="mt-10 bg-canopy-950 text-canopy-100">
        <VineDivider flip className="text-canopy-950 bg-canopy-50" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="PrakritiConnect" className="w-8 h-8 rounded-full" />
            <div>
              <div className="font-display font-semibold">PrakritiConnect</div>
              <div className="text-xs text-canopy-300/80">Connecting people to the planet, one event at a time.</div>
            </div>
          </div>
          <p className="text-xs text-canopy-300/70">© {new Date().getFullYear()} PrakritiConnect. Built for volunteers, by volunteers.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            classNames: {
              toast: '!rounded-2xl !border-canopy-100 !shadow-leaf !font-body',
            },
          }}
        />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pass" element={<PrivateRoute roles={["volunteer", "organizer", "admin"]}><Pass /></PrivateRoute>} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute roles={["volunteer", "organizer", "admin"]}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}