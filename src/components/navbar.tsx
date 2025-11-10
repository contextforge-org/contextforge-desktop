import React from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons'

export const Navbar: React.FC = () => {
  return <div className="navbar bg-base-100 shadow-sm">
    <div className="flex-1">
      <a className="btn btn-ghost text-base">Context Forge</a>
    </div>
    <div className="flex-none">
      <a className="btn btn-ghost text-base">
        <FontAwesomeIcon icon={faGithub} />
        <span>2.8k</span>
      </a>
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
            <img
              alt="Tailwind CSS Navbar component"
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          </div>
        </div>
        <ul
          tabIndex={-1}
          className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
          <li>
            <a className="justify-between">
              Profile
              <span className="badge">New</span>
            </a>
          </li>
          <li><a>Settings</a></li>
          <li><a>Logout</a></li>
        </ul>
      </div>
    </div>
  </div>
} 
