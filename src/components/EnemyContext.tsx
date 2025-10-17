import { createContext, useEffect, useState, type ReactNode } from 'react'

export type EnemyType = {
  id: string
  enemyName: string
  enemyIcon: string
  level: number
  reward: string
  penalty: string
}

export type PlayerType = {
  health: string // hearts, e.g. "❤️❤️"
  attack: string // swords, e.g. "⚔️⚔️"
  rewards: string[] // history of reward strings
  penalties: string[] // history of penalty strings
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
  player: PlayerType
  pickRandomToActive: () => EnemyType | undefined
  pickByIdToActive: (id: string) => EnemyType | undefined
  returnToPool: (id: string) => void
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
  player: { health: HEART + HEART + HEART, attack: SWORD, rewards: [], penalties: [] },
  pickRandomToActive: () => undefined,
  pickByIdToActive: () => undefined,
  returnToPool: () => {},
  markDefeated: () => {},
  fightEnemy: () => undefined,
  setPlayer: () => {}
})

export const EnemyProvider = ({ children }: { children: ReactNode }) => {
  const [pool, setPool] = useState<EnemyType[]>([])
  const [active, setActive] = useState<EnemyType[]>([])
  const [defeated, setDefeated] = useState<EnemyType[]>([])
  const [player, setPlayerState] = useState<PlayerType>({
    health: HEART + HEART + HEART,
    attack: SWORD,
    rewards: [],
    penalties: []
  })

  useEffect(() => {
    fetch('cards.json')
      .then(res => res.json())
      .then((data: Omit<EnemyType, 'id'>[]) => {
        const withIds = (Array.isArray(data) ? data : []).map((d, i) => ({
          id: typeof globalThis.crypto?.randomUUID === 'function'
            ? globalThis.crypto.randomUUID()
            : `${Date.now()}-${i}`,
          ...d
        }))
        setPool(withIds)
      })
      .catch(() => setPool([]))
  }, [])

  const countEmoji = (s: string, emoji: string) =>
    s ? s.split(emoji).length - 1 : 0

  const removeNEmoji = (s: string, emoji: string, n: number) => {
    let out = s
    while (n > 0 && out.includes(emoji)) {
      out = out.replace(emoji, '')
      n--
    }
    return out
  }

  const addNEmoji = (s: string, emoji: string, n: number) =>
    s + emoji.repeat(Math.max(0, n))

  // apply a reward or penalty string to player: count hearts and swords in the effect string
  const applyEffectToPlayer = (effect: string, isReward: boolean) => {
    const hearts = countEmoji(effect, HEART)
    const swords = countEmoji(effect, SWORD)

    setPlayerState(prev => {
      let newHealth = prev.health
      let newAttack = prev.attack
      if (isReward) {
        if (hearts > 0) newHealth = addNEmoji(newHealth, HEART, hearts)
        if (swords > 0) newAttack = addNEmoji(newAttack, SWORD, swords)
        return { ...prev, health: newHealth, attack: newAttack, rewards: [effect, ...prev.rewards] }
      } else {
        if (hearts > 0) newHealth = removeNEmoji(newHealth, HEART, hearts)
        if (swords > 0) newAttack = removeNEmoji(newAttack, SWORD, swords)
        return { ...prev, health: newHealth, attack: newAttack, penalties: [effect, ...prev.penalties] }
      }
    })
  }

  const pickRandomToActive = () => {
    if (pool.length === 0) return undefined
    const idx = Math.floor(Math.random() * pool.length)
    const picked = pool[idx]
    setPool(p => p.filter(e => e.id !== picked.id))
    setActive(a => [picked, ...a])
    return picked
  }

  const pickByIdToActive = (id: string) => {
    const found = pool.find(p => p.id === id)
    if (!found) return undefined
    setPool(p => p.filter(e => e.id !== id))
    setActive(a => [found, ...a])
    return found
  }

  const returnToPool = (id: string) => {
    const found = active.find(a => a.id === id)
    if (!found) return
    setActive(a => a.filter(x => x.id !== id))
    setPool(p => [found, ...p])
  }

  const markDefeated = (id: string) => {
    const found = active.find(a => a.id === id)
    if (!found) return
    setActive(a => a.filter(x => x.id !== id))
    setDefeated(d => [found, ...d])
  }

  const rollD20 = (mod = 0) => Math.floor(Math.random() * 20) + 1 + mod

  const fightEnemy = (id: string): FightResult | undefined => {
    const enemy = active.find(e => e.id === id)
    if (!enemy) return undefined

    // derive numeric attack modifier from count of swords in player's attack string
    const playerAttackMod = countEmoji(player.attack, SWORD)
    const playerRoll = rollD20(playerAttackMod)
    const enemyRoll = rollD20(enemy.level)

    if (playerRoll > enemyRoll) {
      // win
      markDefeated(id)
      applyEffectToPlayer(enemy.reward, true) // reward strings modify player's heart/sword strings
      return { result: 'win', playerRoll, enemyRoll, enemyId: id, reward: enemy.reward }
    }

    if (playerRoll < enemyRoll) {
      // lose
      // return enemy to pool and apply penalty
      setActive(a => a.filter(x => x.id !== id))
      setPool(p => [enemy, ...p])
      applyEffectToPlayer(enemy.penalty, false)
      return { result: 'lose', playerRoll, enemyRoll, enemyId: id, penalty: enemy.penalty }
    }

    // draw
    
  }

  const setPlayer = (p: Partial<PlayerType>) => {
    setPlayerState(prev => ({ ...prev, ...p }))
  }

  return (
    <EnemiesContext.Provider value={{
      pool,
      active,
      defeated,
      player,
      pickRandomToActive,
      pickByIdToActive,
      returnToPool,
      markDefeated,
      fightEnemy,
      setPlayer
    }}>
      {children}
    </EnemiesContext.Provider>
  )
}