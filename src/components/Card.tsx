import { useContext } from 'react'
import { EnemiesContext } from './EnemyContext'

const Card = () => {

  const ctx = useContext(EnemiesContext)

  return (
    <div>
        {ctx && ctx.jsonData && ctx.jsonData.length > 0 && ctx.jsonData[0].enemyName}
    </div>
  )
}

export default Card