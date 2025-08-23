function MerceariaIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V6H20V18Z"/>
      <rect x="6" y="8" width="3" height="8" rx="0.5"/>
      <rect x="10.5" y="8" width="3" height="8" rx="0.5"/>
      <rect x="15" y="8" width="3" height="8" rx="0.5"/>
      <circle cx="7.5" cy="10" r="0.3"/>
      <circle cx="12" cy="10" r="0.3"/>
      <circle cx="16.5" cy="10" r="0.3"/>
    </svg>
  )
}

export default MerceariaIcon