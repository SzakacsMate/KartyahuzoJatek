import Card from "./components/Card"
import { EnemyProvider } from "./components/EnemyContext"

const App = () => {

  return (
    <div>
        <EnemyProvider>
          <Card />
        </EnemyProvider>
    </div>
  )
}

export default App