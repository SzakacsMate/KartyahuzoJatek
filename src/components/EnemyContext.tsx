import { createContext, useEffect, useState, type ReactNode } from 'react'

let stored=0;
export type EnemyType = {
  id: string
  enemyName: string
  enemyIcon: string
  level: number
  reward: number
  penalty: number
}

export type PlayerType = {
  health: number
  attack: number
  rewards: string[]
  penalties: string[]
}

type FightResult = {
  result: 'win' | 'lose'
  playerRoll: number
  enemyRoll: number
  enemyId: string
  reward?: string
  penalty?: string
}

type EnemyContextType = {
  pool: EnemyType[]
  active: EnemyType[]
  defeated: EnemyType[]
  stored:EnemyType[]
  player: PlayerType
  pickRandomToActive: () => EnemyType | undefined
  pickByIdToActive: (id: string) => EnemyType | undefined
  storedEnemies: (id: string) => void
  markDefeated: (id: string) => void
  fightEnemy: (id: string) => FightResult | undefined
  setPlayer: (p: Partial<PlayerType>) => void
}

const HEART = '❤️'
const SWORD = '⚔️'

export const EnemiesContext = createContext<EnemyContextType>({
  pool: [],
  active: [],
  defeated: [],
  stored:[],
  player: { health: 3, attack: 0, rewards: [], penalties: [] },
  pickRandomToActive: () => undefined,
  pickByIdToActive: () => undefined,
  storedEnemies: () => {},
  markDefeated: () => {},
  fightEnemy: () => undefined,
  setPlayer: () => {}
})

export const EnemyProvider = ({ children }: { children: ReactNode }) => {
  const [pool, setPool] = useState<EnemyType[]>([])
  const [active, setActive] = useState<EnemyType[]>([])
  const [defeated, setDefeated] = useState<EnemyType[]>([])
  const [player, setPlayerState] = useState<PlayerType>({
    health: 3,
    attack: 0,
    rewards: [],
    penalties: []
  })

  useEffect(() => {
    fetch('cards.json')
      .then(r => r.json())
      .then((data: Omit<EnemyType, 'id'>[]) => {
        const list = (Array.isArray(data) ? data : []).map((d, i) => ({
          id: typeof globalThis.crypto?.randomUUID === 'function'
            ? globalThis.crypto.randomUUID()
            : `${Date.now()}-${i}`,
          ...d
        }))
        setPool(list)
      })
      .catch(() => setPool([]))
  }, [])

  const count = (s: string, e: string) => s ? s.split(e).length - 1 : 0
  const removeN = (s: string, e: string, n: number) => {
    let out = s
    while (n > 0 && out.includes(e)) { out = out.replace(e, ''); n-- }
    return out
  }
  const addN = (s: string, e: string, n: number) => s + e.repeat(Math.max(0, n))

  const applyEffectToPlayer = (effect: string, isReward: boolean) => {
    const hearts = 3
    const swords = 0
    setPlayerState(prev => {
      const health = isReward ? addN(prev.health, 3) : removeN(prev.health, 3)
      const attack = isReward ? addN(prev.attack, 0) : removeN(prev.attack, 0)
      return {
        ...prev,
        health,
        attack,
        rewards: isReward ? [effect, ...prev.rewards] : prev.rewards,
        penalties: !isReward ? [effect, ...prev.penalties] : prev.penalties
      }
    })
  }

  const pickRandomToActive = () => {
    if (!pool.length) return undefined
    const idx = Math.floor(Math.random() * pool.length)
    const picked = pool[idx]
    setPool(p => p.filter(x => x.id !== picked.id))
    setActive(a => [picked, ...a])
    return picked
  }

  const pickByIdToActive = (id: string) => {
    const found = pool.find(p => p.id === id)
    if (!found) return undefined
    setPool(p => p.filter(x => x.id !== id))
    setActive(a => [found, ...a])
    return found
  }

  const storedEnemies= (id: string) => {
    const found = active.find(a => a.id === id)
    if (!found) return
    setActive(a => a.filter(x => x.id !== id))
    setPool(p => [found, ...p])
    stored++;
  }

  const markDefeated = (id: string) => {
    const found = active.find(a => a.id === id)
    if (!found) return
    setActive(a => a.filter(x => x.id !== id))
    setDefeated(d => [found, ...d])
  }

  const rollD20 =Math.floor( Math.random()*(20-1))

  const fightEnemy = (id: string): FightResult | undefined => {
    const enemy = active.find(e => e.id === id)
    if (!enemy) return undefined

    const playerAttackMod = rollD20+player.attack;
    const playerRoll = playerAttackMod
    const enemyRoll = rollD20

    if (playerRoll > enemyRoll) {
      markDefeated(id)
      applyEffectToPlayer(enemy.reward, true)
      return { result: 'win', playerRoll, enemyRoll, enemyId: id, reward: enemy.reward }
    }

    if (playerRoll < enemyRoll) {
      setActive(a => a.filter(x => x.id !== id))
      setPool(p => [enemy, ...p])
      
      applyEffectToPlayer(enemy.penalty, false)
      return { result: 'lose', playerRoll, enemyRoll, enemyId: id, penalty: enemy.penalty }
    }

    return undefined
  }

  const setPlayer = (p: Partial<PlayerType>) => setPlayerState(prev => ({ ...prev, ...p }))

  return (
    <EnemiesContext.Provider value={{
      pool, active, defeated,stored, player,
      pickRandomToActive, pickByIdToActive, storedEnemies, markDefeated, fightEnemy, setPlayer
    }}>
      {children}
    </EnemiesContext.Provider>
  )
}