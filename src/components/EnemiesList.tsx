import React, { useContext } from 'react'
import { EnemiesContext } from './EnemyContext'
import Card from './Card'
import { Button } from '@/components/ui/button'

const EnemiesList: React.FC = () => {
  const {
    pool,
    active,
    defeated,
    stored,
    player,
    pickRandomToActive,
    
    storedEnemies,
    markDefeated,
    fightEnemy
  } = useContext(EnemiesContext)

  const onFight = (id: string) => {
    const result = fightEnemy(id)
    if (!result) return
    if (result.result === 'win') {
      alert(`You WON!\nYou: ${result.playerRoll} — Enemy: ${result.enemyRoll}\nReward: ${result.reward ?? '—'}`)
    } else if (result.result === 'lose') {
      alert(`You LOST.\nYou: ${result.playerRoll} — Enemy: ${result.enemyRoll}\nPenalty: ${result.penalty ?? '—'}`)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div>Player HP: {player.health} — Attack: {player.attack}</div>
        <div>Rewards: {player.rewards.join(', ') || '—'}</div>
        <div>Penalties: {player.penalties.join(', ') || '—'}</div>
        <div style={{ marginTop: 8 }}>
          <Button variant="outline" onClick={() => pickRandomToActive()}>Pick random enemy</Button>
        </div>
      </div>

      <h3>Active (to fight)</h3>
      {active.length === 0 && <div>No active enemies</div>}
      <div>
        {active.map(e => (
          <div key={e.id} style={{ marginBottom: 8 }}>
            <Card enemy={e} />
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <Button variant="outline" onClick={() => onFight(e.id)}>Fight</Button>
              <Button variant="outline" onClick={() => markDefeated(e.id)}>Mark defeated</Button>
              <Button variant="outline" onClick={() => storedEnemies(e.id)}>Return to pool</Button>
            </div>
          </div>
        ))}
      </div>

      

      <h3>Defeated</h3>
      {defeated.length === 0 && <div>No defeated enemies</div>}
      <div>
        {defeated.map(e => (
          <div key={e.id} style={{ marginBottom: 6 }}>
            <Card enemy={e} />
          </div>
        ))}
      </div>
      <h3>Stored Enemies</h3>
      {stored.length === 0 && <div>No stored enemies</div>}
      <div>
        {stored.map(e => (
          <div key={e.id} style={{ marginBottom: 6 }}>
            <Card enemy={e} />
          </div>
        ))}
      </div>
    </div>
    
  )
}

export default EnemiesList