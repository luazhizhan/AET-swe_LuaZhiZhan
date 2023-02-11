import { auth, database } from '@/helpers/firebaseConfig'
import Circle from '@/icons/Circle'
import X from '@/icons/X'
import { User } from 'firebase/auth'
import { get, onChildChanged, query, ref, update } from 'firebase/database'
import { useRouter } from 'next/router'
import { useEffect, useReducer } from 'react'

type Player = {
  id: string
  user: 'user1' | 'user2'
  nickname: string
  symbol: 'o' | 'x'
  status: 'Playing' | 'Left'
}
type Game = {
  t1: BoxSymbol
  t2: BoxSymbol
  t3: BoxSymbol
  m1: BoxSymbol
  m2: BoxSymbol
  m3: BoxSymbol
  l1: BoxSymbol
  l2: BoxSymbol
  l3: BoxSymbol
  turn: 'o' | 'x'
  state: [Position, Position, Position] | 'Draw' | 'Playing' | 'Incomplete'
}
type BoxSymbol = 'o' | 'x' | undefined
type Position = 't1' | 't2' | 't3' | 'm1' | 'm2' | 'm3' | 'l1' | 'l2' | 'l3'

type State = {
  player: Player | undefined
  opponent: Player | undefined
  game: Game | undefined
}

type Action =
  | {
      type: 'SET_PLAYERS'
      player: Player
      opponent: Player
    }
  | {
      type: 'SET_GAME'
      game: Game
    }

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_PLAYERS':
      return { ...state, player: action.player, opponent: action.opponent }
    case 'SET_GAME':
      return { ...state, game: action.game }
  }
}

export default function Game() {
  const router = useRouter()
  const { id } = router.query
  const [state, dispatch] = useReducer(reducer, {
    player: undefined,
    opponent: undefined,
    game: undefined,
  })
  const { player, opponent, game } = state
  const gameRef = query(ref(database, 'games'))

  onChildChanged(gameRef, (snapshot) => {
    const user = auth.currentUser
    if (!user || !player || !opponent) return
    const data = snapshot.val()
    if (data.user1Id !== player.id && data.user2Id !== player.id) return
    if (data.user1Id !== opponent.id && data.user2Id !== opponent.id) return
    parseGame(user, data)
  })

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
      parseGame(user, data)
    }

    const user = auth.currentUser
    if (!user) {
      router.push('/')
      return
    }
    readData(user)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const parseGame = (user: User, data: any) => {
    if (data.user1Id === user.uid) {
      dispatch({
        type: 'SET_PLAYERS',
        player: {
          id: data.user1Id,
          user: 'user1',
          nickname: data.user1Nickname,
          symbol: data.user1Symbol,
          status: data.user1Status,
        },
        opponent: {
          id: data.user2Id,
          user: 'user2',
          nickname: data.user2Nickname,
          symbol: data.user2Symbol,
          status: data.user2Status,
        },
      })
    }

    if (data.user2Id === user.uid) {
      dispatch({
        type: 'SET_PLAYERS',
        player: {
          id: data.user2Id,
          user: 'user2',
          nickname: data.user2Nickname,
          symbol: data.user2Symbol,
          status: data.user2Status,
        },
        opponent: {
          id: data.user1Id,
          user: 'user1',
          nickname: data.user1Nickname,
          symbol: data.user1Symbol,
          status: data.user1Status,
        },
      })
    }
    dispatch({
      type: 'SET_GAME',
      game: {
        t1: data.t1,
        t2: data.t2,
        t3: data.t3,
        m1: data.m1,
        m2: data.m2,
        m3: data.m3,
        l1: data.l1,
        l2: data.l2,
        l3: data.l3,
        turn: data.turn,
        state: data.state,
      },
    })
  }

  const onBoxClick = (position: Position) => async () => {
    if (!player || !opponent || !game) return
    if (game.state === 'Incomplete') return
    if (game.state !== 'Playing') return // someone won or it's a draw
    if (game.turn !== player.symbol) return // it's not your turn
    if (game[position]) return // box is already filled

    const oldGame = game
    try {
      const updates: any = {}
      updates['/' + position] = player.symbol
      updates['/turn'] = game.turn === 'x' ? 'o' : 'x'

      const updatedGame = {
        ...game,
        [position]: player.symbol,
        turn: opponent.symbol,
      }

      const checkWin = (currentGame: Game) => {
        const winSets: [Position, Position, Position][] = [
          ['t1', 't2', 't3'],
          ['m1', 'm2', 'm3'],
          ['l1', 'l2', 'l3'],
          ['t1', 'm1', 'l1'],
          ['t2', 'm2', 'l2'],
          ['t3', 'm3', 'l3'],
          ['t1', 'm2', 'l3'],
          ['t3', 'm2', 'l1'],
        ]
        for (const winSet of winSets) {
          const [a, b, c] = winSet
          if (
            currentGame[a] &&
            currentGame[a] === currentGame[b] &&
            currentGame[a] === currentGame[c]
          ) {
            return winSet
          }
        }
        return undefined
      }

      const checkDraw = (currentGame: Game) => {
        for (const position of [
          't1',
          't2',
          't3',
          'm1',
          'm2',
          'm3',
          'l1',
          'l2',
          'l3',
        ] as Position[]) {
          if (!currentGame[position]) return false
        }
        return true
      }

      // check if someone won or it's a draw
      const winSet = checkWin(updatedGame)
      if (winSet) {
        updatedGame.state = winSet
        updates['/state'] = winSet
      } else if (checkDraw(updatedGame)) {
        updatedGame.state = 'Draw'
        updates['/state'] = 'Draw'
      }

      dispatch({
        type: 'SET_GAME',
        game: updatedGame,
      })

      // update database
      await update(ref(database, 'games/' + id), updates)
    } catch (error) {
      alert('Uh oh! Something went wrong.')
      dispatch({
        type: 'SET_GAME',
        game: oldGame,
      })
    }
  }

  const showBoxSymbol = (position: Position) => {
    if (!game) return <></>

    const fill = (() => {
      if (
        game.state === 'Playing' ||
        game.state === 'Draw' ||
        game.state === 'Incomplete'
      )
        return '#18181b'
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

  const turnText = () => {
    if (!player || !opponent || !game) return ''
    if (game.state === 'Playing' || game.state === 'Incomplete') {
      if (opponent.status === 'Left') return 'Opponent left'
      if (player.status === 'Left') return 'You left'
      if (game.turn === player.symbol) return 'Your turn'
      return "Opponent's turn"
    }
    if (game.state === 'Draw') return 'Draw Game!'
    if (game[game.state[0]] === player.symbol) return 'You won!'
    return 'You lost!'
  }

  const onLeaveClick = async () => {
    if (!player) return
    const updates: any = {}
    const key = player.user === 'user1' ? 'user1Status' : 'user2Status'
    if (game?.state === 'Playing') {
      updates['/' + key] = 'Left'
      updates['/state'] = 'Incomplete'
    }
    await update(ref(database, 'games/' + id), updates)
    router.push('/')
  }

  if (!player || !opponent || !game) return <></>

  return (
    <main className="bg-gray-50 p-6 h-screen flex justify-center items-start">
      <div className="max-w-4xl min-w-[340px] p-4 mt-12 bg-white border border-gray-100 rounded-sm shadow-lg">
        <div className="flex justify-around items-center mb-4 text-2xl">
          <div className="flex flex-col items-center">
            <span className="font-medium">{player.nickname}</span>
            {player.symbol === 'o' ? <Circle width={16} /> : <X width={12} />}
          </div>
          <span> vs. </span>
          <div className="flex flex-col items-center">
            <span>{opponent.nickname}</span>
            {opponent.symbol === 'o' ? <Circle width={16} /> : <X width={12} />}
          </div>
        </div>
        <span className="text-2xl text-center block mb-5">{turnText()}</span>
        <div className="flex justify-center mb-5">
          <section className="grid grid-cols-3 gap-4">
            <button
              onClick={onBoxClick('t1')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('t1')}
            </button>
            <button
              onClick={onBoxClick('t2')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('t2')}
            </button>
            <button
              onClick={onBoxClick('t3')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('t3')}
            </button>

            <button
              onClick={onBoxClick('m1')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('m1')}
            </button>
            <button
              onClick={onBoxClick('m2')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('m2')}
            </button>
            <button
              onClick={onBoxClick('m3')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('m3')}
            </button>

            <button
              onClick={onBoxClick('l1')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('l1')}
            </button>
            <button
              onClick={onBoxClick('l2')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('l2')}
            </button>
            <button
              onClick={onBoxClick('l3')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('l3')}
            </button>
          </section>
        </div>
        <button
          type="button"
          onClick={onLeaveClick}
          className="text-teal-500 w-full hover:text-white border border-teal-500 hover:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-md text-sm px-5 py-2.5 text-center mr-2 mb-2"
        >
          Leave Room
        </button>
      </div>
    </main>
  )
}
