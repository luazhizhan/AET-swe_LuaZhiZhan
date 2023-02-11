import Layout from '@/components/Layout'
import { auth, database } from '@/helpers/firebaseConfig'
import {
  get,
  limitToFirst,
  onChildAdded,
  orderByChild,
  query,
  ref,
  remove,
  set,
} from 'firebase/database'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

type User = {
  playerId: string
  nickname: string
}

export default function Finding() {
  const router = useRouter()
  const [user, setUser] = useState<User | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const gameRef = ref(database, 'games')

  onChildAdded(gameRef, (data) => {
    const game = data.val()
    if (user) {
      if (
        (game.user1Id === user.playerId || game.user2Id === user.playerId) &&
        game.playing === true
      ) {
        router.push('/game/' + data.key)
      }
    }
  })

  useEffect(() => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      router.push('/')
      return
    }
    setUser({
      playerId: currentUser.uid,
      nickname: currentUser.displayName || 'Noname',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser])

  useEffect(() => {
    const readData = async (currentPlayer: User) => {
      const waitingRoomRef = query(
        ref(database, 'waitingRooms/'),
        orderByChild('createdAt'),
        limitToFirst(1)
      )
      const snapshot = await get(waitingRoomRef)
      if (snapshot.exists()) {
        const data = snapshot.val()
        if (data[currentPlayer.playerId]) return
        const opponentId = Object.keys(data)[0]
        const opponent = data[opponentId]
        await set(ref(database, 'games/' + nanoid(8)), {
          user1Id: currentPlayer.playerId,
          user1Nickname: currentPlayer.nickname,
          user1Symbol: 'o',
          user1Status: 'Playing',
          user2Id: opponentId,
          user2Nickname: opponent.nickname,
          user2Symbol: 'x',
          user2Status: 'Playing',
          turn: 'o',
          createdAt: Date.now(),
          state: 'Playing',
          playing: true,
        })
        await remove(ref(database, 'waitingRooms/' + currentPlayer.playerId))
        await remove(ref(database, 'waitingRooms/' + opponentId))
      }
    }

    if (user) {
      readData(user)
    }
  }, [user])

  const onCancelClick = async () => {
    setLoading(true)
    const currentUser = auth.currentUser
    if (currentUser) {
      await remove(ref(database, 'waitingRooms/' + currentUser.uid))
    }
    setLoading(false)
    router.push('/')
  }

  if (!user) return <></>

  return (
    <Layout>
      <>
        <h1
          id="finding-player"
          aria-label="Finding a player..."
          className="mb-2 text-center text-2xl font-medium tracking-tight"
        >
          Finding player...
        </h1>
        <div
          aria-labelledby="finding-player"
          className="animate-bounce mt-14 mb-6 flex justify-center"
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 105 105"
            xmlns="http://www.w3.org/2000/svg"
            fill="#10b981"
          >
            <circle cx="12.5" cy="12.5" r="12.5">
              <animate
                attributeName="fill-opacity"
                begin="0s"
                dur="1s"
                values="1;.2;1"
                calcMode="linear"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="12.5" cy="52.5" r="12.5" fillOpacity=".5">
              <animate
                attributeName="fill-opacity"
                begin="100ms"
                dur="1s"
                values="1;.2;1"
                calcMode="linear"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="52.5" cy="12.5" r="12.5">
              <animate
                attributeName="fill-opacity"
                begin="300ms"
                dur="1s"
                values="1;.2;1"
                calcMode="linear"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="52.5" cy="52.5" r="12.5">
              <animate
                attributeName="fill-opacity"
                begin="600ms"
                dur="1s"
                values="1;.2;1"
                calcMode="linear"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="92.5" cy="12.5" r="12.5">
              <animate
                attributeName="fill-opacity"
                begin="800ms"
                dur="1s"
                values="1;.2;1"
                calcMode="linear"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="92.5" cy="52.5" r="12.5">
              <animate
                attributeName="fill-opacity"
                begin="400ms"
                dur="1s"
                values="1;.2;1"
                calcMode="linear"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="12.5" cy="92.5" r="12.5">
              <animate
                attributeName="fill-opacity"
                begin="700ms"
                dur="1s"
                values="1;.2;1"
                calcMode="linear"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="52.5" cy="92.5" r="12.5">
              <animate
                attributeName="fill-opacity"
                begin="500ms"
                dur="1s"
                values="1;.2;1"
                calcMode="linear"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="92.5" cy="92.5" r="12.5">
              <animate
                attributeName="fill-opacity"
                begin="200ms"
                dur="1s"
                values="1;.2;1"
                calcMode="linear"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>

        <button
          aria-label="Stop finding and go back to home page"
          type="button"
          onClick={onCancelClick}
          disabled={loading}
          className="text-teal-500 w-full hover:text-white border border-teal-500 hover:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-md text-sm px-5 py-2.5 text-center mr-2 mb-2"
        >
          {loading ? 'Cancelling' : 'Cancel'}
        </button>
      </>
    </Layout>
  )
}
