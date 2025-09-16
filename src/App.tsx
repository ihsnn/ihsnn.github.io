import { RecoilRoot } from 'recoil'
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import Routing from './Routing'

function App() {

  return (
    <RecoilRoot>
      <BrowserRouter>
        <Routing/>
      </BrowserRouter>
    </RecoilRoot>
  )
}

export default App
