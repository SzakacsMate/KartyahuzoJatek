import React, { useContext } from 'react'
import { EnemiesContext, type EnemyType } from './EnemyContext'
import {
  Cards,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
type CardProps = {
  enemy:EnemyType
}

const Card: React.FC<CardProps> = ({enemy}) => {
  return (
    <div>
      
    
    <div className='Card'>
      
      <Cards>
    <CardHeader>
    <CardTitle><h1>{enemy.enemyName}</h1></CardTitle>
    </CardHeader>
    <CardAction><h3>{enemy.enemyIcon}</h3> </CardAction>
    <CardContent>
    <p>{enemy.level}</p>
    <p> {enemy.reward}</p>
    <p>{enemy.penalty}</p>
    </CardContent>
    </Cards>
    </div>
    </div>
  )
}

export default Card