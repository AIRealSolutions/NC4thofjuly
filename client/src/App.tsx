import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AdminGuard from "./components/AdminGuard";

// Public pages
import Home from "./pages/Home";
import Events from "./pages/Events";
import Heritage from "./pages/Heritage";
import Queens from "./pages/Queens";
import History from "./pages/History";
import Parade from "./pages/Parade";
import ParadeRegister from "./pages/ParadeRegister";
import ParadeRenew from "./pages/ParadeRenew";
import Volunteer from "./pages/Volunteer";
import Committees from "./pages/Committees";

// Live Parade pages
import ParadeLiveBoard from "./pages/parade/ParadeLiveBoard";
import MarshalStart from "./pages/parade/MarshalStart";
import MarshalCheckpoint from "./pages/parade/MarshalCheckpoint";
import UnitTracker from "./pages/parade/UnitTracker";
import MarshalLogin from "./pages/parade/MarshalLogin";
import StagingMarshal from "./pages/parade/StagingMarshal";
import FindMyUnit from "./pages/parade/FindMyUnit";
import ParadeDayControl from "./pages/admin/ParadeDayControl";

// Shriners pages
import ShrinersSignup from "./pages/ShrinersSignup";
import ShrinersRenew from "./pages/ShrinersRenew";
import AdminShriners from "./pages/admin/AdminShriners";

// Admin pages
import AdminMarshalPins from "./pages/admin/AdminMarshalPins";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminParade from "./pages/admin/AdminParade";
import AdminSignups from "./pages/admin/AdminSignups";
import AdminQueens from "./pages/admin/AdminQueens";
import AdminCommittees from "./pages/admin/AdminCommittees";
import AdminHeritage from "./pages/admin/AdminHeritage";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/events" component={Events} />
      <Route path="/heritage" component={Heritage} />
      <Route path="/queens" component={Queens} />
      <Route path="/history" component={History} />
      <Route path="/parade" component={Parade} />
      <Route path="/parade/register" component={ParadeRegister} />
      <Route path="/parade/renew" component={ParadeRenew} />
      <Route path="/parade/shriners" component={ShrinersSignup} />
      <Route path="/parade/shriners/renew" component={ShrinersRenew} />
      <Route path="/volunteer" component={Volunteer} />
      <Route path="/committees" component={Committees} />

      {/* Live Parade Routes — public access for marshals & participants */}
      <Route path="/parade/login" component={MarshalLogin} />
      <Route path="/parade/live" component={ParadeLiveBoard} />
      <Route path="/parade/marshal" component={MarshalStart} />
      <Route path="/parade/checkpoint/:checkpointId" component={MarshalCheckpoint} />
      <Route path="/parade/tracker" component={UnitTracker} />
      <Route path="/parade/staging/:zone" component={StagingMarshal} />
      <Route path="/parade/find" component={FindMyUnit} />

      {/* Admin Routes — all protected by AdminGuard */}
      <Route path="/admin">
        {() => <AdminGuard><AdminDashboard /></AdminGuard>}
      </Route>
      <Route path="/admin/events">
        {() => <AdminGuard><AdminEvents /></AdminGuard>}
      </Route>
      <Route path="/admin/parade">
        {() => <AdminGuard><AdminParade /></AdminGuard>}
      </Route>
      <Route path="/admin/signups">
        {() => <AdminGuard><AdminSignups /></AdminGuard>}
      </Route>
      <Route path="/admin/queens">
        {() => <AdminGuard><AdminQueens /></AdminGuard>}
      </Route>
      <Route path="/admin/committees">
        {() => <AdminGuard><AdminCommittees /></AdminGuard>}
      </Route>
      <Route path="/admin/heritage">
        {() => <AdminGuard><AdminHeritage /></AdminGuard>}
      </Route>
      <Route path="/admin/parade-day">
        {() => <AdminGuard><ParadeDayControl /></AdminGuard>}
      </Route>
      <Route path="/admin/shriners">
        {() => <AdminGuard><AdminShriners /></AdminGuard>}
      </Route>
      <Route path="/admin/marshal-pins">
        {() => <AdminGuard><AdminMarshalPins /></AdminGuard>}
      </Route>

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
