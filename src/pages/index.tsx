import { TrophyIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/router'
import CrownIcon from '../icons/Crown'

export default function Home() {
  const router = useRouter()
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
          <button className="flex mb-2 p-2 gap-2 items-center text-lg w-full hover:bg-gray-50">
            <CrownIcon height={16} width={16} fill={'#fbbf24'} />
            <span className="font-medium">John</span>
            <span>vs.</span>
            <span className="font-medium">Tim</span>
          </button>
          <button className="flex mb-2 p-2 gap-2 items-center text-lg w-full hover:bg-gray-50">
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

        <button
          type="button"
          onClick={() => router.push('/finding')}
          className="w-full focus:outline-none text-white bg-teal-500 hover:bg-teal-600 focus:ring-4 focus:ring-teal-300 font-medium rounded-md text-sm px-5 py-2.5 mb-2"
        >
          Play
        </button>
      </div>
    </main>
  )
}
