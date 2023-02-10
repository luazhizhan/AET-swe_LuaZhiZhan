import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Finding() {
  const router = useRouter()

  useEffect(() => {
    const id = setTimeout(() => {
      router.push('/game')
    }, 2000)

    return () => {
      clearTimeout(id)
    }
  })

  return (
    <main className="bg-gray-50 p-6 h-screen flex justify-center items-start">
      <div className="max-w-4xl min-w-[340px] p-4 mt-12 bg-white border border-gray-100 rounded-sm shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-medium tracking-tight">
          Finding player...
        </h1>
        <div className="animate-bounce mt-14 mb-6 flex justify-center">
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
          type="button"
          onClick={() => router.push('/')}
          className="text-teal-500 w-full hover:text-white border border-teal-500 hover:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-md text-sm px-5 py-2.5 text-center mr-2 mb-2"
        >
          Cancel
        </button>
      </div>
    </main>
  )
}
