function ImportIcon({ className = "w-5 h-5" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none"
      className={className}
    >
      <path 
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7 13l5-5 5 5-1.41 1.41L13 11.83V19h-2v-7.17l-2.59 2.58L7 13z" 
        fill="currentColor"
      />
    </svg>
  )
}

export default ImportIcon