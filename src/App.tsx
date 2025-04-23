import { BrowserRouter as Router } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Routes } from './Routes';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes />
      </MainLayout>
    </Router>
  );
}

export default App;
