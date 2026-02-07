import { Layout } from './components/layout/layout';
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