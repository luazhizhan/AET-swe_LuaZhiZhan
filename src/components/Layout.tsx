type Props = {
  children: JSX.Element
}

export default function Layout(props: Props) {
  const { children } = props
  return (
    <main className="bg-gray-50 p-6 min-h-screen flex justify-center items-start">
      <div className="max-w-4xl min-w-[340px] p-4 mt-2 bg-white border border-gray-100 rounded-sm shadow-lg">
        {children}
      </div>
    </main>
  )
}
