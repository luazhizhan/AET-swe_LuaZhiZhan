import Circle from '@/components/icons/Circle'
import X from '@/components/icons/X'
import Layout from '@/components/Layout'
import { auth, database } from '@/helpers/firebaseConfig'
import { User } from 'firebase/auth'
import { get, query, ref } from 'firebase/database'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

type Game = {
  user1Id: string
  user1Nickname: string
  user1Symbol: 'o' | 'x'
  user2Id: string
  user2Nickname: string
  user2Symbol: 'o' | 'x'
  t1: BoxSymbol
  t2: BoxSymbol
  t3: BoxSymbol
  m1: BoxSymbol
  m2: BoxSymbol
  m3: BoxSymbol
  l1: BoxSymbol
  l2: BoxSymbol
  l3: BoxSymbol
  state: [Position, Position, Position] | 'Draw' | 'Incomplete'
}

type BoxSymbol = 'o' | 'x' | undefined
type Position = 't1' | 't2' | 't3' | 'm1' | 'm2' | 'm3' | 'l1' | 'l2' | 'l3'

export default function PastGame() {
  const router = useRouter()
  const { id } = router.query
  const [game, setGame] = useState<Game | undefined>()

  useEffect(() => {
    const readData = async (user: User) => {
      if (!id || typeof id !== 'string') {
        router.push('/')
        return
      }
      const snapshot = await get(query(ref(database, 'games/' + id)))
      if (!snapshot.exists()) {
        router.push('/')
        return
      }
      const data = snapshot.val()
      if (data.user1Id !== user.uid && data.user2Id !== user.uid) {
        router.push('/')
        return
      }
      setGame({
        user1Id: data.user1Id,
        user1Nickname: data.user1Nickname,
        user1Symbol: data.user1Symbol,
        user2Id: data.user2Id,
        user2Nickname: data.user2Nickname,
        user2Symbol: data.user2Symbol,
        t1: data.t1,
        t2: data.t2,
        t3: data.t3,
        m1: data.m1,
        m2: data.m2,
        m3: data.m3,
        l1: data.l1,
        l2: data.l2,
        l3: data.l3,
        state: data.state,
      })
    }

    const user = auth.currentUser
    if (!user) {
      router.push('/')
      return
    }
    readData(user)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stateText = () => {
    if (!game) return ''
    switch (game.state) {
      case 'Incomplete':
        return 'Incomplete Game!'
      case 'Draw':
        return 'Draw Game!'
      default: {
        if (game[game.state[0]] === game.user1Symbol) {
          return `${game.user1Nickname} Won!`
        }
        return `${game.user2Nickname} Won!`
      }
    }
  }

  const showBoxSymbol = (position: Position) => {
    if (!game) return <></>
    const fill = (() => {
      if (game.state === 'Draw' || game.state === 'Incomplete') return '#18181b'
      if (game.state.includes(position)) return '#14b8a6'
      return '#18181b'
    })()
    switch (game[position]) {
      case 'o':
        return <Circle width={70} fill={fill} />
      case 'x':
        return <X width={60} fill={fill} />
      case undefined:
        return <></>
    }
  }

  return (
    <Layout>
      <>
        <div className="flex justify-around items-center mb-4 text-2xl">
          <div className="flex flex-col items-center">
            <span className="font-medium">{game?.user1Nickname}</span>
            {game?.user1Symbol === 'o' ? (
              <Circle width={16} />
            ) : (
              <X width={12} />
            )}
          </div>
          <span> vs. </span>
          <div className="flex flex-col items-center">
            <span>{game?.user2Nickname}</span>
            {game?.user2Symbol === 'o' ? (
              <Circle width={16} />
            ) : (
              <X width={12} />
            )}
          </div>
        </div>
        <span className="text-2xl text-center block mb-5">{stateText()}</span>
        <div className="flex justify-center mb-5">
          <section className="grid grid-cols-3 gap-4">
            <button className="border rounded-xl flex justify-center border-teal-500 h-20 w-20">
              {showBoxSymbol('t1')}
            </button>
            <button className="border rounded-xl flex justify-center border-teal-500 h-20 w-20">
              {showBoxSymbol('t2')}
            </button>
            <button className="border rounded-xl flex justify-center border-teal-500 h-20 w-20">
              {showBoxSymbol('t3')}
            </button>

            <button className="border rounded-xl flex justify-center border-teal-500 h-20 w-20">
              {showBoxSymbol('m1')}
            </button>
            <button className="border rounded-xl flex justify-center border-teal-500 h-20 w-20">
              {showBoxSymbol('m2')}
            </button>
            <button className="border rounded-xl flex justify-center border-teal-500 h-20 w-20">
              {showBoxSymbol('m3')}
            </button>

            <button className="border rounded-xl flex justify-center border-teal-500 h-20 w-20">
              {showBoxSymbol('l1')}
            </button>
            <button className="border rounded-xl flex justify-center border-teal-500 h-20 w-20">
              {showBoxSymbol('l2')}
            </button>
            <button className="border rounded-xl flex justify-center border-teal-500 h-20 w-20">
              {showBoxSymbol('l3')}
            </button>
          </section>
        </div>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="text-teal-500 w-full hover:text-white border border-teal-500 hover:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-md text-sm px-5 py-2.5 text-center mr-2 mb-2"
        >
          Back Home
        </button>
      </>
    </Layout>
  )
}
