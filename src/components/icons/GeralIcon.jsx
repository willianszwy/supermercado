function GeralIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
      <rect x="9" y="8" width="6" height="1" rx="0.5"/>
      <rect x="9" y="10" width="4" height="1" rx="0.5"/>
      <rect x="9" y="12" width="5" height="1" rx="0.5"/>
      <circle cx="16" cy="9" r="0.5"/>
      <circle cx="15" cy="11" r="0.5"/>
      <circle cx="16" cy="13" r="0.5"/>
    </svg>
  )
}

export default GeralIcon