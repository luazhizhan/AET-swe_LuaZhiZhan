import Circle from '@/components/icons/Circle'
import X from '@/components/icons/X'
import Layout from '@/components/Layout'
import { boxPositionAria, Position } from '@/helpers/constant'
import { auth, database } from '@/helpers/firebaseConfig'
import { User } from 'firebase/auth'
import { get, off, onChildChanged, query, ref, update } from 'firebase/database'
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
  playing: boolean
}
type BoxSymbol = 'o' | 'x' | undefined

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

  useEffect(() => {
    onChildChanged(gameRef, (snapshot) => {
      const user = auth.currentUser
      if (!user || !player || !opponent) return
      const data = snapshot.val()
      if (data.user1Id !== player.id && data.user2Id !== player.id) return
      if (data.user1Id !== opponent.id && data.user2Id !== opponent.id) return
      parseGame(user, data)
    })

    return () => {
      off(gameRef, 'child_changed')
    }
  }, [gameRef, player, opponent])

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
        playing: data.playing,
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
        updatedGame.playing = false
        updates['/state'] = winSet
        updates['/playing'] = false
      } else if (checkDraw(updatedGame)) {
        updatedGame.state = 'Draw'
        updatedGame.playing = false
        updates['/state'] = 'Draw'
        updates['/playing'] = false
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
      updates['/playing'] = false
    }
    await update(ref(database, 'games/' + id), updates)
    router.push('/')
  }

  const boxSymbolAria = (position: Position) => {
    if (!game) return 'Empty box'
    const positionLabel = boxPositionAria(position)
    switch (game[position]) {
      case 'o': {
        const user =
          player?.symbol === 'o' ? player?.nickname : opponent?.nickname
        return `${user} with circle symbol at ${positionLabel} of the board`
      }
      case 'x': {
        const user =
          player?.symbol === 'x' ? player?.nickname : opponent?.nickname
        return `${user} with x symbol at ${positionLabel} of the board`
      }
      case undefined:
        return `Empty at ${positionLabel} of the board`
    }
  }

  const nameWithSymbolAriaLabel = (user: 'player' | 'opponent') => {
    if (user === 'player') {
      return `You with ${player?.symbol === 'o' ? 'circle' : 'x'} symbol`
    }
    return `${opponent?.nickname} with ${
      opponent?.symbol === 'o' ? 'circle' : 'x'
    } symbol`
  }

  return (
    <Layout>
      <>
        <section className="flex justify-around items-center mb-4 text-2xl">
          <div
            aria-label={nameWithSymbolAriaLabel('player')}
            className="flex flex-col items-center"
          >
            <h1 className="font-medium">{player?.nickname}</h1>
            {player?.symbol === 'o' ? <Circle width={16} /> : <X width={12} />}
          </div>
          <span> vs. </span>
          <div
            aria-label={nameWithSymbolAriaLabel('opponent')}
            className="flex flex-col items-center"
          >
            <h1>{opponent?.nickname}</h1>
            {opponent?.symbol === 'o' ? (
              <Circle width={16} />
            ) : (
              <X width={12} />
            )}
          </div>
        </section>
        <h2 role="status" className="text-2xl text-center block mb-5">
          {turnText()}
        </h2>

        <section
          aria-label="Tic tac toe board"
          className="flex justify-center mb-5"
        >
          <div className="grid grid-cols-3 gap-4">
            <button
              aria-label={boxSymbolAria('t1')}
              onClick={onBoxClick('t1')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('t1')}
            </button>
            <button
              aria-label={boxSymbolAria('t2')}
              onClick={onBoxClick('t2')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('t2')}
            </button>
            <button
              aria-label={boxSymbolAria('t3')}
              onClick={onBoxClick('t3')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('t3')}
            </button>

            <button
              aria-label={boxSymbolAria('m1')}
              onClick={onBoxClick('m1')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('m1')}
            </button>
            <button
              aria-label={boxSymbolAria('m2')}
              onClick={onBoxClick('m2')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('m2')}
            </button>
            <button
              aria-label={boxSymbolAria('m3')}
              onClick={onBoxClick('m3')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('m3')}
            </button>

            <button
              aria-label={boxSymbolAria('l1')}
              onClick={onBoxClick('l1')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('l1')}
            </button>
            <button
              aria-label={boxSymbolAria('l2')}
              onClick={onBoxClick('l2')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('l2')}
            </button>
            <button
              aria-label={boxSymbolAria('l3')}
              onClick={onBoxClick('l3')}
              className="border rounded-xl flex justify-center border-teal-500 h-20 w-20"
            >
              {showBoxSymbol('l3')}
            </button>
          </div>
        </section>
        <button
          type="button"
          onClick={onLeaveClick}
          className="text-teal-500 w-full hover:text-white border border-teal-500 hover:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-md text-sm px-5 py-2.5 text-center mr-2 mb-2"
        >
          Leave Room
        </button>
      </>
    </Layout>
  )
}
