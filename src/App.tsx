import { RecoilRoot } from 'recoil'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Routing from './Routing'
import PokeScanPage from './pokescan/PokeScanPage'
import LandingPage from './landing/LandingPage'

function App() {

  return (
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/pokescan" element={<PokeScanPage/>} />
          <Route path="/gameboy/*" element={<Routing/>} />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  )
}

export default App
