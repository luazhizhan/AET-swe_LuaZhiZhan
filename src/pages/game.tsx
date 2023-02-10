import Circle from '@/icons/Circle'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/router'

export default function Game() {
  const router = useRouter()
  return (
    <main className="bg-gray-50 p-6 h-screen flex justify-center items-start">
      <div className="max-w-4xl min-w-[340px] p-4 mt-12 bg-white border border-gray-100 rounded-sm shadow-lg">
        <div className="flex justify-around items-center mb-4 text-2xl">
          <div className="flex flex-col items-center">
            <span className="font-medium pb-1">John</span>
            <Circle width={20} />
          </div>
          <span> vs. </span>
          <div className="flex flex-col items-center">
            <span>Tim</span>
            <XMarkIcon className="w-7" />
          </div>
        </div>
        <span className="text-2xl text-center block mb-5">Your turn!</span>
        <div className="flex justify-center mb-5">
          <section className="grid grid-cols-3 gap-4">
            <span className="border rounded-xl border-teal-500 h-20 w-20"></span>
            <span className="border rounded-xl border-teal-500 h-20 w-20"></span>
            <span className="border rounded-xl border-teal-500 h-20 w-20"></span>

            <span className="border rounded-xl border-teal-500 h-20 w-20"></span>
            <span className="border rounded-xl border-teal-500 h-20 w-20"></span>
            <span className="border rounded-xl border-teal-500 h-20 w-20"></span>

            <span className="border rounded-xl border-teal-500 h-20 w-20"></span>
            <span className="border rounded-xl border-teal-500 h-20 w-20"></span>
            <span className="border rounded-xl border-teal-500 h-20 w-20"></span>
          </section>
        </div>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="text-gray-500 w-full hover:text-white border border-gray-500 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-md text-sm px-5 py-2.5 text-center mr-2 mb-2"
        >
          Leave Room
        </button>
      </div>
    </main>
  )
}
