import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';
import { ToastViewport } from '@/components/layout/ToastViewport';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useTheme } from '@/hooks/use-theme';

function App() {
  const { theme, toggle } = useTheme();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnimatedBackground />
        <div className="relative flex min-h-screen flex-col">
          <Header theme={theme} onToggleTheme={toggle} />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage theme={theme} onToggleTheme={toggle} />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
        <ToastViewport />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
