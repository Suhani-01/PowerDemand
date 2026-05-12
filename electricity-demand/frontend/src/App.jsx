import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Prediction from './pages/Prediction'
import About from './pages/About' 
import Regions from './pages/Regions'
import './index.css'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mt-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<Prediction />} />
          <Route path="/about" element={<About />} /> 
          <Route path="/regions" element={<Regions />} />
        </Routes>
      </main>
    </div>
  )
}
