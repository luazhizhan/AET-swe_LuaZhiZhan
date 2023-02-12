import Head from 'next/head'

type Props = {
  children: JSX.Element
  title: string
}

export default function Layout(props: Props) {
  const { children, title } = props
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-gray-50 p-6 min-h-screen flex justify-center items-start">
        <div className="max-w-4xl min-w-[340px] p-4 mt-2 bg-white border border-gray-100 rounded-sm shadow-lg">
          {children}
        </div>
      </main>
    </>
  )
}
