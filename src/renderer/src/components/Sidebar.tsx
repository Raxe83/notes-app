import React from 'react'
import Logo from '../assets/Logo'
import FolderViewer from './Workspaces'
import { useEditor } from '@renderer/context/EditorContext'

export default function Sidebar() {
  const { isSidebarOpen } = useEditor()

  return (
    <div
      className={`border-r transition-all duration-300 bg-neutral-100 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 ${
        isSidebarOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div className="z-20">
            <Logo color="black" />
          </div>
          <span className="font-semibold text-xl text-neutral-900 dark:text-neutral-100 flex flex-row">
            <p>EDIT</p>
            <p className="transform -scale-x-100">R</p>
          </span>
        </div>
      </div>
      <FolderViewer />
    </div>
  )
}