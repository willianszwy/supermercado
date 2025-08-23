function BebidasIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 2V4H6V20C6 21.1 6.9 22 8 22H16C17.1 22 18 21.1 18 20V4H19V2H5ZM8 4H16V20H8V4ZM10 6V18H12V6H10ZM13 6V10H15V6H13ZM9 12V16H11V12H9Z"/>
      <path d="M6 2H18V3H6V2Z" opacity="0.5"/>
      <ellipse cx="12" cy="8" rx="2" ry="1" opacity="0.3"/>
      <ellipse cx="12" cy="14" rx="1.5" ry="0.5" opacity="0.3"/>
    </svg>
  )
}

export default BebidasIcon