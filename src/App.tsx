
import EnemiesList from "./components/EnemiesList"
import { EnemyProvider } from "./components/EnemyContext"

const App:React.FC = () => {

  return (
    <div>
        <EnemyProvider>
          <EnemiesList />
        </EnemyProvider>
    </div>
  )
}

export default App