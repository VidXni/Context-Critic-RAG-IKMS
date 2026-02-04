import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Layout>
      <Toaster position="top-right" />
      <Home />
    </Layout>
  );
}

export default App;