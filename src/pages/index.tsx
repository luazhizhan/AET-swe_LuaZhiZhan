import { auth, database } from '@/helpers/firebaseConfig'
import { HashtagIcon, TrophyIcon } from '@heroicons/react/24/solid'
import { signInAnonymously, updateProfile } from 'firebase/auth'
import { ref, remove, set } from 'firebase/database'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'
import CrownIcon from '../icons/Crown'

export default function Home() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)

  const onPlayClick = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setLoading(true)
      if (!auth.currentUser) {
        await signInAnonymously(auth)
      }
      const user = auth.currentUser
      if (!user) throw new Error('Cannot sign in anonymously')

      await updateProfile(user, {
        displayName: nickname,
      })
      await set(ref(database, 'waitingRooms/' + user.uid), {
        nickname,
        createdAt: Date.now(),
      })

      router.push('/finding')
    } catch (error) {
      alert("Couldn't create a new game. Please try again later.")
      const user = auth.currentUser
      if (user) {
        await remove(ref(database, 'waitingRooms/' + user.uid))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-gray-50 p-6 h-screen flex justify-center items-start">
      <div className="max-w-4xl min-w-[340px] p-4 mt-12 bg-white border border-gray-100 rounded-sm shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight">
          Tic Tac Toe
        </h1>

        <h2 className="font-medium flex text-lg justify-start gap-2 items-center">
          <TrophyIcon className="w-4 h-4 text-amber-400" />
          <span>Past Games</span>
        </h2>
        <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />

        <div className="mb-3">
          <button
            aria-label="John verses Tim"
            className="flex mb-2 p-2 gap-2 items-center text-lg w-full hover:bg-gray-50"
          >
            <CrownIcon height={16} width={16} fill={'#fbbf24'} />
            <span className="font-medium">John</span>
            <span>vs.</span>
            <span className="font-medium">Tim</span>
          </button>
          <button
            aria-label="Thomas verses Gary"
            className="flex mb-2 p-2 gap-2 items-center text-lg w-full hover:bg-gray-50"
          >
            <CrownIcon height={16} width={16} fill={'#fbbf24'} />
            <span className="font-medium">Thomas</span>
            <span>vs.</span>
            <span className="font-medium">Gary</span>
          </button>
        </div>

        {/* list of past games results here
        <div className="flex justify-center mb-4">
          <p className="text-gray-500">No games played yet</p>
        </div> */}

        <h2 className="font-medium flex text-lg justify-start gap-2 items-center">
          <HashtagIcon className="w-4 h-4 text-teal-400" />
          <span>Find a game</span>
        </h2>
        <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />

        <form onSubmit={onPlayClick}>
          <div className="mb-2">
            <label
              aria-hidden="true"
              htmlFor="nickname"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Nickname
            </label>
            <input
              aria-label="Enter your nickname"
              aria-required="true"
              required={true}
              type="text"
              id="nickname"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
            />
          </div>
          <button
            aria-label="Start playing"
            type="submit"
            disabled={loading}
            className="w-full focus:outline-none text-white bg-teal-500 hover:bg-teal-600 focus:ring-4 focus:ring-teal-300 font-medium rounded-md text-sm px-5 py-2.5 mb-2"
          >
            {loading ? 'Loading...' : 'Play'}
          </button>
        </form>
      </div>
    </main>
  )
}
