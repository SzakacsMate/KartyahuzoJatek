import { createContext, useEffect, useState, type ReactNode } from 'react'

type EnemyType = {
    enemyName: string,
    enemyIcon: string,
    level: number,
    reward: string,
    penalty: string
}
type EnemyContextType = {
    jsonData: EnemyType[],
}

export const EnemiesContext = createContext<EnemyContextType>(
    {
        jsonData: []
    }
)

export const EnemyProvider = (props: { children: ReactNode }) => {
    const [jsonData, setJsonData] = useState<EnemyType[]>([])
    useEffect(() => {
        console.log("Hello");
        
        fetch("cards.json")
            .then(res => res.json())
            .then(data => {
                console.log(data)
                
                setJsonData(data)})
    }, [])

    return <EnemiesContext.Provider value={{ jsonData: jsonData }}>
        {props.children}
    </EnemiesContext.Provider>
}

