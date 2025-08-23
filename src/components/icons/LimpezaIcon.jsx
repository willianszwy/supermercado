function LimpezaIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.5 1C8.67 1 8 1.67 8 2.5S8.67 4 9.5 4S11 3.33 11 2.5S10.33 1 9.5 1ZM10.5 5H8.5C7.67 5 7 5.67 7 6.5V8H12V6.5C12 5.67 11.33 5 10.5 5ZM7 9V21C7 21.55 7.45 22 8 22H11C11.55 22 12 21.55 12 21V9H7ZM14 2V4H20V6H18V20C18 21.1 17.1 22 16 22H13V20H16V6H14V8H12V2H14Z"/>
      <circle cx="9.5" cy="12" r="0.5"/>
      <circle cx="9.5" cy="15" r="0.5"/>
      <circle cx="9.5" cy="18" r="0.5"/>
    </svg>
  )
}

export default LimpezaIcon