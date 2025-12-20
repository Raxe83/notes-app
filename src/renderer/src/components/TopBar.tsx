import Logo from '@renderer/assets/Logo'
import { useEditor } from '@renderer/context/EditorContext'

export default function TopBar() {
  const { isFullscreen } = useEditor()

  if (isFullscreen) {
    return null
  }

  return (
    <div className="relative h-8 bg-zinc-200/50 dark:bg-zinc-900 rounded-t-xl flex items-center justify-end px-2 text-white">
      <div
        className="absolute inset-0 mr-28"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />
      <div className="p-4 dark:border-neutral-700 flex-1">
        <div className="flex items-center gap-2">
          {/* Logo mit Farbe */}
          <Logo width={30} color="black" />
          <span className="text-xs text-neutral-900 dark:text-neutral-100 flex flex-row">
            <p>EDIT</p>
            <p className="transform -scale-x-100">R</p>
          </span>
        </div>
      </div>
      <div className="flex gap-1 z-10">
        <WindowButton label="−" onClick={() => window.electron.minimize()} />
        <WindowButton label="▢" onClick={() => window.electron.maximize()} />
        <WindowButton label="✕" danger onClick={() => window.electron.close()} />
      </div>
    </div>
  )
}

function WindowButton({ label, onClick, danger }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-6 rounded-md text-gray-900 dark:text-gray-100 flex items-center justify-center transition ${
        danger ? 'hover:bg-red-500 hover:text-gray-100' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'
      }`}
    >
      {label}
    </button>
  )
}
